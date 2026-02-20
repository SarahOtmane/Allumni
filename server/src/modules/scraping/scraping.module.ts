import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SequelizeModule } from '@nestjs/sequelize';
import { ScrapingService } from './services/scraping.service';
import { ScrapingProcessor } from './processors/scraping.processor';
import { AlumniProfile } from '../alumni/models/alumni-profile.model';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
    SequelizeModule.forFeature([AlumniProfile]),
  ],
  providers: [ScrapingService, ScrapingProcessor],
  exports: [ScrapingService],
})
export class ScrapingModule {}
