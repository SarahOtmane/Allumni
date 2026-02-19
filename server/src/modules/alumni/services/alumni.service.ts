import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AlumniProfile } from '../models/alumni-profile.model';
import { Promotion } from '../models/promotion.model';
import { User } from '../../users/models/user.model';
import { Sequelize } from 'sequelize-typescript';
import { UpdateAlumniDto } from '../dto/update-alumni.dto';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

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
  ) {}

  async findAllPromos() {
    return this.promotionModel.findAll({ order: [['year', 'DESC']] });
  }

  async createPromo(year: number) {
    return this.promotionModel.create({ year });
  }

  async findByYear(year: number) {
    return this.alumniProfileModel.findAll({
      where: { promo_year: year },
      include: [{ model: User, attributes: ['id', 'email', 'is_active'] }],
      order: [['last_name', 'ASC']],
    });
  }

  async findOne(id: string) {
    const profile = await this.alumniProfileModel.findByPk(id, {
      include: [User],
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
          try {
            const summary = {
              success: 0,
              failed: 0,
              errorDetails: [],
            };

            for (const row of results) {
              const {
                Nom,
                Prénom,
                Email,
                'URL Linkedin': linkedin,
                'Année de diplôme': graduationYear,
                'Quel diplôme': diploma,
              } = row;

              // Validation: Year match
              if (parseInt(graduationYear) !== year) {
                summary.failed++;
                summary.errorDetails.push(
                  `Ligne sautée: L'année ${graduationYear} ne correspond pas à la promo ${year} (Email: ${Email})`,
                );
                continue;
              }

              try {
                // Create User
                const [user, created] = await this.userModel.findOrCreate({
                  where: { email: Email },
                  defaults: {
                    role: 'ALUMNI',
                    is_active: false,
                  },
                  transaction,
                });

                if (!created) {
                  summary.failed++;
                  summary.errorDetails.push(`Ligne sautée: L'email ${Email} existe déjà.`);
                  continue;
                }

                // Create Profile
                await this.alumniProfileModel.create(
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

                summary.success++;
              } catch (err) {
                summary.failed++;
                summary.errorDetails.push(`Erreur technique pour ${Email}: ${err.message}`);
              }
            }

            await transaction.commit();
            resolve(summary);
          } catch (error) {
            await transaction.rollback();
            reject(error);
          }
        });
    });
  }
}
