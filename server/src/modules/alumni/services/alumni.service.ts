import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AlumniProfile } from '../models/alumni-profile.model';
import { Promotion } from '../models/promotion.model';
import { User } from '../../users/models/user.model';
import { Sequelize } from 'sequelize-typescript';
import { UpdateAlumniDto } from '../dto/update-alumni.dto';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Op } from 'sequelize';
import { ScrapingService } from '../../scraping/services/scraping.service';
import { AlumniExperience } from '../models/alumni-experience.model';

@Injectable()
export class AlumniService {
  constructor(
    @InjectModel(AlumniProfile)
    private alumniProfileModel: typeof AlumniProfile,
    @InjectModel(Promotion)
    private promotionModel: typeof Promotion,
    @InjectModel(User)
    private userModel: typeof User,
    private sequelize: Sequelize,
    private scrapingService: ScrapingService,
  ) {}

  async findAllPromos() {
    // Synchronisation automatique : récupérer toutes les années uniques présentes chez les alumni
    const yearsInProfiles = await this.alumniProfileModel.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('promo_year')), 'promo_year']],
      raw: true,
    });

    for (const profile of yearsInProfiles as any[]) {
      const year = profile.promo_year;
      if (year) {
        await this.promotionModel.findOrCreate({
          where: { year },
        });
      }
    }

    return this.promotionModel.findAll({ order: [['year', 'DESC']] });
  }

  async createPromo(year: number) {
    return this.promotionModel.create({ year });
  }

  async findByYear(year: number, userRole?: string, search?: string, currentUserId?: string) {
    const isAlumni = userRole === 'ALUMNI';

    const where: any = { promo_year: year };

    if (isAlumni && currentUserId) {
      where.user_id = { [Op.ne]: currentUserId };
    }

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { current_position: { [Op.like]: `%${search}%` } },
      ];
    }

    return this.alumniProfileModel.findAll({
      where,
      attributes: isAlumni ? ['id', 'user_id', 'first_name', 'last_name', 'current_position', 'promo_year'] : undefined,
      include: isAlumni
        ? []
        : [
            { model: User, attributes: ['id', 'email', 'is_active'] },
            { model: AlumniExperience },
          ],
      order: [['last_name', 'ASC']],
    });
  }

  async findOne(id: string) {
    const profile = await this.alumniProfileModel.findByPk(id, {
      include: [User, AlumniExperience],
    });
    if (!profile) {
      throw new NotFoundException(`Profil Alumni avec l'ID ${id} non trouvé`);
    }
    return profile;
  }

  async update(id: string, updateDto: UpdateAlumniDto) {
    const profile = await this.findOne(id);
    const transaction = await this.sequelize.transaction();

    try {
      // Update email in User model if provided
      if (updateDto.email) {
        await this.userModel.update({ email: updateDto.email }, { where: { id: profile.user_id }, transaction });
      }

      // Update profile fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...profileData } = updateDto;
      await profile.update(profileData, { transaction });

      await transaction.commit();
      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async remove(id: string) {
    const profile = await this.findOne(id);
    const transaction = await this.sequelize.transaction();

    try {
      // Delete profile first
      await profile.destroy({ transaction });
      // Delete associated user
      await this.userModel.destroy({ where: { id: profile.user_id }, transaction });

      await transaction.commit();
      return { message: 'Étudiant supprimé avec succès' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async importCsv(year: number, fileBuffer: Buffer) {
    const results = [];
    const stream = Readable.from(fileBuffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          const transaction = await this.sequelize.transaction();
          const alumniToScrape = [];
          try {
            const summary = {
              success: 0,
              failed: 0,
              errorDetails: [],
            };

            for (const row of results) {
              const Nom = row['Nom']?.trim();
              const Prénom = row['Prénom']?.trim();
              const Email = row['Email']?.trim();
              const linkedin = row['URL Linkedin']?.trim();
              const graduationYearStr = row['Année de diplôme']?.trim();
              const diploma = row['Quel diplôme']?.trim();

              const graduationYear = parseInt(graduationYearStr);

              // Validation: L'année doit correspondre à la promotion cible
              if (graduationYear !== year) {
                summary.failed++;
                summary.errorDetails.push(
                  `Ligne sautée: L'année ${graduationYearStr} ne correspond pas à la promo cible ${year} (Email: ${Email})`,
                );
                continue;
              }

              try {
                // Create or Find User
                const [user, created] = await this.userModel.findOrCreate({
                  where: { email: Email },
                  defaults: {
                    role: 'ALUMNI',
                    is_active: false,
                  },
                  transaction,
                });

                let profile;
                if (!created) {
                  // Update existing profile if it exists
                  profile = await this.alumniProfileModel.findOne({
                    where: { user_id: user.id },
                    transaction,
                  });

                  if (profile) {
                    await profile.update(
                      {
                        first_name: Prénom,
                        last_name: Nom,
                        promo_year: year,
                        diploma: diploma,
                        linkedin_url: linkedin,
                      },
                      { transaction },
                    );
                  } else {
                    profile = await this.alumniProfileModel.create(
                      {
                        user_id: user.id,
                        first_name: Prénom,
                        last_name: Nom,
                        promo_year: year,
                        diploma: diploma,
                        linkedin_url: linkedin,
                      },
                      { transaction },
                    );
                  }
                } else {
                  // Create Profile for new user
                  profile = await this.alumniProfileModel.create(
                    {
                      user_id: user.id,
                      first_name: Prénom,
                      last_name: Nom,
                      promo_year: year,
                      diploma: diploma,
                      linkedin_url: linkedin,
                    },
                    { transaction },
                  );
                }

                if (linkedin) {
                  alumniToScrape.push({ id: profile.id, url: linkedin });
                }

                summary.success++;
              } catch (err) {
                summary.failed++;
                summary.errorDetails.push(`Erreur technique pour ${Email}: ${err.message}`);
              }
            }

            await transaction.commit();

            // Trigger scraping jobs after transaction commit
            for (const item of alumniToScrape) {
              await this.scrapingService.addScrapingJob(item.id, item.url);
            }

            resolve(summary);
          } catch (error) {
            await transaction.rollback();
            reject(error);
          }
        });
    });
  }
}
