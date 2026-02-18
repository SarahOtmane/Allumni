# Services Métier & Intégrations

Ce document recense les services principaux de l'application Alumni.

## 1. Backend Services (NestJS)

| Service | Module | Description |
| :--- | :--- | :--- |
| **ScrapingService** | `scraping` | Orchestration du scraping LinkedIn (Puppeteer) |
| **ScrapingQueue** | `scraping` | Gestion de la file d'attente Redis (BullMQ) |
| **AuthService** | `auth` | Gestion JWT, Login, Register, Hashing (Argon2) |
| **AlumniService** | `alumni` | Logique métier profils (Recherche, Filtres) |
| **StatsService** | `admin` | Agrégation des KPIs pour le dashboard |

### Focus : Le Service de Scraping (Asynchrone)

Le scraping est découplé en deux parties : le *Producer* (API) et le *Consumer* (Worker).

**A. Producer (Ajout à la file)**
```typescript
// server/src/modules/scraping/scraping.service.ts
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ScrapingService {
  constructor(@InjectQueue('linkedin-scraping') private scrapingQueue: Queue) {}

  async addToQueue(alumniData: CreateAlumniDto) {
    // Ajoute un job dans Redis avec une stratégie de retry
    await this.scrapingQueue.add('enrich-profile', alumniData, {
      attempts: 3,
      backoff: 5000, // Attendre 5s avant de réessayer
      removeOnComplete: true
    });
  }
}
```

**B. Consumer (Traitement Worker)**
```typescript
// server/src/modules/scraping/scraping.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import puppeteer from 'puppeteer';

@Processor('linkedin-scraping')
export class ScrapingProcessor {
  
  @Process('enrich-profile')
  async handleScraping(job: Job) {
    const { linkedinUrl } = job.data;
    
    // Lancement du navigateur headless
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    try {
      await page.goto(linkedinUrl);
      // ... Logique d'extraction DOM ...
      return { position: 'Développeur', company: 'Tech Corp' };
    } finally {
      await browser.close();
    }
  }
}
```

## 2. Frontend Services (Angular)
Les services Angular sont des Singletons (providedIn: 'root') qui communiquent avec l'API NestJS.

| Service | Usage | Endpoint Base |
|---|---|---|
| **AuthService** | **Login, Logout, User State (Signal)** | /api/auth |
| **AlumniService** | **Récupération annuaire, Profil** | /api/alumni |
| **AdminService** | **Upload CSV, Trigger Scraping** | /api/admin |

## Exemple d'Appel API (Pattern Signal)
```typescript
// client/src/app/core/services/alumni.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlumniService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/alumni`;

  // État réactif local (si besoin de cache simple)
  alumniList = signal<Alumni[]>([]);

  search(filters: any) {
    return this.http.get<Alumni[]>(this.apiUrl, { params: filters })
      .pipe(
        tap(data => this.alumniList.set(data))
      );
  }
}
```

## 3. Variables d'Environnement (Env)

### Backend (.env)
```
# Database
DB_HOST=mysql_db
DB_PORT=3306
DB_USER=alumni_user
DB_PASS=secret
DB_NAME=alumni_db

# Redis (Queue)
REDIS_HOST=redis_cache
REDIS_PORT=6379

# JWT
JWT_SECRET=super_secret_key_change_me
JWT_EXPIRATION=1d

# App
PORT=3000
NODE_ENV=production
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: '[https://api.alumni-school.com/api](https://api.alumni-school.com/api)'
};
```