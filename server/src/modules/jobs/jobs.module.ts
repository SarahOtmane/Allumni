import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobOffer } from './models/job-offer.model';
import { JobsService } from './services/jobs.service';
import { JobsController } from './controllers/jobs.controller';

@Module({
  imports: [SequelizeModule.forFeature([JobOffer])],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
