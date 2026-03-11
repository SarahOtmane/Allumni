import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(@InjectQueue('scraping') private scrapingQueue: Queue) {}

  async addScrapingJob(alumniId: string, linkedinUrl?: string) {
    this.logger.log(`Enqueuing scraping job for alumni ${alumniId} (URL: ${linkedinUrl || 'N/A'})`);
    try {
      await this.scrapingQueue.add(
        'extract-job-history',
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
      this.logger.log(`Job successfully added to queue for alumni ${alumniId}`);
    } catch (error) {
      this.logger.error(`Failed to add job to queue for alumni ${alumniId}: ${error.message}`);
    }
  }
}
