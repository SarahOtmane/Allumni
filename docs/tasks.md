# TASKS.md — Alumni Platform

> Fichier de suivi vivant. Mis à jour après chaque session de travail.
> Indique toujours la "prochaine étape" pour l'agent.

## État Actuel du Projet

**Phase :** ✅ Monorepo Initialisé  
**Dernière mise à jour :** 2026-02-18

---

## ✅ Terminé

- [x] Conception du produit (`ai_docs/concept.md`)
- [x] Documentation architecture (`ai_docs/architecture.md`)
- [x] Documentation base de données (`ai_docs/database.md`)
- [x] Documentation patterns de code (`ai_docs/patterns.md`)
- [x] Documentation services (`ai_docs/services.md`)
- [x] `GEMINI.md` créé à la racine
- [x] `ai_docs/tasks.md` créé (Initialement dans `docs/tasks.md`, déplacé/consolidé ici)
- [x] Méthodologie PRP (`concept_library/cc_PRP_flow/`)
- [x] Commandes Gemini CLI (`.gemini/commands/`)
- [x] PRP d'initialisation créé (`PRPs/00-initialization.md`)
- [x] **Exécution du PRP d'initialisation** :
    - [x] Initialisation du monorepo (structure de dossiers `client/`, `server/`)
    - [x] `docker-compose.yml` principal (mysql, redis, server, client, nginx)
    - [x] Dockerfiles (client Angular, server NestJS)
    - [x] Config Nginx (reverse proxy pour Angular)
    - [x] `server/.env` (variables d'environnement initiales)
    - [x] ESLint configuré (client + server, configs autonomes)
    - [x] Prettier configuré (client + server, config commune racine)
    - [x] Confirmation "Hello World" Frontend (Angular)
    - [x] Confirmation "Hello World" Backend (NestJS API)

---

## 🔄 En Cours

- [ ] Aucune tâche en cours suite à l'initialisation du monorepo.

---

## 📋 Backlog (Par Ordre de Priorité)

### Phase 1 — Setup & Infrastructure (reste à faire)
- [x] `docker-compose.dev.yml` (hot reload pour dev)
- [x] Variables d'environnement (`.env.example`)
- [x] PRP Créé : `PRPs/infra-dev-environment-setup.md`

### Phase 2 — Backend Foundation
- [x] PRP Créé : `PRPs/backend-foundation-models-routes.md` (Définition Modèles & Routes)
- [ ] Initialisation NestJS avec modules de base
- [ ] Module `auth` (JWT Strategy, Guards, Login/Register)
- [ ] Module `users` (Entity, Service, Controller)
- [ ] Migration Sequelize : table `users`
- [ ] Migration Sequelize : table `alumni_profiles`
- [ ] Migration Sequelize : tables `job_offers`, `events`, `event_registrations`
- [ ] Migration Sequelize : tables `conversations`, `messages`

### Phase 3 — Frontend Foundation
- [ ] Initialisation Angular avec routing
- [ ] Layout global (Header, Sidebar)
- [ ] Module `auth` (pages Login/Register)
- [ ] Guards Angular (authGuard, roleGuard)
- [ ] Interceptor HTTP (authInterceptor — attacher le token JWT)

### Phase 4 — Features Backoffice Admin
- [ ] Dashboard Analytics (KPIs, Charts)
- [ ] Gestion Alumni CRUD (liste, détail, édition)
- [ ] Import CSV (upload + validation)

### Phase 5 — Pipeline de Scraping
- [ ] Module `scraping` NestJS
- [ ] Producer BullMQ (ajout à la queue)
- [ ] Consumer/Processor Puppeteer (scraping LinkedIn)
- [ ] Gestion des erreurs et retry

### Phase 6 — Portail Alumni
- [ ] Annuaire (vue restreinte)
- [ ] Job Board (liste + candidature)
- [ ] Events Board (liste + inscription)
- [ ] Messagerie interne (conversations + messages)

---

## 🚀 Prochaine Étape

**Proposer un PRP pour la "Phase 2 — Backend Foundation"** : Initialisation des modules NestJS de base et du module `auth`.