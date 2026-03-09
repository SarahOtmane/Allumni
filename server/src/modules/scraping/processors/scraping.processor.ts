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
  async handleScraping(job: Job<{ alumniId: string; linkedinUrl?: string }>) {
    const { alumniId } = job.data;
    const profile = await this.alumniProfileModel.findByPk(alumniId);
    if (!profile) return;

    this.logger.log(`>> [SMART SCRAPE] Target: ${profile.first_name} ${profile.last_name}`);
    await profile.update({ scraping_status: 'PROCESSING', scraping_error: null });

    let browser;
    try {
      browser = await (puppeteer as any).launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      );

      // RECHERCHE OPTIMISÉE : "Prénom Nom LinkedIn" est le plus fiable
      const query = `linkedin "${profile.first_name} ${profile.last_name}"`;
      this.logger.log(`>> Querying search engine: ${query}`);

      await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`);

      const searchResult = await page.evaluate(() => {
        const results = Array.from(document.querySelectorAll('.result__title a, .result__a'));
        // On évite les pages de liste "10+ profiles"
        const best = results.find((r) => !r.textContent?.includes('10+') && !r.textContent?.includes('profiles'));
        const snippet = best?.closest('.result')?.querySelector('.result__snippet')?.textContent || '';
        return best ? { title: best.textContent?.trim(), snippet: snippet.trim() } : null;
      });

      if (searchResult && searchResult.title) {
        this.logger.log(`>> Raw Result: ${searchResult.title}`);

        // --- LOGIQUE DE DÉCOUPAGE INTELLIGENTE ---
        // On retire d'abord LinkedIn et le Nom/Prénom pour isoler le reste
        let info = searchResult.title
          .replace(/LinkedIn/gi, '')
          .replace(new RegExp(profile.first_name, 'gi'), '')
          .replace(new RegExp(profile.last_name, 'gi'), '')
          .replace(/[|–-—:]/g, '-') // Normalisation
          .trim();

        // On nettoie les tirets résiduels
        info = info.replace(/^-+|-+$/g, '').trim();

        let position = '-';
        let company = 'LinkedIn Profile';

        // Tentative d'extraction depuis le snippet (plus précis pour le poste)
        const jobMatch = searchResult.snippet.match(/([^.·]*)(?: chez | at | @ | is a )([^.·]*)/i);

        if (jobMatch) {
          position = jobMatch[1].trim();
          company = jobMatch[2].split('·')[0].trim();
        } else if (info.includes('-')) {
          // Si le titre ressemble à "Poste - Entreprise"
          const parts = info
            .split('-')
            .map((p) => p.trim())
            .filter((p) => p.length > 2);
          position = parts[0] || '-';
          company = parts[1] || 'LinkedIn Profile';
        } else {
          // Si un seul bloc, c'est souvent l'entreprise (ex: Wassim)
          company = info;
        }

        // Nettoyage final pour Wassim (retirer "Assistant Chef de projet MOA" si tronqué)
        position = position.replace(/^Expérience\s*:/i, '').trim();

        await profile.update({
          current_position: position,
          company: company,
          data_enriched: true,
          scraping_status: 'COMPLETED',
        });

        await this.alumniExperienceModel.destroy({ where: { alumni_id: alumniId } });
        await this.alumniExperienceModel.create({
          alumni_id: alumniId,
          title: position !== '-' ? position : 'En poste',
          company: company,
          start_date: `${profile.promo_year}-09-01`,
          is_current: true,
        });

        this.logger.log(`>> SUCCESS: [${position}] @ [${company}]`);
      } else {
        throw new Error('Search engine did not return a specific profile.');
      }
    } catch (error) {
      this.logger.error(`>> [SCRAPING FAILED] ${error.message}`);
      await profile.update({ scraping_status: 'FAILED', scraping_error: error.message });
    } finally {
      if (browser) await browser.close();
    }
  }
}
