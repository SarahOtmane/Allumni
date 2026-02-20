# GEMINI.md — Alumni Platform

> Ce fichier est lu en priorité absolue par l'agent Gemini CLI à chaque démarrage.
> Il définit les règles du projet, la stack, et les conventions à respecter.

## 1. Vision du Projet

Plateforme SAAS permettant à une école de suivre la carrière de ses anciens élèves via
de l'enrichissement de données (LinkedIn scraping) et d'animer sa communauté professionnelle.

Repo GitHub : https://github.com/SarahOtmane/Allumni

## 2. Stack Technique

| Couche         | Technologie                                    |
|----------------|------------------------------------------------|
| Frontend       | Angular 17+ (Standalone Components, Signals)   |
| Styling        | Tailwind CSS v3.4+                             |
| Backend        | NestJS v10 (Architecture modulaire)            |
| Base données   | MySQL 8.0                                      |
| ORM            | Sequelize v6 (sequelize-typescript)            |
| Queue          | BullMQ + Redis                                 |
| Scraping       | Puppeteer                                      |
| Auth           | JWT + Argon2                                   |
| Infrastructure | Docker & Docker Compose (UNIQUEMENT)           |
| Web Server     | Nginx (Reverse Proxy)                          |
| Linting        | ESLint                                         |
| Formatting     | Prettier                                       |

## 3. Structure du Monorepo

```
alumni-platform/
├── client/                        # Application Angular
│   ├── src/app/
│   │   ├── core/                  # Services Singleton, Interceptors, Guards
│   │   ├── shared/                # UI Components, Pipes, Directives
│   │   ├── layout/                # Header, Sidebar, Footer
│   │   └── features/              # Modules Métiers (Lazy Loaded)
│   │       ├── auth/
│   │       ├── admin/
│   │       ├── alumni/
│   │       └── profile/
│   └── tailwind.config.js
├── server/                        # Application NestJS
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── alumni/
│       │   ├── admin/
│       │   ├── jobs/
│       │   ├── events/
│       │   ├── mail/
│       │   ├── chat/
│       │   ├── notifications/
│       │   └── scraping/          # (Phase 5) LinkedIn Scraping
│       ├── common/                # Decorators, DTOs, Filters
│       └── config/
├── nginx/                         # Config Nginx
├── docker-compose.yml
├── docker-compose.dev.yml
├── GEMINI.md                      # Ce fichier
├── commands/                  # Commandes personnalisées Gemini CLI
│   ├── create-prp.md          # /create-prp
│   └── explore-and-plan.md    # /explore-and-plan
├── ai_docs/                       # Documentation IA (lire avant de coder)
│   ├── concept.md
│   ├── architecture.md
│   ├── database.md
│   ├── patterns.md
│   └── services.md
├── docs/
│   └── TASKS.md
├── PRPs/
└── concept_library/
    └── cc_PRP_flow/
        ├── README.md
        ├── docker-commands.md
        └── PRPs/
            └── base_template_v1.md
```

## 4. Commandes Docker (TOUT passe par Docker)

> ⚠️ Ne jamais lancer npm/node directement sur la machine hôte. Tout passe par Docker.

### Démarrage

```bash
# Démarrer tous les services en développement (hot reload actif)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Démarrer en arrière-plan
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Démarrer uniquement un service
docker compose up client
docker compose up server
docker compose up mysql_db

# Rebuild complet (après modification d'un Dockerfile)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Arrêt & Nettoyage

```bash
# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données MySQL)
docker compose down -v

# Rebuild des images
docker compose build --no-cache
```

### Logs

```bash
docker compose logs -f
docker compose logs -f server
docker compose logs -f client
docker compose logs -f mysql_db
```

### Base de Données & Migrations

```bash
# Appliquer les migrations
docker compose exec server npx sequelize-cli db:migrate

# Rollback dernière migration
docker compose exec server npx sequelize-cli db:migrate:undo

# Rollback toutes les migrations
docker compose exec server npx sequelize-cli db:migrate:undo:all

# Générer une nouvelle migration
docker compose exec server npx sequelize-cli migration:generate --name nom-migration

# Statut des migrations
docker compose exec server npx sequelize-cli db:migrate:status

# Accéder à MySQL (le mot de passe sera demandé interactivement)
docker compose exec mysql_db mysql -u alumni_user -p alumni_db
```

### Commandes Angular (via Docker)

```bash
# Générer un composant standalone
docker compose exec client npx ng generate component features/admin/components/mon-composant --standalone

# Générer un service
docker compose exec client npx ng generate service core/services/mon-service

# Générer un guard
docker compose exec client npx ng generate guard core/guards/mon-guard

# Générer un interceptor
docker compose exec client npx ng generate interceptor core/interceptors/mon-interceptor

# Tests
docker compose exec client npx ng test --watch=false

# Build production
docker compose exec client npx ng build --configuration=production
```

### Commandes NestJS (via Docker)

```bash
# Générer un module complet (module + controller + service)
docker compose exec server npx nest generate resource modules/nom-module

# Générer un module
docker compose exec server npx nest generate module modules/nom-module

# Générer un controller
docker compose exec server npx nest generate controller modules/nom-module/nom-module

# Générer un service
docker compose exec server npx nest generate service modules/nom-module/nom-module

# Tests
docker compose exec server npm run test

# Build TypeScript
docker compose exec server npm run build
```

### Linting & Formatting (via Docker)

```bash
# ESLint
docker compose exec server npm run lint
docker compose exec client npm run lint

# Prettier
docker compose exec server npm run format
docker compose exec client npm run format

# Vérifier sans modifier (CI)
docker compose exec server npx prettier --check "src/**/*.ts"
docker compose exec client npx prettier --check "src/**/*.{ts,html,scss}"
```

## 5. Variables d'Environnement

Les variables sont définies dans `server/.env` (ne jamais committer ce fichier).
Un fichier `server/.env.example` doit toujours être à jour.

```env
# Database
DB_HOST=mysql_db
DB_PORT=3306
DB_USER=alumni_user
DB_PASS=secret
DB_NAME=alumni_db

# Redis
REDIS_HOST=redis_cache
REDIS_PORT=6379

# JWT
JWT_SECRET=change_me_in_production
JWT_EXPIRATION=1d

# App
PORT=3000
NODE_ENV=development
```

## 6. Rôles & RBAC

```typescript
type UserRole = 'ADMIN' | 'STAFF' | 'ALUMNI'
```

- **Accès par Invitation Uniquement** : Pas d'inscription publique.
- **ADMIN** : CRUD complet, Invitations, Import CSV, Gestion contenus, Dashboard analytics
- **STAFF** : Lecture seule (profils alumni, statistiques)
- **ALUMNI** : Annuaire (vue restreinte), Jobs, Events, Messagerie

## 7. Conventions de Code

### Backend (NestJS)
- Toujours utiliser `@UseGuards(JwtAuthGuard, RolesGuard)` sur les contrôleurs
- Toujours valider les inputs avec des classes DTO + `class-validator`
- Utiliser `@InjectModel` pour les repositories Sequelize
- Nommage tables : `snake_case` pluriel (`users`, `alumni_profiles`)
- Nommage colonnes : `snake_case` (`first_name`, `promo_year`)
- Nommage models Sequelize : `PascalCase` singulier (`User`, `AlumniProfile`)

### Frontend (Angular)
- Tous les composants sont `standalone: true` (pas de NgModule)
- Utiliser `inject()` au lieu du constructeur
- Utiliser les Signals pour l'état réactif — ne pas mélanger avec `AsyncPipe`
- Utiliser les Reactive Forms typés stricts
- Pattern Smart/Dumb components : pages = smart, UI = dumb
- Toujours créer un fichier `.loading.ts` pour chaque page

### Git
- Convention de commit : `type(scope): description`
  - Types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
  - Exemple : `feat(auth): add JWT login endpoint`
- Branches : `feature/nom-feature`, `fix/nom-bug`
- Ne jamais pusher du code cassé sur `main`

### ESLint & Prettier
- **Ne jamais** committer du code avec des erreurs ESLint
- Prettier est la référence de formatting — ne pas modifier le style manuellement
- Configs : `.eslintrc.js` et `.prettierrc` à la racine de `client/` et `server/`
- Config Prettier commune :
  ```json
  {
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2,
    "semi": true
  }
  ```

## 8. Documentation IA

Avant de coder, toujours lire dans cet ordre :
- `ai_docs/concept.md` — Vision produit, rôles, fonctionnalités
- `ai_docs/architecture.md` — Stack technique & structure des dossiers
- `ai_docs/database.md` — Schéma MySQL, migrations Sequelize, conventions
- `ai_docs/patterns.md` — Patterns NestJS & Angular à respecter
- `ai_docs/services.md` — Services métier disponibles
- `docs/TASKS.md` — État d'avancement actuel du projet

## 9. Règles Absolues

1. **Ne jamais** lancer de commandes directement sur l'hôte — tout passe par `docker compose exec`
2. **Ne jamais** hardcoder des secrets ou variables d'environnement dans le code
3. **Ne jamais** pusher sans que les types TypeScript compilent
4. **Ne jamais** pusher avec des erreurs ESLint ou de formatting Prettier
5. **Toujours** créer un fichier loading pour chaque page Angular
6. **Toujours** appliquer les Guards JWT + Roles sur les routes protégées
7. **Toujours** valider les données entrantes avec des DTOs
8. **Explorer avant de coder** : lire les fichiers `ai_docs/` avant d'écrire une seule ligne