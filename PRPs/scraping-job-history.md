# Scraping LinkedIn Job History PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal
Récupérer automatiquement l'historique professionnel des Alumni depuis LinkedIn lors de l'import CSV, afin de permettre au Staff/Admin de suivre leur évolution de carrière depuis l'obtention du diplôme.

## Why
**Justification Métier :**
- **Pour l'école :** Automatiser la collecte de données sur l'insertion professionnelle sans solliciter manuellement chaque diplômé.
- **Pour le Staff/Admin :** Disposer d'une vue chronologique précise du parcours de chaque étudiant pour justifier de la qualité des formations.

**Priority :** High

---

## What

### Feature Description
Dès qu'un fichier CSV est importé, si une URL LinkedIn est présente, un job asynchrone est créé pour scraper le profil. On extrait le poste actuel (affiché dans le tableau principal) et l'historique des postes depuis l'année de sortie de l'école (affiché dans une vue détails).

### Scope
**In Scope :**
- Pipeline asynchrone avec **BullMQ** et **Redis**.
- Worker **Puppeteer** capable d'extraire les expériences (Titre, Entreprise, Dates).
- Filtrage des expériences : seules celles commençant après ou pendant l'année du diplôme (`promo_year`) sont stockées.
- Nouvelle table `alumni_experiences` en BDD.
- Modal "Détails" côté Admin pour visualiser l'historique chronologique.

**Out of Scope :**
- Scraping si l'URL LinkedIn est manquante.
- Mise à jour automatique périodique (uniquement lors de l'import ou déclenchement manuel).
- Vue de l'historique pour les comptes de rôle `ALUMNI`.

---

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/alumni/models/alumni-profile.model.ts` | Entité parente pour la relation 1:N |
| `ai_docs/patterns.md` | Conventions de code NestJS et Angular |
| `server/src/modules/alumni/services/alumni.service.ts` | Méthode `importCsv` à modifier pour trigger le scraping |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/database/migrations/YYYYMMDDHHMMSS-create-alumni-experiences.js` | CREATE | Migration Sequelize |
| `server/src/modules/alumni/models/alumni-experience.model.ts` | CREATE | Modèle pour stocker l'historique |
| `server/src/modules/alumni/alumni.module.ts` | MODIFY | Enregistrer le nouveau modèle |
| `server/src/modules/scraping/scraping.module.ts` | CREATE | Initialisation BullMQ |
| `server/src/modules/scraping/services/scraping.service.ts` | CREATE | Producteur de jobs |
| `server/src/modules/scraping/processors/scraping.processor.ts` | CREATE | Consommateur Puppeteer |
| `client/src/app/features/admin/promos/alumni-detail-modal/` | CREATE | Nouvelle modal de consultation |
| `client/src/app/features/admin/promos/promo-detail/promo-detail.component.ts` | MODIFY | Ajouter le bouton "Détails" |

### Existing Patterns to Follow

**Backend — BullMQ Producer :**
```typescript
@Injectable()
export class ScrapingService {
  constructor(@InjectQueue('scraping') private scrapingQueue: Queue) {}
  async addJob(data: any) { await this.scrapingQueue.add('process', data); }
}
```

**Backend — Puppeteer Processor :**
```typescript
@Processor('scraping')
export class ScrapingProcessor {
  @Process('process')
  async handle(job: Job) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    // scraping logic...
  }
}
```

---

## Implementation Details

### API Endpoints

#### `GET /api/alumni/promos/:year`
**Auth :** `['ADMIN', 'STAFF']`
**Modification :** Doit maintenant inclure les `experiences` associées via Sequelize `include`.

### Database Schema (Sequelize)

```typescript
// server/src/modules/alumni/models/alumni-experience.model.ts
@Table({ tableName: 'alumni_experiences', underscored: true })
export class AlumniExperience extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @ForeignKey(() => AlumniProfile)
  @Column({ type: DataType.UUID, allowNull: false })
  alumni_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  company: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  start_date: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  end_date: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_current: boolean;
}
```

---

## Validation Criteria

### Functional Requirements
- [ ] L'import CSV déclenche immédiatement la mise en file d'attente.
- [ ] Le poste actuel (le plus récent) met à jour `current_position` et `company` dans `alumni_profiles`.
- [ ] L'historique complet est visible dans la modal détails (Admin/Staff uniquement).
- [ ] Les expériences antérieures à `promo_year` sont ignorées.

### Technical Requirements
- [ ] TypeScript compile : `docker compose exec server npm run build`
- [ ] Puppeteer s'exécute correctement dans le conteneur Docker.
- [ ] Les relations Sequelize sont correctement définies (BelongsTo/HasMany).

### Testing Steps
1. Importer un CSV avec un alumni ayant une URL LinkedIn.
2. Vérifier les logs du serveur : `[ScrapingProcessor] Job started`.
3. Une fois terminé, cliquer sur "Détails" dans l'admin.
4. Comparer les données avec le profil LinkedIn public.
