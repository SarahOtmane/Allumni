# PRP: admin-job-posting

## Goal
Permettre aux administrateurs de créer et gérer des offres d'emploi sur la plateforme avec une description détaillée (entreprise, missions, profil recherché).

## Why
La plateforme doit faciliter l'accès à l'emploi pour les Alumni. Les administrateurs doivent pouvoir publier des offres qualifiées directement depuis leur backoffice.

## What
- **Backend** : 
    - Mise à jour du modèle `JobOffer` pour inclure les nouveaux champs descriptifs.
    - Migration Sequelize pour ajouter les colonnes manquantes.
    - Création d'un CRUD complet pour les offres d'emploi (réservé ADMIN).
- **Frontend** :
    - Page de gestion des offres (`/admin/jobs`).
    - Formulaire de création d'offre avec tous les champs requis.
    - Liste des offres publiées.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/jobs/models/job-offer.model.ts` | Modèle de base à étendre |
| `ai_docs/patterns.md` | Patterns NestJS & Angular |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/database/migrations/YYYYMMDDHHMMSS-update-job-offers.ts` | CREATE | Migration pour ajouter les colonnes manquantes |
| `server/src/modules/jobs/models/job-offer.model.ts` | MODIFY | Ajout des champs : description entreprise, profil, missions, etc. |
| `server/src/modules/jobs/dto/create-job.dto.ts` | CREATE | DTO de création avec validation |
| `server/src/modules/jobs/services/jobs.service.ts` | CREATE | Logique métier CRUD |
| `server/src/modules/jobs/controllers/jobs.controller.ts` | CREATE | Endpoints protégés |
| `client/src/app/features/admin/jobs/` | CREATE | Feature de création et liste d'offres |
| `client/src/app/core/services/jobs.service.ts` | CREATE | Service frontend pour les offres |

### Existing Patterns to Follow
- Enum pour le type de poste : `CDI`, `CDD`, `PRESTATAIRE`.
- Validation via `class-validator`.
- Reactive Forms Angular pour le formulaire.

## Implementation Details

### Updated Database Schema (`JobOffer`)
- `title` (STRING)
- `type` (ENUM: 'CDI', 'CDD', 'PRESTATAIRE')
- `company` (STRING)
- `description` (TEXT)
- `company_description` (TEXT)
- `profile_description` (TEXT)
- `missions` (TEXT)
- `start_date` (DATE)
- `link` (STRING, NULLABLE)

### API Endpoints
- `POST /api/jobs` : Créer une offre (Admin).
- `GET /api/jobs` : Liste toutes les offres (Admin/Staff).
- `GET /api/jobs/:id` : Détail d'une offre.
- `DELETE /api/jobs/:id` : Supprimer une offre (Admin).

### UI/UX
- **Page Liste** : Tableau avec titre, entreprise, type et date.
- **Page Création** : Formulaire vertical avec Textareas pour les descriptions longues (Missions, Profil).

## Validation Criteria

### Functional Requirements
- [ ] L'admin peut créer une offre avec tous les champs.
- [ ] Le champ "lien" est optionnel.
- [ ] La date de début est obligatoire.
- [ ] Seul un ADMIN peut créer ou supprimer une offre.

### Technical Requirements
- [ ] TypeScript compile sans erreurs.
- [ ] Linting passe sur les deux projets.
- [ ] Migration de base de données effectuée proprement.
