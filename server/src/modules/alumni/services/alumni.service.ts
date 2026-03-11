import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AlumniProfile } from '../models/alumni-profile.model';
import { Promotion } from '../models/promotion.model';
import { User } from '../../users/models/user.model';
import { Sequelize } from 'sequelize-typescript';
import { UpdateAlumniDto } from '../dto/update-alumni.dto';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Op, WhereOptions } from 'sequelize';
import { ScrapingService } from '../../scraping/services/scraping.service';
import { AlumniExperience } from '../models/alumni-experience.model';

interface ProfileYear {
  promo_year: number;
}

interface CsvRow {
  Nom: string;
  Prénom: string;
  Email: string;
  'URL Linkedin': string;
  'Année de diplôme': string;
  'Quel diplôme': string;
}

@Injectable()
export class AlumniService {
  constructor(
    @InjectModel(AlumniProfile)
    private alumniProfileModel: typeof AlumniProfile,
    @InjectModel(Promotion)
    private promotionModel: typeof Promotion,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(AlumniExperience)
    private alumniExperienceModel: typeof AlumniExperience,
    private sequelize: Sequelize,
    private scrapingService: ScrapingService,
  ) {}

  async findAllPromos() {
    // Synchronisation automatique : récupérer toutes les années uniques présentes chez les alumni
    const yearsInProfiles = (await this.alumniProfileModel.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('promo_year')), 'promo_year']],
      raw: true,
    })) as unknown as ProfileYear[];

    for (const profile of yearsInProfiles) {
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

  async findByYear(year: number, userRole?: string, search?: string, currentUserId?: string, diploma?: string) {
    const isAlumni = userRole === 'ALUMNI';

    const where: WhereOptions = { promo_year: year };

    if (isAlumni && currentUserId) {
      where.user_id = { [Op.ne]: currentUserId };
    }

    if (diploma) {
      where.diploma = diploma;
    }

    if (search) {
      where[Op.or as any] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { current_position: { [Op.like]: `%${search}%` } },
      ];
    }

    return this.alumniProfileModel.findAll({
      where,
      attributes: isAlumni
        ? ['id', 'user_id', 'first_name', 'last_name', 'current_position', 'company', 'promo_year', 'diploma', 'linkedin_url']
        : [
            'id',
            'user_id',
            'first_name',
            'last_name',
            'current_position',
            'company',
            'promo_year',
            'diploma',
            'linkedin_url',
            'status',
            'data_enriched',
            'scraping_status',
          ],
      include: isAlumni ? [] : [{ model: User, attributes: ['id', 'email', 'is_active'] }, { model: AlumniExperience }],
      order: [['last_name', 'ASC']],
    });
  }

  async getDistinctDiplomasByYear(year: number) {
    const result = await this.alumniProfileModel.findAll({
      where: { promo_year: year },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('diploma')), 'diploma']],
      raw: true,
    });
    return result.map((r: any) => r.diploma).filter((d) => !!d);
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
    const results: CsvRow[] = [];
    const stream = Readable.from(fileBuffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (data: CsvRow) => results.push(data))
        .on('end', async () => {
          const transaction = await this.sequelize.transaction();
          const alumniToScrape: { id: string; url: string }[] = [];
          try {
            const summary = {
              success: 0,
              failed: 0,
              errorDetails: [] as string[],
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

                let profile: AlumniProfile;
                if (!created) {
                  // Update existing profile if it exists
                  const existingProfile = await this.alumniProfileModel.findOne({
                    where: { user_id: user.id },
                    transaction,
                  });

                  if (existingProfile) {
                    profile = await existingProfile.update(
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

  async getLinkedinUrls(year: number) {
    const profiles = await this.alumniProfileModel.findAll({
      where: { promo_year: year },
      attributes: ['linkedin_url'],
    });

    return {
      profileUrls: profiles
        .map((p) => p.linkedin_url)
        .filter((url) => !!url && url.trim() !== ''),
    };
  }

  async importScrapedData(scrapedData: any[]) {
    const summary = { updated: 0, skipped: 0 };

    for (const item of scrapedData) {
      const url = item.linkedinUrl || item.linkedinPublicUrl;
      if (!url) {
        summary.skipped++;
        continue;
      }

      const profile = await this.alumniProfileModel.findOne({
        where: { linkedin_url: url },
      });

      if (profile) {
        const transaction = await this.sequelize.transaction();
        try {
          // Extraction des expériences adaptée au format Apify fourni
          const experiencesData = (item.experiences || []).map((exp: any) => {
            // Tentative de parsing des dates simpliste pour le format DATEONLY
            // On utilise is_current si end_date est absente ou "Present"
            const startDate = exp.jobStartedOn ? new Date(exp.jobStartedOn).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const isCurrent = !exp.jobEndedOn || exp.jobStillWorking;
            const endDate = (!isCurrent && exp.jobEndedOn) ? new Date(exp.jobEndedOn).toISOString().split('T')[0] : null;

            return {
              alumni_id: profile.id,
              title: exp.title || 'Inconnu',
              company: exp.companyName || exp.company || 'Inconnu',
              start_date: startDate,
              end_date: endDate,
              is_current: isCurrent,
            };
          });

          // Supprimer les anciennes expériences avant d'ajouter les nouvelles
          await this.alumniExperienceModel.destroy({
            where: { alumni_id: profile.id },
            transaction,
          });

          // Créer les nouvelles expériences
          if (experiencesData.length > 0) {
            await this.alumniExperienceModel.bulkCreate(experiencesData, { transaction });
          }

          await profile.update(
            {
              current_position: item.jobTitle || item.headline || profile.current_position,
              company: item.companyName || item.company || profile.company,
              data_enriched: true,
              last_scraped_at: new Date(),
              scraping_status: 'COMPLETED',
            },
            { transaction },
          );

          await transaction.commit();
          summary.updated++;
        } catch (error) {
          await transaction.rollback();
          console.error(`Erreur lors de la mise à jour du profil ${url}:`, error);
          summary.skipped++;
        }
      } else {
        summary.skipped++;
      }
    }

    return summary;
  }
}
