import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/sequelize';
import * as puppeteer from 'puppeteer';
import { AlumniProfile } from '../../alumni/models/alumni-profile.model';

@Processor('scraping')
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    @InjectModel(AlumniProfile)
    private alumniProfileModel: typeof AlumniProfile,
  ) {}

  @Process('extract-current-job')
  async handleScraping(job: Job<{ alumniId: string; linkedinUrl?: string }>) {
    const { alumniId, linkedinUrl } = job.data;
    this.logger.log(`Processing scraping job for alumni ${alumniId}`);

    const profile = await this.alumniProfileModel.findByPk(alumniId);
    if (!profile) {
      this.logger.error(`Profile ${alumniId} not found`);
      return;
    }

    const url = linkedinUrl || profile.linkedin_url;

    // Si pas d'URL, on pourrait tenter une recherche mais LinkedIn bloque souvent les recherches non-authentifiées
    if (!url) {
      this.logger.warn(`No LinkedIn URL for alumni ${alumniId}. Skipping.`);
      return;
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      );

      this.logger.log(`Navigating to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      // Extraction du titre du poste et de l'entreprise
      // Note: Les sélecteurs LinkedIn changent souvent.
      // Ces sélecteurs sont basés sur la structure publique classique.
      const data = await page.evaluate(() => {
        const experienceSection =
          document.querySelector('#experience') || document.querySelector('section.experience-section');
        if (!experienceSection) return null;

        const firstExperience = (experienceSection.nextElementSibling?.querySelector('li') ||
          experienceSection.querySelector('.experience-item')) as HTMLElement;

        if (!firstExperience) return null;

        const titleElement = (firstExperience.querySelector('h3') ||
          firstExperience.querySelector('.t-bold')) as HTMLElement;
        const title = titleElement?.innerText;

        const companyElement = (firstExperience.querySelector('p.t-14.t-normal') ||
          firstExperience.querySelector('.experience-item__subtitle')) as HTMLElement;
        const company = companyElement?.innerText.split('·')[0].trim();

        return { title, company };
      });

      if (data && (data.title || data.company)) {
        this.logger.log(`Found data for ${alumniId}: ${data.title} at ${data.company}`);
        await profile.update({
          current_position: data.title || profile.current_position,
          company: data.company || profile.company,
          data_enriched: true,
        });
      } else {
        this.logger.warn(`Could not extract experience data for ${url}`);
      }
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}: ${error.message}`);
      throw error; // Re-throw to trigger BullMQ retry
    } finally {
      await browser.close();
    }
  }
}
