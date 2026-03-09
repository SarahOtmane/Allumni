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

    this.logger.log(`>> [SMART SCRAPE] Target: ${profile.first_name} ${profile.last_name}`);
    await profile.update({ scraping_status: 'PROCESSING', scraping_error: null });

    let browser;
    try {
      browser = await (puppeteer as any).launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

      let foundResult = null;
      
      // --- ÉTAPE 1 : RECHERCHE PAR URL (SOUPLE) ---
      const targetUrl = linkedinUrl || profile.linkedin_url;
      if (targetUrl) {
          this.logger.log(`>> Step 1: Searching by URL...`);
          foundResult = await this.searchDuckDuckGo(page, targetUrl);
      }

      // --- ÉTAPE 2 : RECHERCHE PAR NOM (SI ÉTAPE 1 ÉCHOUE OU GÉNÉRIQUE) ---
      if (!foundResult || foundResult.title.includes('profiles')) {
          this.logger.log(`>> Step 2: Searching by Name...`);
          foundResult = await this.searchDuckDuckGo(page, `linkedin "${profile.first_name} ${profile.last_name}"`);
      }

      if (foundResult && foundResult.title) {
        await this.processAndSave(profile, foundResult.title, foundResult.snippet);
      } else {
        throw new Error('Could not find any LinkedIn data on search engines.');
      }

    } catch (error) {
      this.logger.error(`>> [SCRAPING FAILED] ${error.message}`);
      await profile.update({ scraping_status: 'FAILED', scraping_error: error.message });
    } finally {
      if (browser) await browser.close();
    }
  }

  private async searchDuckDuckGo(page: any, query: string) {
    await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
    return await page.evaluate(() => {
      const res = document.querySelector('.result__title a, .result__a');
      const snip = document.querySelector('.result__snippet')?.textContent || '';
      return res ? { title: res.textContent?.trim(), snippet: snip.trim() } : null;
    });
  }

  private async processAndSave(profile: any, title: string, snippet: string) {
    this.logger.log(`>> Analyzing: ${title}`);
    
    // On sépare le titre par les séparateurs classiques
    const parts = title.split(/[|–\-\—\:]/).map(p => p.trim());
    const filtered = parts.filter(p => {
        const l = p.toLowerCase();
        return l.length > 2 && 
               !l.includes(profile.last_name.toLowerCase()) && 
               !l.includes('linkedin') &&
               !l.includes('france');
    });

    let position = profile.diploma || 'Alumni';
    let company = 'LinkedIn Profile';

    // Priorité au snippet pour le poste (plus précis)
    // Exemple : "... est Développeur Fullstack chez Crédit Agricole ..."
    const jobMatch = snippet.match(/([^.·]*)(?: chez | at | @ | is a )([^.·]*)/i);
    
    if (jobMatch) {
        position = jobMatch[1].trim();
        company = jobMatch[2].split('·')[0].trim();
    } else if (filtered.length >= 2) {
        position = filtered[0];
        company = filtered[1];
    } else if (filtered.length === 1) {
        // Si un seul bloc, on essaie de deviner si c'est une entreprise ou un poste
        if (filtered[0].toLowerCase().includes('assurance') || filtered[0].toLowerCase().includes('caisse')) {
            company = filtered[0];
        } else {
            position = filtered[0];
        }
    }

    // Mise à jour finale
    await profile.update({
      current_position: position,
      company: company,
      data_enriched: true,
      scraping_status: 'COMPLETED'
    });

    await this.alumniExperienceModel.destroy({ where: { alumni_id: profile.id } });
    await this.alumniExperienceModel.create({
      alumni_id: profile.id,
      title: position,
      company: company,
      start_date: `${profile.promo_year}-09-01`,
      is_current: true
    });

    this.logger.log(`>> SUCCESS: [${position}] @ [${company}]`);
  }
}
