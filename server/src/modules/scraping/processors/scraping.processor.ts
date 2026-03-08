import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/sequelize';
import * as puppeteer from 'puppeteer';
import { AlumniProfile } from '../../alumni/models/alumni-profile.model';
import { AlumniExperience } from '../../alumni/models/alumni-experience.model';

@Processor('scraping')
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    @InjectModel(AlumniProfile)
    private alumniProfileModel: typeof AlumniProfile,
    @InjectModel(AlumniExperience)
    private alumniExperienceModel: typeof AlumniExperience,
  ) {
    this.logger.log('ScrapingProcessor initialized and listening for jobs...');
  }

  @Process('extract-job-history')
  async handleScraping(job: Job<{ alumniId: string; linkedinUrl?: string }>) {
    const { alumniId, linkedinUrl } = job.data;
    this.logger.log(`>> Worker picking up job for alumni: ${alumniId}`);

    const profile = await this.alumniProfileModel.findByPk(alumniId);
    if (!profile) {
      this.logger.error(`Profile ${alumniId} not found in DB!`);
      return;
    }

    const url = linkedinUrl || profile.linkedin_url;

    if (!url) {
      this.logger.warn(`No LinkedIn URL for alumni ${alumniId}. Skipping.`);
      return;
    }

    this.logger.log(`>> Starting extraction from LinkedIn for: ${alumniId}`);
    await profile.update({ scraping_status: 'PROCESSING' });

    let browser;
    try {
      const launchOptions: any = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      };

      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      try {
        browser = await puppeteer.launch(launchOptions);
      } catch (launchError) {
        this.logger.warn(`>> Failed to launch with executablePath, trying default: ${launchError.message}`);
        delete launchOptions.executablePath;
        browser = await puppeteer.launch(launchOptions);
      }

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      );

      this.logger.log(`>> Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Extraction logic
      const extractedData = await page.evaluate(() => {
        const experienceSection =
          document.querySelector('#experience') || document.querySelector('section.experience-section');
        if (!experienceSection) return [];

        const experienceItems = experienceSection.nextElementSibling?.querySelectorAll('li') ||
          experienceSection.querySelectorAll('.experience-item');

        const experiences = [];
        experienceItems.forEach((item) => {
          const titleElement = (item.querySelector('h3') || item.querySelector('.t-bold')) as HTMLElement;
          const title = titleElement?.innerText.trim();

          const companyElement = (item.querySelector('p.t-14.t-normal') ||
            item.querySelector('.experience-item__subtitle')) as HTMLElement;
          const company = companyElement?.innerText.split('·')[0].trim();

          const dateRangeElement = (item.querySelector('.t-14.t-black--light.t-normal') ||
            item.querySelector('.experience-item__duration')) as HTMLElement;
          const dateRangeText = dateRangeElement?.innerText.trim(); // e.g., "Jan 2023 - Present"

          if (title && company) {
            experiences.push({ title, company, dateRangeText });
          }
        });

        return experiences;
      });

      if (extractedData.length > 0) {
        this.logger.log(`>> Extracted ${extractedData.length} experiences for ${alumniId}`);

        // Clean existing experiences for this alumni to avoid duplicates on re-scrape
        await this.alumniExperienceModel.destroy({ where: { alumni_id: alumniId } });

        const experiencesToSave = [];
        let currentJob = null;

        for (const data of extractedData) {
          const { title, company, dateRangeText } = data;
          
          // Basic date parsing (heuristic)
          // dateRangeText usually looks like "Month Year - Month Year" or "Month Year - Present"
          const parts = dateRangeText.split('-').map(p => p.trim());
          const startPart = parts[0];
          const endPart = parts[1];

          const startDate = this.parseLinkedInDate(startPart);
          const endDate = endPart && endPart.toLowerCase().includes('present') ? null : this.parseLinkedInDate(endPart);
          const isCurrent = !endPart || endPart.toLowerCase().includes('present');

          const startYear = startDate ? new Date(startDate).getFullYear() : 0;

          // Filter: Only after or during graduation year
          if (startYear >= profile.promo_year) {
            experiencesToSave.push({
              alumni_id: alumniId,
              title,
              company,
              start_date: startDate || new Date().toISOString().split('T')[0],
              end_date: endDate,
              is_current: isCurrent,
            });

            if (isCurrent && !currentJob) {
              currentJob = { title, company };
            }
          }
        }

        if (experiencesToSave.length > 0) {
          await this.alumniExperienceModel.bulkCreate(experiencesToSave);
          this.logger.log(`>> Saved ${experiencesToSave.length} experiences for ${alumniId}`);
        }

        // Update main profile with current job
        if (currentJob || (experiencesToSave.length > 0 && !currentJob)) {
          const latest = currentJob || experiencesToSave[0];
          await profile.update({
            current_position: latest.title,
            company: latest.company,
            data_enriched: true,
            scraping_status: 'COMPLETED',
            scraping_error: null,
          });
        } else {
          await profile.update({
            scraping_status: 'COMPLETED',
            scraping_error: 'No experiences found after graduation year',
          });
        }
      } else {
        this.logger.warn(`>> Could not extract experience data for ${url}`);
        await profile.update({
          scraping_status: 'FAILED',
          scraping_error: 'Could not extract experience data from profile page',
        });
      }
    } catch (error) {
      this.logger.error(`>> ERROR scraping ${url}: ${error.message}`);
      await profile.update({
        scraping_status: 'FAILED',
        scraping_error: error.message,
      });
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private parseLinkedInDate(dateStr: string): string | null {
    if (!dateStr) return null;
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const parts = dateStr.split(' ');
    
    let month = '01';
    let year = '';

    if (parts.length === 2) {
      const mIdx = months.findIndex(m => parts[0].toLowerCase().startsWith(m));
      if (mIdx !== -1) month = (mIdx + 1).toString().padStart(2, '0');
      year = parts[1];
    } else if (parts.length === 1) {
      year = parts[0];
    }

    if (year.length === 4) {
      return `${year}-${month}-01`;
    }
    return null;
  }
}
