import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/sequelize';
import { AlumniProfile } from '../../alumni/models/alumni-profile.model';
import { AlumniExperience } from '../../alumni/models/alumni-experience.model';

import puppeteer from 'puppeteer-extra';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

@Processor('scraping')
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    @InjectModel(AlumniProfile)
    private alumniProfileModel: typeof AlumniProfile,
    @InjectModel(AlumniExperience)
    private alumniExperienceModel: typeof AlumniExperience,
  ) {}

  @Process('extract-job-history')
  async handleScraping(job: Job<{ alumniId: string }>) {
    const { alumniId } = job.data;
    const profile = await this.alumniProfileModel.findByPk(alumniId);
    if (!profile) return;

    this.logger.log(`\n--- START ROBUST SCRAPE: ${profile.first_name} ${profile.last_name} ---`);
    await profile.update({ scraping_status: 'PROCESSING', scraping_error: null });

    const liAtCookie = process.env.LINKEDIN_LI_AT;
    let browser;
    try {
      browser = await (puppeteer as any).launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

      let success = false;

      // 1. ATTEMPT DIRECT ACCESS (IF COOKIE IS PRESENT)
      if (liAtCookie) {
        this.logger.log('>> Step 1: Trying Direct Access with Session...');
        try {
          // Go to a neutral page first to set the cookie
          await page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded' });
          await page.setCookie({ name: 'li_at', value: liAtCookie, domain: '.linkedin.com', path: '/', secure: true });
          
          await page.goto(profile.linkedin_url, { waitUntil: 'networkidle2', timeout: 30000 });
          await new Promise(r => setTimeout(r, 3000));

          const title = await page.title();
          if (!title.toLowerCase().includes('sign up') && !title.toLowerCase().includes('login')) {
            const data = await this.scrapeDirectProfile(page);
            if (data.length > 0) {
              await this.saveFullHistory(profile, data);
              success = true;
            }
          }
        } catch (e) {
          this.logger.warn(`Direct access failed: ${e.message}`);
        }
      }

      // 2. FALLBACK SEARCH (ANONYMOUS)
      if (!success) {
        this.logger.log('>> Step 2: Falling back to Public Search...');
        const query = `linkedin "${profile.first_name} ${profile.last_name}"`;
        await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`);
        await new Promise(r => setTimeout(r, 2000));

        const result = await page.evaluate((ln: string) => {
          const links = Array.from(document.querySelectorAll('a[data-testid="result-title-a"], .result__a'));
          const target = links.find(l => {
            const text = l.textContent?.toLowerCase() || '';
            return text.includes(ln.toLowerCase()) && !text.includes('10+') && !text.includes('profiles');
          });
          
          if (!target) return null;
          const container = target.closest('article, .result');
          const snippet = container?.querySelector('[data-testid="result-snippet"], .result__snippet')?.textContent || '';
          return { title: target.textContent?.trim(), snippet: snippet.trim() };
        }, profile.last_name);

        if (result) {
          this.logger.log(`>> [RAW DATA] Title: ${result.title}`);
          this.logger.log(`>> [RAW DATA] Snippet: ${result.snippet}`);
          await this.parseAndSaveSearchData(profile, result.title, result.snippet);
          success = true;
        }
      }

      if (!success) throw new Error('Failed to find profile data through all channels.');

    } catch (error) {
      this.logger.error(`>> [SCRAPING FAILED] ${error.message}`);
      await profile.update({ scraping_status: 'FAILED', scraping_error: error.message });
    } finally {
      if (browser) await browser.close();
    }
  }

  private async scrapeDirectProfile(page: any) {
    return await page.evaluate(() => {
      const experiences = [];
      const section = document.getElementById('experience')?.closest('section') || 
                      Array.from(document.querySelectorAll('section')).find(s => s.innerText.toLowerCase().includes('expérience'));
      
      if (section) {
        const items = section.querySelectorAll('li.artdeco-list__item, .pvs-list__item--line-separated');
        items.forEach(item => {
          const spans = Array.from(item.querySelectorAll('span[aria-hidden="true"]'));
          const title = spans[0]?.textContent?.trim();
          const company = spans[1]?.textContent?.split(' · ')[0]?.trim();
          const dates = spans[2]?.textContent?.trim();
          if (title && company) experiences.push({ title, company, dates: dates || '' });
        });
      }
      return experiences;
    });
  }

  private async saveFullHistory(profile: any, data: any[]) {
    await this.alumniExperienceModel.destroy({ where: { alumni_id: profile.id } });
    const records = data.map(d => ({
      alumni_id: profile.id,
      title: d.title,
      company: d.company,
      start_date: d.dates.match(/\d{4}/) ? `${d.dates.match(/\d{4}/)[0]}-01-01` : `${profile.promo_year}-09-01`,
      is_current: d.dates.toLowerCase().includes('aujourd') || d.dates.toLowerCase().includes('present')
    }));
    await this.alumniExperienceModel.bulkCreate(records);
    await profile.update({ current_position: records[0].title, company: records[0].company, data_enriched: true, scraping_status: 'COMPLETED' });
    this.logger.log(`>> SUCCESS: Full history saved for ${profile.last_name}`);
  }

  private async parseAndSaveSearchData(profile: any, title: string, snippet: string) {
    // Clean title: remove name and "LinkedIn"
    let cleanTitle = title
      .replace(/LinkedIn/gi, '')
      .replace(new RegExp(profile.first_name, 'gi'), '')
      .replace(new RegExp(profile.last_name, 'gi'), '')
      .replace(/[|–-—:]/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '').trim();

    // Look for "Position at Company" patterns in snippet or title
    const combinedText = `${cleanTitle} | ${snippet}`;
    const match = combinedText.match(/([^|·-]*)(?: chez | at | @ | is a | Expérience : | actuellement )([^|·-]*)/i);

    let position = '-';
    let company = 'LinkedIn Profile';

    if (match) {
      position = match[1].trim();
      company = match[2].trim();
    } else if (cleanTitle.includes('-')) {
      const parts = cleanTitle.split('-').map(p => p.trim()).filter(p => p.length > 2);
      position = parts[0] || '-';
      company = parts[1] || 'LinkedIn Profile';
    } else {
      position = cleanTitle;
    }

    await profile.update({ current_position: position, company: company, data_enriched: true, scraping_status: 'COMPLETED' });
    await this.alumniExperienceModel.destroy({ where: { alumni_id: profile.id } });
    await this.alumniExperienceModel.create({
      alumni_id: profile.id,
      title: position,
      company: company,
      start_date: `${profile.promo_year}-09-01`,
      is_current: true
    });
    this.logger.log(`>> SUCCESS: Partial data saved for ${profile.last_name}`);
  }
}
