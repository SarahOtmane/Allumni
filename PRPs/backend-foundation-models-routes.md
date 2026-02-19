# PRP: backend-foundation-models-routes

## Goal
Définir de manière exhaustive les modèles de données Sequelize et la structure des routes de l'API NestJS pour l'ensemble du projet. Ce PRP sert de contrat technique pour tous les développeurs intervenant sur le backend.

## Why
Afin d'assurer la cohérence du système, il est crucial que tous les modèles respectent les mêmes conventions de nommage et que les routes suivent une structure RESTful prévisible avec une gestion des droits (RBAC) uniforme.

## What
- Définition détaillée des entités Sequelize (champs, types, relations).
- Spécification des endpoints de l'API (méthodes, routes, protections).
- Mapping des permissions par rôle (ADMIN, STAFF, ALUMNI).

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/database.md` | Conventions MySQL et Sequelize |
| `ai_docs/patterns.md` | Patterns NestJS (Controllers, Guards) |
| `ai_docs/concept.md` | Rôles et fonctionnalités métiers |

### Files to Implement/Modify
Ce PRP définit la structure que devront suivre les fichiers suivants lors de leur création :
- `server/src/modules/*/models/*.model.ts`
- `server/src/modules/*/controllers/*.controller.ts`
- `server/src/migrations/*.ts`

## Implementation Details

### 1. Database Schema (Sequelize Models)

#### Entity: `User`
- `id`: UUID (Primary Key)
- `email`: STRING (Unique, Indexed)
- `password_hash`: STRING
- `role`: ENUM('ADMIN', 'STAFF', 'ALUMNI')
- `is_active`: BOOLEAN (Default: true)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### Entity: `AlumniProfile`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> Users, Unique)
- `first_name`: STRING
- `last_name`: STRING
- `promo_year`: INTEGER
- `diploma`: STRING
- `linkedin_url`: STRING (Optional)
- `current_position`: STRING (Optional)
- `company`: STRING (Optional)
- `status`: ENUM('OPEN_TO_WORK', 'HIRED', 'STUDENT', 'UNKNOWN')
- `data_enriched`: BOOLEAN (Default: false)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### Entity: `JobOffer`
- `id`: UUID (Primary Key)
- `author_id`: UUID (Foreign Key -> Users)
- `title`: STRING
- `description`: TEXT
- `company`: STRING
- `location`: STRING
- `type`: ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE')
- `salary_range`: STRING (Optional)
- `status`: ENUM('ACTIVE', 'CLOSED')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### Entity: `Event`
- `id`: UUID (Primary Key)
- `author_id`: UUID (Foreign Key -> Users)
- `title`: STRING
- `description`: TEXT
- `date`: DATE
- `location`: STRING
- `max_participants`: INTEGER (Optional)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### Entity: `EventRegistration`
- `id`: UUID (Primary Key)
- `event_id`: UUID (Foreign Key -> Events)
- `user_id`: UUID (Foreign Key -> Users)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### Entity: `Conversation`
- `id`: UUID (Primary Key)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- *Note: Table de jonction `conversation_participants` nécessaire pour la relation N:M.*

#### Entity: `Message`
- `id`: UUID (Primary Key)
- `conversation_id`: UUID (Foreign Key -> Conversations)
- `sender_id`: UUID (Foreign Key -> Users)
- `content`: TEXT
- `is_read`: BOOLEAN (Default: false)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 2. API Routes Structure (`/api`)

| Module | Method | Route | Description | Roles |
|:-------|:-------|:------|:------------|:------|
| **Auth** | POST | `/auth/login` | Connexion JWT | Public |
| | POST | `/auth/register` | Inscription Alumni | Public |
| | GET | `/auth/me` | Profil connecté | All |
| **Users** | GET | `/users` | Liste utilisateurs | ADMIN |
| | PATCH | `/users/:id` | Modifier rôle/status | ADMIN |
| **Alumni**| GET | `/alumni` | Liste complète profils | ADMIN, STAFF |
| | GET | `/alumni/directory`| Annuaire restreint | ALUMNI |
| | GET | `/alumni/:id` | Détail d'un profil | All |
| | PATCH | `/alumni/:id` | Modifier son profil | SELF, ADMIN |
| | POST | `/alumni/import` | Import CSV | ADMIN |
| **Jobs** | GET | `/jobs` | Liste offres | All |
| | POST | `/jobs` | Créer une offre | ADMIN |
| | PATCH | `/jobs/:id` | Modifier une offre | ADMIN |
| | DELETE | `/jobs/:id` | Supprimer une offre | ADMIN |
| **Events**| GET | `/events` | Liste événements | All |
| | POST | `/events` | Créer un événement | ADMIN |
| | POST | `/events/:id/reg`| S'inscrire | ALUMNI |
| | DELETE | `/events/:id/reg`| Se désinscrire | ALUMNI |
| **Chat** | GET | `/chat/conv` | Mes conversations | ALUMNI |
| | POST | `/chat/conv` | Créer une conversation | ALUMNI |
| | GET | `/chat/conv/:id` | Messages d'une conv | ALUMNI |
| | POST | `/chat/msg` | Envoyer un message | ALUMNI |

## Validation Criteria

### Technical Requirements
- [ ] Tous les IDs utilisent des UUID v4.
- [ ] Les tables respectent le `snake_case` au pluriel.
- [ ] Les modèles Sequelize utilisent les décorateurs de `sequelize-typescript`.
- [ ] Chaque contrôleur NestJS utilise `@UseGuards(JwtAuthGuard, RolesGuard)`.
- [ ] Chaque route est décorée avec `@Roles(...)`.

### Documentation Requirements
- [ ] Swagger configuré sur `/api/docs`.
