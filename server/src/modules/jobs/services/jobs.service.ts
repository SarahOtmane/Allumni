import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobOffer } from '../models/job-offer.model';
import { CreateJobDto } from '../dto/create-job.dto';
import { User } from '../../users/models/user.model';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobOffer)
    private jobOfferModel: typeof JobOffer,
  ) {}

  async create(createJobDto: CreateJobDto, authorId: string) {
    return this.jobOfferModel.create({
      ...createJobDto,
      author_id: authorId,
    });
  }

  async findAll() {
    return this.jobOfferModel.findAll({
      include: [{ model: User, attributes: ['id', 'email'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: string) {
    return this.jobOfferModel.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'email'] }],
    });
  }

  async remove(id: string) {
    const job = await this.findOne(id);
    await job.destroy();
    return { message: 'Offre supprimée avec succès' };
  }
}
