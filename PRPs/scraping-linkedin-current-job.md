# Scraping LinkedIn Current Job on Import PRP

## Goal
Enrichir automatiquement le profil Alumni avec son **poste actuel** (le dernier en haut de la liste "Expérience" sur LinkedIn) dès son importation via le fichier CSV.

## Why
Éviter à l'administrateur de remplir manuellement l'entreprise et l'intitulé du poste. Cela garantit que dès l'import, l'annuaire est à jour avec la situation professionnelle réelle de l'alumni.

## What
- **Pipeline Asynchrone** : Utilisation de `BullMQ` + `Redis` pour traiter l'opération lourde de scraping en tâche de fond.
- **Logique d'Extraction** :
    - Navigation via Puppeteer sur le profil LinkedIn (URL fournie dans le CSV ou recherche par nom/prénom).
    - Ciblage du premier élément de la section "Expérience".
    - Extraction de l'**Intitulé du poste** et du **Nom de l'entreprise**.
- **Mise à jour** : Mise à jour des colonnes `current_position`, `company` et passage de `data_enriched` à `true` dans la table `alumni_profiles`.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/alumni/services/alumni.service.ts` | Méthode `importCsv` à modifier |
| `server/src/modules/alumni/models/alumni-profile.model.ts` | Colonnes à mettre à jour |
| `ai_docs/patterns.md` | Respecter l'architecture NestJS |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/app.module.ts` | MODIFY | Import de `BullModule` |
| `server/src/modules/scraping/scraping.module.ts` | CREATE | Initialisation de la queue `scraping` |
| `server/src/modules/scraping/services/scraping.service.ts` | CREATE | Méthode `addScrapingJob(alumniId, url)` |
| `server/src/modules/scraping/processors/scraping.processor.ts` | CREATE | Worker Puppeteer (Extraction du 1er poste) |

## Implementation Details

### Logic Workflow
1. **Import** : CSV -> Création User/Profil -> Appel à `scrapingService.addScrapingJob`.
2. **Queue** : BullMQ stocke le job dans Redis.
3. **Processing** :
    - Puppeteer se connecte (en utilisant des flags d'optimisation).
    - Extraction des données.
    - Mise à jour du profil en base de données via Sequelize.

## Validation Criteria

### Functional Requirements
- [ ] Le processus d'import CSV ne subit aucun ralentissement.
- [ ] Les profils sont enrichis en moins de 2 minutes après l'import (selon la file d'attente).
- [ ] Gestion des profils privés ou liens invalides sans faire planter le worker.

### Technical Requirements
- [ ] `BullModule` configuré avec les variables d'environnement Redis.
- [ ] Puppeteer s'exécute correctement dans l'environnement Docker.
- [ ] Les types TypeScript sont strictement respectés.
