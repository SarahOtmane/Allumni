import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(@InjectQueue('scraping') private scrapingQueue: Queue) {}

  async addScrapingJob(alumniId: string, linkedinUrl?: string) {
    this.logger.log(`Enqueuing scraping job for alumni ${alumniId}`);
    await this.scrapingQueue.add(
      'extract-current-job',
      {
        alumniId,
        linkedinUrl,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    );
  }
}
