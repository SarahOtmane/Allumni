import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AlumniProfile } from './models/alumni-profile.model';
import { AlumniController } from './controllers/alumni.controller';

@Module({
  imports: [SequelizeModule.forFeature([AlumniProfile])],
  controllers: [AlumniController],
})
export class AlumniModule {}
