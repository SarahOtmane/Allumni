# Architecture Alumni Platform

## Stack Technique

| Couche | Technologie | Détails / Version |
|---|---|---|
| **Frontend** | **Angular** | v17+ (Standalone Components, Signals) |
| **Styling** | **Tailwind CSS** | v3.4+ (Configuré via PostCSS) |
| **Backend** | **NestJS** | v10 (Architecture modulaire) |
| **Base de Données** | **MySQL** | v8.0 (Hébergée via Docker) |
| **ORM** | **Sequelize** | v6 (`sequelize-typescript`) |
| **Queueing** | **BullMQ + Redis** | Pour le traitement asynchrone du scraping |
| **Infrastructure** | **Docker & Docker Compose** | Conteneurisation pour déploiement VPS OVH |
| **Web Server** | **Nginx** | Reverse Proxy & Gestion SSL (Certbot) |

## Structure des Dossiers (Monorepo)

alumni-platform/
├── client/                     # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services Singleton, Interceptors, Guards
│   │   │   ├── shared/         # UI Components, Pipes, Directives
│   │   │   ├── layout/         # Header, Sidebar, Footer
│   │   │   ├── features/       # Modules Métiers (Lazy Loaded)
│   │   │   │   ├── auth/       # Login, Register
│   │   │   │   ├── admin/      # Backoffice (Dashboard, Users, Import)
│   │   │   │   ├── alumni/     # Portail (Annuaire, Jobs, Events)
│   │   │   │   └── profile/    # Gestion profil utilisateur
│   │   │   └── app.routes.ts
│   │   └── environments/
│   └── tailwind.config.js
│
├── server/                     # Application NestJS
│   ├── src/
│   │   ├── modules/            # Modules par domaine
│   │   │   ├── auth/           # JWT Strategy, Guards
│   │   │   ├── users/          # User Entity, Services
│   │   │   ├── alumni/         # Profils spécifiques & Data
│   │   │   ├── scraping/       # Logique d'import CSV & Queue
│   │   │   └── content/        # Jobs, Events
│   │   ├── common/             # Decorators, DTOs partagés, Filters
│   │   ├── config/             # Config Sequelize & Env
│   │   └── main.ts
│   └── .env
│
├── docker-compose.yml          # Orchestration Prod & Dev
└── ai_docs/                    # Documentation IA (ce dossier)

## Portails par Rôle
| Rôle | Route | Scope Données | Permissions |
|------|-------|-------|-------|
| School Admin | `/admin/*` | Global | CRUD complet, Import CSV, Gestion Contenu |
| School Staff | `/admin/*` | Global | Lecture seule (Alumni, Stats) |
| Alumni | `/portal/*` | Restreint | Annuaire (Vue limitée), Jobs, Events, Chat |

## Sécurité & Pipeline

### Authentification
- **Invitation-Only :** Pas d'endpoint de création de compte public.
- **Activation Flow :** Token sécurisé généré lors de la création manuelle ou de l'import. Le token expire après 48h.
- **JWT (JSON Web Tokens) :** Utilisé pour sécuriser toutes les requêtes API une fois le compte activé.

### Pipeline de Scraping (Asynchrone)
- Import : Admin upload CSV → API stocke en BDD (Status: PENDING).
- Queue : API ajoute un Job dans Redis via BullMQ.
- Processing : Worker (NestJS) récupère le Job, lance Puppeteer, scrape LinkedIn.
- Update : Worker met à jour MySQL via Sequelize (Status: COMPLETED).