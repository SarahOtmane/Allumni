# Base de Données Alumni Platform (MySQL)

La base de données MySQL est un composant central de la plateforme Alumni, hébergeant toutes les données relationnelles. Son déploiement est géré via Docker pour garantir fiabilité et persistance.

## 1. Conteneurisation de MySQL

- **Image Docker :** `mysql:8.0` (version stable officielle)
- **Configuration :** via variables d'environnement dans `docker-compose.yml` (`MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`)

## 2. Persistance des Données

Un **volume Docker nommé** est monté sur `/var/lib/mysql` à l'intérieur du conteneur. Les données survivent à la suppression ou au redémarrage du conteneur.

```yaml
# Extrait docker-compose.yml
volumes:
  mysql_data:

services:
  mysql_db:
    image: mysql:8.0
    volumes:
      - mysql_data:/var/lib/mysql
```

## 3. Gestion des Migrations de Schéma

Les évolutions du schéma sont gérées via **Sequelize CLI** — toujours exécuté via Docker.

- Les fichiers de migration sont versionnés avec le code dans `server/src/migrations/`
- En développement, les migrations s'appliquent manuellement après chaque modification de schéma
- En production, les migrations s'appliquent avant le démarrage de l'application

## 4. Accès Sécurisé

- La base de données est accessible **uniquement depuis le réseau interne Docker** — le service `server` (NestJS) est le seul autorisé à s'y connecter
- Les credentials sont gérés via variables d'environnement dans `server/.env`
- Ne jamais utiliser le compte `root` pour les opérations applicatives

---

## 5. Entités Principales & Schéma Relationnel

### Schéma Relationnel Général

```
users
├── alumni_profiles (1:1)   → données spécifiques aux anciens élèves
├── job_offers (1:N)        → créées par les admins
├── events (1:N)            → créés par les admins
└── conversations (N:M)     → via messages entre alumni
```

### Tables Clés

| Table | Description | Clés Étrangères |
|:------|:------------|:----------------|
| `users` | Comptes de connexion + RBAC | — |
| `alumni_profiles` | Détails alumni enrichis via scraping LinkedIn | `user_id` → `users.id` |
| `job_offers` | Offres d'emploi/stage publiées par l'école | `author_id` → `users.id` |
| `events` | Événements organisés par l'école | `author_id` → `users.id` |
| `event_registrations` | Participation des alumni aux événements | `user_id`, `event_id` |
| `conversations` | Discussions entre alumni (1-1 ou groupe) | — |
| `messages` | Messages échangés dans les conversations | `conversation_id`, `sender_id` |

## 6. Détails des Champs (Model Sequelize)

### `users`
- `id` : CHAR(36) — Clé Primaire (UUID)
- `email` : VARCHAR(255) — Unique, utilisé pour la connexion
- `password_hash` : VARCHAR(255) — Hash Argon2
- `role` : ENUM('ADMIN', 'STAFF', 'ALUMNI')
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

### `alumni_profiles`
- `id` : CHAR(36) — Clé Primaire (UUID)
- `user_id` : CHAR(36) — Clé Étrangère vers `users.id` (Unique)
- `first_name` : VARCHAR(100)
- `last_name` : VARCHAR(100)
- `promo_year` : INT — Année de promotion
- `diploma` : VARCHAR(100) — Diplôme obtenu
- `linkedin_url` : VARCHAR(255) — URL du profil LinkedIn
- `current_position` : VARCHAR(255) — Poste actuel (enrichi via scraping)
- `status` : ENUM('OPEN_TO_WORK', 'HIRED', 'STUDENT', 'UNKNOWN') — enrichi via scraping
- `data_enriched` : BOOLEAN — Default `false`
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

## 7. Conventions de Nommage

- **Tables :** `snake_case` pluriel (`users`, `job_offers`, `alumni_profiles`)
- **Colonnes :** `snake_case` (`first_name`, `promo_year`)
- **Models Sequelize :** `PascalCase` singulier (`User`, `AlumniProfile`, `JobOffer`)
- **Clés Étrangères :** `[table_singulier]_id` (`user_id`, `event_id`)
- **Timestamps :** `created_at` et `updated_at` sur toutes les tables

## 8. Pattern de Migration (Sequelize)

```typescript
// server/src/migrations/YYYYMMDDHHMMSS-create-users.ts
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'STAFF', 'ALUMNI'),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('users');
  },
};
```

## 9. Commandes Sequelize CLI (via Docker)

> ⚠️ Toujours utiliser `docker compose exec server` — ne jamais lancer ces commandes directement sur l'hôte.

```bash
# Générer une nouvelle migration
docker compose exec server npx sequelize-cli migration:generate --name create-users-table

# Appliquer toutes les migrations en attente
docker compose exec server npx sequelize-cli db:migrate

# Annuler la dernière migration
docker compose exec server npx sequelize-cli db:migrate:undo

# Annuler toutes les migrations
docker compose exec server npx sequelize-cli db:migrate:undo:all

# Vérifier le statut des migrations
docker compose exec server npx sequelize-cli db:migrate:status
```