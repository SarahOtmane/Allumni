import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/sequelize';
import { AlumniProfile } from '../../alumni/models/alumni-profile.model';
import { AlumniExperience } from '../../alumni/models/alumni-experience.model';

import puppeteer from 'puppeteer-extra';
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
  async handleScraping(job: Job<{ alumniId: string; linkedinUrl?: string }>) {
    const { alumniId, linkedinUrl } = job.data;
    const profile = await this.alumniProfileModel.findByPk(alumniId);
    if (!profile) return;

    const url = linkedinUrl || profile.linkedin_url;
    if (!url) return;

    this.logger.log(`>> [TARGETED SCRAPE] alumni: ${profile.last_name}`);
    await profile.update({ scraping_status: 'PROCESSING', scraping_error: null });

    const liAtCookie = process.env.LINKEDIN_LI_AT;
    let browser;
    try {
      browser = await (puppeteer as any).launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

      let success = false;

      // --- TENTATIVE 1 : LINKEDIN DIRECT (SESSION) ---
      if (liAtCookie) {
        try {
          await page.setCookie({ name: 'li_at', value: liAtCookie, domain: '.www.linkedin.com', path: '/', secure: true });
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await new Promise(r => setTimeout(r, 3000));
          if (!(await page.title()).toLowerCase().includes('sign up')) {
            const data = await this.extractLinkedInData(page);
            if (data.length > 0) {
              await this.saveFullData(profile, data);
              success = true;
            }
          }
        } catch (e) { this.logger.warn('Direct LinkedIn failed'); }
      }

      // --- TENTATIVE 2 : DUCKDUCKGO PAR URL (Pour Sarah) ---
      if (!success) {
        this.logger.log(`>> Falling back to URL search for precision...`);
        // On cherche l'URL entre guillemets pour forcer le résultat de ce profil précis
        const query = `site:linkedin.com/in/ "${profile.first_name} ${profile.last_name}"`;
        await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
        
        const searchResult = await page.evaluate(() => {
          const res = document.querySelector('.result__title a, .result__a');
          const snippet = document.querySelector('.result__snippet')?.textContent || '';
          return res ? { title: res.textContent?.trim(), snippet } : null;
        });

        if (searchResult && !searchResult.title?.includes('profiles')) {
          await this.savePartialData(profile, searchResult.title || '', searchResult.snippet);
          success = true;
        }
      }

      if (!success) throw new Error('All scraping paths failed to find specific profile data.');

    } catch (error) {
      this.logger.error(`>> [FAILED] ${error.message}`);
      await profile.update({ scraping_status: 'FAILED', scraping_error: error.message });
    } finally {
      if (browser) await browser.close();
    }
  }

  private async extractLinkedInData(page: any) {
    return await page.evaluate(() => {
      const experiences = [];
      const items = document.querySelectorAll('.pvs-list__outer-container li.artdeco-list__item');
      items.forEach((item) => {
        const title = item.querySelector('.t-bold span[aria-hidden="true"]')?.textContent?.trim();
        const company = item.querySelector('.t-normal span[aria-hidden="true"]')?.textContent?.split('·')[0]?.trim();
        const dates = item.querySelector('.t-black--light span[aria-hidden="true"]')?.textContent?.trim();
        if (title && company) experiences.push({ title, company, dates });
      });
      return experiences;
    });
  }

  private async saveFullData(profile: any, data: any[]) {
    await this.alumniExperienceModel.destroy({ where: { alumni_id: profile.id } });
    const experiences = data.map(d => ({
        alumni_id: profile.id,
        title: d.title,
        company: d.company,
        start_date: d.dates?.match(/\d{4}/) ? `${d.dates.match(/\d{4}/)[0]}-01-01` : `${profile.promo_year}-09-01`,
        is_current: d.dates?.toLowerCase().includes('present') || d.dates?.toLowerCase().includes('aujourd')
    }));
    await this.alumniExperienceModel.bulkCreate(experiences);
    await profile.update({ current_position: experiences[0].title, company: experiences[0].company, data_enriched: true, scraping_status: 'COMPLETED' });
  }

  private async savePartialData(profile: any, title: string, snippet: string) {
    // Nettoyage : Sarah Otmane - Developpeuse Full stack - Crédit Agricole | LinkedIn
    const parts = title.split(/[|–-—]/).map(p => p.trim());
    const filtered = parts.filter(p => !p.toLowerCase().includes(profile.last_name.toLowerCase()) && !p.toLowerCase().includes('linkedin'));
    
    // Logique de séparation Poste / Entreprise plus fine
    let position = filtered[0] || profile.diploma || 'Alumni';
    let company = filtered[1] || 'Entreprise (LinkedIn)';

    // Si on a trouvé un snippet avec "chez" ou "at"
    const match = snippet.match(/(.*) (?:chez|at|@) (.*)/i);
    if (match) {
        position = match[1].trim();
        company = match[2].split('.')[0].trim();
    }

    await profile.update({ current_position: position, company: company, data_enriched: true, scraping_status: 'COMPLETED' });
    await this.alumniExperienceModel.destroy({ where: { alumni_id: profile.id } });
    await this.alumniExperienceModel.create({ alumni_id: profile.id, title: position, company: company, start_date: `${profile.promo_year}-09-01`, is_current: true });
  }
}
