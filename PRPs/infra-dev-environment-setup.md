# infra/dev-environment-setup PRP

## Goal
Mettre en place l'environnement de développement local avec rechargement à chaud (hot-reload) pour le Frontend (Angular) et le Backend (NestJS), et fournir un template de variables d'environnement.

## Why
Actuellement, les Dockerfiles effectuent des builds statiques. Pour développer efficacement, nous avons besoin que les modifications de code soient répercutées instantanément sans avoir à reconstruire les images Docker.

## What
- Création de `docker-compose.dev.yml` pour surcharger la configuration de base.
- Configuration du hot-reload via des volumes Docker.
- Création de `server/.env.example` pour documenter les variables requises.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `GEMINI.md` | Liste des variables d'environnement et commandes Docker |
| `docker-compose.yml` | Configuration de base des services |
| `server/package.json` | Scripts de démarrage NestJS (`start:dev`) |
| `client/package.json` | Scripts de démarrage Angular (`start`) |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `docker-compose.dev.yml` | CREATE | Override pour le développement (volumes, ports, commands) |
| `server/.env.example` | CREATE | Template des variables d'environnement pour le backend |

## Implementation Details

### docker-compose.dev.yml
Le fichier surcharge les services `client` et `server` :
- **Server** :
  - `command: npm run start:dev`
  - Volumes : `./server:/app/server` et un volume anonyme pour `node_modules`.
- **Client** :
  - `command: npm run start -- --host 0.0.0.0 --poll 2000 --disable-host-check`
  - Volumes : `./client:/app/client` et un volume anonyme pour `node_modules`.
  - Ports : Mapper `4200:4200`.

### server/.env.example
Template des variables basées sur `GEMINI.md`.

## Validation Criteria

### Functional Requirements
- [ ] `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` démarre sans erreur.
- [ ] Une modification dans `server/src/main.ts` déclenche un redémarrage du serveur NestJS.
- [ ] Une modification dans `client/src/app/app.component.ts` déclenche un re-build Angular.
- [ ] L'accès à `http://localhost:4200` affiche l'application Angular.
- [ ] L'accès à `http://localhost:3000` répond (NestJS API).

### Technical Requirements
- [ ] Utilisation du stage `builder` dans les Dockerfiles.
- [ ] Les variables d'environnement sont bien lues.

### Security Checklist
- [ ] `.env` est bien présent dans le `.gitignore`.
- [ ] Aucune donnée sensible en dur dans les fichiers créés.
