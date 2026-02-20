import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JobOffer } from '../models/job-offer.model';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { User } from '../../users/models/user.model';
import { Op } from 'sequelize';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/models/notification.model';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobOffer)
    private jobOfferModel: typeof JobOffer,
    private notificationsService: NotificationsService,
  ) {}

  async create(createJobDto: CreateJobDto, authorId: string) {
    const job = await this.jobOfferModel.create({
      ...createJobDto,
      author_id: authorId,
    });

    await this.notificationsService.notifyAllAlumni(
      NotificationType.JOB,
      "Nouvelle offre d'emploi",
      `${job.company} recrute : ${job.title}`,
      job.id,
    );

    return job;
  }

  async findAll(filters?: { title?: string; location?: string; sort?: 'ASC' | 'DESC' }) {
    const where: any = {};

    if (filters?.title) {
      where.title = { [Op.like]: `%${filters.title}%` };
    }

    if (filters?.location) {
      where.location = { [Op.like]: `%${filters.location}%` };
    }

    return this.jobOfferModel.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'email'] }],
      order: [['created_at', filters?.sort || 'DESC']],
    });
  }

  async findOne(id: string) {
    const job = await this.jobOfferModel.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'email'] }],
    });
    if (!job) {
      throw new NotFoundException(`Offre d'emploi avec l'ID ${id} non trouvée`);
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const job = await this.findOne(id);
    return job.update(updateJobDto);
  }

  async remove(id: string) {
    const job = await this.findOne(id);
    await job.destroy();
    return { message: 'Offre supprimée avec succès' };
  }
}
