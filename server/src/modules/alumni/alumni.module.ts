import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AlumniProfile } from './models/alumni-profile.model';
import { Promotion } from './models/promotion.model';
import { AlumniController } from './controllers/alumni.controller';
import { AlumniService } from './services/alumni.service';
import { User } from '../users/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([AlumniProfile, Promotion, User])],
  controllers: [AlumniController],
  providers: [AlumniService],
})
export class AlumniModule {}
