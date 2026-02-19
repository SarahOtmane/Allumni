import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobOffer } from './models/job-offer.model';

@Module({
  imports: [SequelizeModule.forFeature([JobOffer])],
})
export class JobsModule {}
