# PRP: admin-dashboard

## Goal
Implémenter le tableau de bord d'administration (Dashboard) permettant de visualiser les indicateurs clés de performance (KPIs) de la plateforme (promotions, étudiants, staff, événements, offres d'emploi).

## Why
Les administrateurs ont besoin d'une vue d'ensemble rapide sur l'activité et l'état de la communauté Alumni dès leur connexion pour piloter la plateforme efficacement.

## What
- **Backend** : Création d'un module `Admin` avec un service de statistiques agrégeant les données des différents modules (`Users`, `Alumni`, `Events`, `Jobs`).
- **Frontend** : 
    - Création d'un composant de page `DashboardComponent`.
    - Création d'un composant réutilisable `StatsCardComponent` pour l'affichage des KPIs.
    - Intégration du service `AdminService` pour récupérer les données.
- **Scope** :
    - Nombre de promotions (années distinctes).
    - Nombre total d'étudiants.
    - Nombre d'étudiants actifs vs non-actifs.
    - Nombre de membres du Staff.
    - Nombre d'Administrateurs.
    - Nombre total d'événements.
    - Nombre total d'offres d'emploi.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/patterns.md` | Patterns Angular (Signals, Smart/Dumb components) |
| `server/src/modules/users/models/user.model.ts` | Modèle User pour les comptes |
| `server/src/modules/alumni/models/alumni-profile.model.ts` | Modèle Alumni pour les promotions |
| `server/src/modules/events/models/event.model.ts` | Modèle Event |
| `server/src/modules/jobs/models/job-offer.model.ts` | Modèle JobOffer |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/admin/admin.module.ts` | CREATE | Nouveau module Admin |
| `server/src/modules/admin/controllers/admin.controller.ts` | CREATE | Endpoint `GET /admin/stats` |
| `server/src/modules/admin/services/admin.service.ts` | CREATE | Logique d'agrégation Sequelize |
| `client/src/app/shared/components/stats-card/stats-card.component.ts` | CREATE | Dumb Component UI pour les cartes |
| `client/src/app/features/admin/dashboard/dashboard.component.ts` | CREATE | Smart Component Page |
| `client/src/app/features/admin/dashboard/dashboard.loading.ts" | CREATE | État de chargement de la page |
| `client/src/app/app.routes.ts` | MODIFY | Enregistrement de la route `/admin` |

### Existing Patterns to Follow
- Utilisation de `Sequelize` pour les agrégations (`count`, `fn('DISTINCT', ...)`).
- Utilisation des **Signals** Angular pour l'état réactif de la page.
- Styling Tailwind CSS pour les cartes (ombre, bordures, icônes).

## Implementation Details

### API Endpoints
**GET `/api/admin/stats`**
- Roles: `ADMIN`, `STAFF`
- Response:
```json
{
  "promotionsCount": 5,
  "alumni": {
    "total": 150,
    "active": 120,
    "inactive": 30
  },
  "staffCount": 10,
  "adminCount": 2,
  "eventsCount": 8,
  "jobsCount": 25
}
```

### Angular Components
**StatsCardComponent**
- Inputs: `title` (string), `value` (number), `icon` (string), `color` (string).

## Validation Criteria

### Functional Requirements
- [ ] L'Admin arrive sur le dashboard après son login.
- [ ] Toutes les cartes affichent les chiffres réels issus de la base de données.
- [ ] La distinction entre étudiants actifs et inactifs est correcte.
- [ ] Le chargement est géré par un spinner ou squelette.

### Technical Requirements
- [ ] TypeScript compile : `docker compose exec server npm run build`
- [ ] TypeScript compile : `docker compose exec client npx ng build`
- [ ] ESLint passe : `docker compose exec server npm run lint`
- [ ] ESLint passe : `docker compose exec client npm run lint`
- [ ] Aucune `console.error` dans le navigateur.

### Security Checklist
- [ ] `@UseGuards(JwtAuthGuard, RolesGuard)` sur `AdminController`.
- [ ] `@Roles('ADMIN', 'STAFF')` défini sur l'endpoint des stats.
- [ ] Guard Angular `roleGuard` actif sur la route `/admin`.
