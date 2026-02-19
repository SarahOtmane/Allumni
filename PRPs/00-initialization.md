# Initialisation du Monorepo Alumni Platform PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Permettre à l'équipe de développement d'initialiser et de lancer un monorepo vide pour la plateforme Alumni, incluant les configurations de base Docker, Angular, NestJS, MySQL et Redis, afin de fournir un socle technique fonctionnel pour le développement futur.

## Why

**Justification Métier :**
- Établir une base de projet solide et cohérente, essentielle pour le développement efficace et la maintenance à long terme de la plateforme Alumni.
- Assurer une reproductibilité de l'environnement de développement et de production grâce à Docker, minimisant les problèmes de configuration et les erreurs de déploiement.
- Fournir un point de départ clair et fonctionnel pour l'implémentation des fonctionnalités métier.

**Priority :** High

---

## What

### Feature Description
Ce PRP décrit les étapes nécessaires pour initialiser le monorepo `alumni-platform`. Il inclura la création des dossiers de base (`client/`, `server/`, `ai_docs/`, `PRPs/`), la configuration des fichiers `package.json` pertinents, la mise en place de la conteneurisation via `docker-compose.yml` et les `Dockerfile`s spécifiques pour le frontend Angular (servi par Nginx) et le backend NestJS, ainsi que l'intégration de MySQL et Redis. Un "Hello World" minimal sera mis en place pour valider l'échafaudage.

### Scope

**In Scope :**
- Création de la structure de dossiers `alumni-platform/client`, `alumni-platform/server`, `alumni-platform/ai_docs`, `alumni-platform/PRPs`.
- Initialisation d'un `package.json` à la racine du monorepo.
- Génération d'un projet Angular de base dans `client/`.
- Génération d'un projet NestJS de base dans `server/`.
- Configuration de `docker-compose.yml` pour les services `client` (Angular/Nginx), `server` (NestJS), `mysql_db` et `redis_cache`.
- Création des `Dockerfile`s pour le service `client` (Angular/Nginx) et `server` (NestJS).
- Intégration de ESLint et Prettier avec les configurations de base pour Angular et NestJS.
- Mise en place de routes "Hello World" minimales sur le frontend et le backend pour valider le setup.

**Out of Scope :**
- Implémentation de toute logique métier spécifique à la plateforme Alumni.
- Connexion de l'application NestJS à la base de données MySQL (sera couverte dans un PRP ultérieur).
- Toute fonctionnalité au-delà d'un simple "Hello World" pour les tests d'initialisation.

### User Stories
1.  En tant que développeur, je peux cloner le dépôt et exécuter `docker compose up --build` pour démarrer tous les services.
2.  En tant que développeur, je peux accéder à l'URL du frontend et voir un message "Hello World" ou une page d'accueil Angular par défaut.
3.  En tant que développeur, je peux accéder à l'URL du backend et voir une réponse "Hello World" de l'API NestJS.
4.  En tant que développeur, je peux exécuter les commandes de linting et de formatage sans erreur pour les projets client et server.

---

## Technical Context

### Files to Reference (Read-Only)
Ces fichiers fournissent le contexte et les patterns à suivre :

| File | Purpose |
|------|---------|
| `ai_docs/architecture.md` | Stack technique & structure des dossiers |
| `ai_docs/database.md` | Schéma MySQL, conventions de nommage |
| `ai_docs/patterns.md` | Patterns NestJS (Controller/Service/DTO) & Angular (Smart/Dumb, Signals) |
| `ai_docs/services.md` | Services métier existants à réutiliser |
| `GEMINI.md` | Conventions générales et règles du projet |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `package.json` (root) | CREATE | Fichier de configuration du monorepo |
| `client/` | CREATE | Dossier racine de l'application Angular |
| `client/package.json` | CREATE | Fichier de configuration de l'application Angular |
| `client/.angular.json` | CREATE | Fichier de configuration Angular CLI |
| `client/angular.json` | CREATE | Fichier de configuration Angular CLI (à vérifier si .angular.json ou angular.json) |
| `client/Dockerfile` | CREATE | Dockerfile pour l'application Angular et Nginx |
| `server/` | CREATE | Dossier racine de l'application NestJS |
| `server/package.json` | CREATE | Fichier de configuration de l'application NestJS |
| `server/nest-cli.json` | CREATE | Fichier de configuration NestJS CLI |
| `server/tsconfig.json` | CREATE | Fichier de configuration TypeScript pour NestJS |
| `server/src/main.ts` | MODIFY | Point d'entrée de l'application NestJS pour "Hello World" |
| `server/src/app.controller.ts` | MODIFY | Contrôleur NestJS pour "Hello World" |
| `server/Dockerfile` | CREATE | Dockerfile pour l'application NestJS |
| `docker-compose.yml` | CREATE | Fichier d'orchestration Docker pour tous les services |
| `.gitignore` | CREATE | Règles d'ignorance des fichiers pour Git |
| `.eslintrc.js` (root) | CREATE | Configuration ESLint globale |
| `.prettierrc` (root) | CREATE | Configuration Prettier globale |
| `client/.eslintrc.json` | CREATE | Configuration ESLint spécifique à Angular |
| `server/.eslintrc.js` | CREATE | Configuration ESLint spécifique à NestJS |
| `client/tailwind.config.js` | CREATE | Fichier de configuration Tailwind CSS pour Angular |

### Existing Patterns to Follow
L'initialisation respectera les conventions de nommage et la structure de projet définie dans `ai_docs/architecture.md`, `ai_docs/patterns.md` et `ai_docs/database.md`.
Les DTOs seront utilisés pour les requêtes API même pour le "Hello World" si applicable, et l'injection de dépendances sera le pattern par défaut.

### Dependencies
- **Root `package.json`:** `npm install -w client -w server`
- **Client (Angular):** `@angular/cli`, `@angular/core`, `rxjs`, `zone.js`, `tailwind.css`, `postcss`, `autoprefixer`.
- **Server (NestJS):** `@nestjs/cli`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`, `mysql2`, `sequelize`, `@nestjs/sequelize`, `class-validator`, `class-transformer`.
- **Dev Dependencies (Root/Shared):** `eslint`, `prettier`, `@types/node`.

---

## Implementation Details

### API Endpoints (if applicable)

#### `GET /api`
**Purpose :** Vérifier que l'API NestJS est fonctionnelle et répond avec un message de bienvenue.

**Auth :** Aucune (Endpoint public pour le test d'initialisation).

**Request :** Aucune.

**Response :**
```json
{
  "message": "Hello from NestJS API!"
}
```

### Database Schema (if applicable)

Bien que la base de données MySQL soit initialisée via Docker, aucune modification de schéma spécifique n'est attendue à ce stade au-delà de la création de la base de données par défaut. Le service `server` ne se connectera pas encore à MySQL.

### Angular Components (if applicable)

Un composant de page racine (ex: `app.component.ts` et `app.component.html`) affichant "Hello from Angular Frontend!" ou la page de bienvenue par défaut de Angular sera utilisé pour valider le frontend.

---

## Validation Criteria

### Functional Requirements
- [x] Les services `client`, `server`, `mysql_db` et `redis_cache` démarrent sans erreur via `docker compose up --build`.
- [x] L'application frontend est accessible via Nginx et affiche "Hello from Angular Frontend!" (ou équivalent).
- [x] L'endpoint `/api` du backend NestJS est accessible et retourne le message "Hello from NestJS API!".

### Technical Requirements
- [x] TypeScript compile sans erreur : `docker compose exec server npm run build`
- [x] TypeScript compile sans erreur : `docker compose exec client npx ng build`
- [x] ESLint passe : `docker compose exec server npm run lint`
- [x] ESLint passe : `docker compose exec client npm run lint`
- [x] Prettier appliqué : `docker compose exec server npm run format` (ou `npm run format` à la racine)
- [x] Les fichiers `package.json` sont correctement configurés dans le monorepo.
- [x] Les `Dockerfile`s sont optimisés pour la construction et l'exécution.
- [x] Le `docker-compose.yml` est fonctionnel et gère les dépendances entre services.

### Security Checklist
- [x] Aucune information sensible (mots de passe, clés secrètes) n'est codée en dur dans les `Dockerfile`s ou le `docker-compose.yml`.
- [x] Les variables d'environnement pour MySQL et Redis sont configurées de manière sécurisée (même si par défaut pour l'init).

### Testing Steps
1.  **Démarrer les services :** Ouvrir un terminal à la racine du monorepo et exécuter `docker compose up --build`.
2.  **Vérifier le Frontend :** Ouvrir un navigateur et naviguer vers l'URL configurée pour Nginx (ex: `http://localhost:80`). Vérifier que la page d'accueil Angular s'affiche correctement.
3.  **Vérifier le Backend :** Utiliser un outil comme `curl` ou Postman pour envoyer une requête `GET` à l'endpoint de l'API (ex: `http://localhost:3000/api`). Vérifier que la réponse est `{"message": "Hello from NestJS API!"}`.
4.  **Exécuter les scripts de build/lint :** Exécuter les commandes `npm run build`, `npm run lint` et `npm run format` pour le client et le serveur via `docker compose exec` comme indiqué dans les critères techniques.

---

## External Resources

- `ai_docs/architecture.md`
- `ai_docs/database.md`
- `ai_docs/patterns.md`
- `ai_docs/services.md`
- `GEMINI.md`

---

**Created :** mercredi 18 février 2026
**Status :** Draft