# Plan de Développement par Équipe (3 Développeurs)

Ce document propose une répartition initiale des tâches de développement, organisées en PRP (Project Readiness Plans) par phases et attribuées à une équipe de 3 développeurs. L'objectif est de maximiser le parallélisme tout en gérant les dépendances entre les fonctionnalités.

---

## Vue d'ensemble des Responsabilités

| Développeur | Rôle Principal | Zones de Focus                                              |
|:------------|:---------------|:----------------------------------------------------------|
| **Dev 1**   | Backend Lead   | Core Backend API, Gestion des Données, Infrastructure       |
| **Dev 2**   | Frontend Lead  | Core Frontend UI, Backoffice Admin                          |
| **Dev 3**   | Spécialiste    | Pipeline de Scraping, Portail Alumni (Public)                 |

---

## Répartition des Tâches (PRP par Développeur)

### 🧑‍💻 Développeur 1 : Core Backend & Données

**Objectif :** Établir la base du backend API et la couche de persistance des données pour les entités clés.

**PRPs suggérés :**

1.  **PRP: `infra/dev-environment-setup`**
    *   **Description :** Mettre en place `docker-compose.dev.yml` pour le hot-reload et créer le fichier `.env.example` de référence.
    *   **Concerne :** `docker-compose.dev.yml`, `.env.example`
2.  **PRP: `backend/foundation-nestjs-modules`**
    *   **Description :** Initialiser les modules NestJS de base et structurer le projet selon les `ai_docs/patterns.md`.
    *   **Concerne :** `server/src/app.module.ts`, `server/src/modules/` (structure).
3.  **PRP: `backend/auth-module`**
    *   **Description :** Implémenter le module d'authentification (`auth`), incluant la stratégie JWT, les Guards, les endpoints de Login/Register.
    *   **Concerne :** `server/src/modules/auth/`, `server/src/common/guards/jwt-auth.guard.ts`.
4.  **PRP: `backend/users-module`**
    *   **Description :** Implémenter le module `users` pour la gestion des utilisateurs, incluant l'entité, le service et le contrôleur.
    *   **Concerne :** `server/src/modules/users/`.
5.  **PRP: `db/migrations-users-alumni`**
    *   **Description :** Créer les migrations Sequelize pour les tables `users` et `alumni_profiles`.
    *   **Concerne :** `server/src/migrations/`, `server/src/models/`.
6.  **PRP: `db/migrations-content-messaging`**
    *   **Description :** Créer les migrations Sequelize pour les tables `job_offers`, `events`, `event_registrations`, `conversations` et `messages`.
    *   **Concerne :** `server/src/migrations/`, `server/src/models/`.

---

### 🧑‍💻 Développeur 2 : Frontend Foundation & Admin Backoffice UI

**Objectif :** Construire l'interface utilisateur frontend, en commençant par la fondation Angular et les fonctionnalités du backoffice.

**PRPs suggérés :**

1.  **PRP: `frontend/foundation-angular-routing`**
    *   **Description :** Initialiser l'application Angular avec le routing de base et la structure des modules de features.
    *   **Concerne :** `client/src/app/app.routes.ts`, `client/src/app/features/` (structure).
2.  **PRP: `frontend/layout-global`**
    *   **Description :** Implémenter le layout global de l'application (Header, Sidebar) pour les deux portails (Admin et Alumni).
    *   **Concerne :** `client/src/app/layout/`.
3.  **PRP: `frontend/auth-ui`**
    *   **Description :** Développer les pages de Login et Register pour le module `auth` du frontend, en consommant l'API backend.
    *   **Concerne :** `client/src/app/features/auth/`.
4.  **PRP: `frontend/auth-guards-interceptor`**
    *   **Description :** Implémenter les Guards Angular (`authGuard`, `roleGuard`) et l'Interceptor HTTP (`authInterceptor`) pour gérer l'authentification côté client.
    *   **Concerne :** `client/src/app/core/guards/`, `client/src/app/core/interceptors/`.
5.  **PRP: `admin/dashboard-analytics-ui`**
    *   **Description :** Développer l'interface utilisateur du Dashboard Analytique pour le Backoffice Admin (requiert les APIs de `StatsService`).
    *   **Concerne :** `client/src/app/features/admin/dashboard/`.
6.  **PRP: `admin/alumni-crud-ui`**
    *   **Description :** Implémenter l'interface utilisateur CRUD pour la gestion des profils Alumni dans le Backoffice (liste, détail, édition).
    *   **Concerne :** `client/src/app/features/admin/alumni/`.
7.  **PRP: `admin/import-csv-ui`**
    *   **Description :** Développer l'interface d'upload CSV pour l'import des données Alumni dans le Backoffice.
    *   **Concerne :** `client/src/app/features/admin/import/`.

---

### 🧑‍💻 Développeur 3 : Pipeline de Scraping & Portail Alumni UI

**Objectif :** Mettre en place le moteur d'enrichissement de données (scraping) et développer les fonctionnalités du portail public pour les alumni.

**PRPs suggérés :**

1.  **PRP: `backend/scraping-module-producer`**
    *   **Description :** Implémenter le module NestJS `scraping` et la partie `Producer` (ajout des jobs à la queue BullMQ).
    *   **Concerne :** `server/src/modules/scraping/scraping.service.ts`.
2.  **PRP: `backend/scraping-module-consumer`**
    *   **Description :** Implémenter la partie `Consumer` du module `scraping` (worker Puppeteer pour le scraping LinkedIn) et la gestion des retries/erreurs.
    *   **Concerne :** `server/src/modules/scraping/scraping.processor.ts`.
3.  **PRP: `alumni-portal/directory-ui`**
    *   **Description :** Développer l'interface utilisateur de l'annuaire restreint des anciens élèves.
    *   **Concerne :** `client/src/app/features/alumni/directory/`.
4.  **PRP: `alumni-portal/job-events-board-ui`**
    *   **Description :** Implémenter les interfaces pour le Job Board et l'Events Board (consultation, inscription/candidature).
    *   **Concerne :** `client/src/app/features/alumni/jobs/`, `client/src/app/features/alumni/events/`.
5.  **PRP: `alumni-portal/messaging-ui`**
    *   **Description :** Développer l'interface utilisateur pour la messagerie interne entre alumni.
    *   **Concerne :** `client/src/app/features/alumni/messaging/`.

---

Ce plan est une proposition initiale. Les dépendances entre les PRPs devront être gérées via des discussions régulières entre les développeurs et des points de synchronisation (ex: définition des contrats API).
