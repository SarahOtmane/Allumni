import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobOffer } from './models/job-offer.model';
import { JobsService } from './services/jobs.service';
import { JobsController } from './controllers/jobs.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [SequelizeModule.forFeature([JobOffer]), NotificationsModule],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
