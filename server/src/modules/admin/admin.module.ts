import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { User } from '../users/models/user.model';
import { AlumniProfile } from '../alumni/models/alumni-profile.model';
import { Event } from '../events/models/event.model';
import { JobOffer } from '../jobs/models/job-offer.model';

@Module({
  imports: [SequelizeModule.forFeature([User, AlumniProfile, Event, JobOffer])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
