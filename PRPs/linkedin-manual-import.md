# LinkedIn Manual Import (Apify Bypass) PRP

## Goal
Permettre l'enrichissement des profils Alumni via un flux manuel : export des URLs LinkedIn -> Scraping manuel sur Apify -> Import du JSON de résultats -> Mise à jour automatique des profils et affichage des expériences détaillées.

## Why
Le plan gratuit d'Apify bloque l'accès API automatisé. Ce flux manuel permet de bénéficier de la puissance d'Apify sans frais, tout en gardant une intégration fluide dans l'application pour le traitement des données et leur affichage.

## What
- **Export URLs** : Un bouton pour télécharger un JSON formaté pour Apify (`{ "profileUrls": [...] }`) pour une promotion donnée.
- **Import JSON** : Une modal permettant d'uploader le fichier de résultats d'Apify.
- **Traitement Backend** : Un endpoint qui parse le JSON, identifie les alumni par leur URL LinkedIn, et met à jour leur poste, entreprise et historique d'expériences.
- **UI Expériences** : Un bouton "Détails" dans le tableau pour afficher le parcours complet de l'alumni dans une modal.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/alumni/services/alumni.service.ts` | Logique d'import/update existante |
| `client/src/app/features/admin/promos/promo-detail/promo-detail.component.ts` | Page de gestion des promotions |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/alumni/models/alumni-profile.model.ts` | MODIFY | Ajouter le champ `experiences` (JSON) |
| `server/src/modules/alumni/services/alumni.service.ts` | MODIFY | Ajouter `getLinkedinUrls` et `importScrapedData` |
| `server/src/modules/alumni/controllers/alumni.controller.ts` | MODIFY | Endpoints GET (export) et POST (import) |
| `client/src/app/core/services/alumni.service.ts` | MODIFY | Ajouter les appels API pour l'export/import |
| `client/src/app/features/admin/promos/promo-detail/` | MODIFY | Ajouter les boutons et les deux nouvelles modals (Import JSON & Détails) |

## Implementation Details

### Database Changes
Migration pour ajouter à `alumni_profiles` :
- `experiences` : `DataType.JSON` (stocke un tableau d'objets `{ title, company, duration, description }`)

### API Endpoints
- `GET /api/alumni/promos/:year/linkedin-urls` : Retourne `{ profileUrls: string[] }`.
- `POST /api/alumni/import-scraped-data` : Reçoit le JSON Apify et met à jour les profils.

### UI Workflow
1. **Admin** clique sur "Exporter pour Apify".
2. **Admin** utilise le fichier sur Apify.com et télécharge le résultat.
3. **Admin** clique sur "Importer JSON Apify" et sélectionne le fichier.
4. L'application affiche un résumé (ex: "15 profils mis à jour").
5. Le tableau se rafraîchit, le bouton "Détails" devient accessible pour voir le parcours.

## Validation Criteria

### Functional Requirements
- [ ] Le fichier exporté contient bien toutes les URLs LinkedIn de la promo.
- [ ] L'import du JSON Apify met à jour correctement `current_position`, `company` et `experiences`.
- [ ] Le bouton "Détails" affiche une modal propre avec la timeline des expériences.
- [ ] Les profils sans URL LinkedIn ne font pas planter l'export/import.

### Technical Requirements
- [ ] Migration Sequelize propre.
- [ ] Typage TypeScript strict pour les objets d'expérience.
- [ ] Build Angular et NestJS sans erreur.

### Security Checklist
- [ ] Endpoints d'import/export protégés par `@Roles('ADMIN')`.
- [ ] Validation de la structure du JSON importé côté serveur.
