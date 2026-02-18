# Base de Données Alumni Platform (MySQL)

La base de données MySQL est un composant central de la plateforme Alumni, hébergeant toutes les données relationnelles de l'application. Son déploiement et sa gestion sont optimisés via Docker pour garantir fiabilité, persistance et facilité de gestion.

## 1. Conteneurisation de MySQL

-   **Image Docker :** Nous utilisons l'image officielle `mysql:8.0` de Docker Hub, garantissant une version stable et maintenue du SGBD.
-   **Configuration :** La configuration initiale (mot de passe root, base de données par défaut) est gérée via les variables d'environnement passées au conteneur MySQL (`MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`) dans le fichier `docker-compose.yml`.

## 2. Persistance des Données

La persistance des données est cruciale pour la base de données. Pour éviter toute perte de données lors du redémarrage, de la mise à jour ou de la suppression du conteneur MySQL, nous utilisons un **volume Docker persistant**.

-   **Docker Volume :** Un volume nommé est créé et monté sur le chemin de stockage des données de MySQL à l'intérieur du conteneur (généralement `/var/lib/mysql`). Ce volume réside sur le système de fichiers de l'hôte et est géré indépendamment du cycle de vie du conteneur.
-   **Avantages :**
    -   Les données survivent à la suppression du conteneur.
    -   Permet des sauvegardes et restaurations facilitées du volume.
    -   Performance améliorée par rapport aux bind mounts pour certaines charges de travail.

## 3. Gestion des Migrations de Schéma

Les évolutions du schéma de la base de données sont gérées via des migrations contrôlées par version.

-   **ORM et Migrations :** L'ORM `Sequelize` (utilisé par le service `server` NestJS) inclut un système de migrations robuste. Les fichiers de migration (création de tables, ajout de colonnes, modifications de données) sont versionnés avec le code de l'application.
-   **Automatisation :** Les migrations sont appliquées automatiquement au démarrage du service `server` en environnement de développement, ou manuellement via une commande dédiée en production, pour assurer que la structure de la base de données est toujours synchronisée avec la version du code déployée.
-   **Rollback :** Les migrations permettent également de revenir en arrière (rollback) en cas de problème, assurant une gestion sécurisée des évolutions de schéma.

## 4. Accès Sécurisé

-   L'accès à la base de données MySQL est restreint au réseau interne de Docker. Seul le service `server` (NestJS) est autorisé à se connecter à la base de données, minimisant ainsi la surface d'attaque.
-   Des utilisateurs avec des privilèges minimaux sont créés pour l'application, évitant l'utilisation du compte `root` pour les opérations quotidiennes.
-   Les informations sensibles (mots de passe) sont gérées via des variables d'environnement et ne sont pas codées en dur dans l'application.

---

## 5. Entités Principales & Schéma Relationnel

### Schéma Relationnel Général
La base de données est structurée autour des entités suivantes, avec leurs relations principales :
-   `users` (gestion de l'authentification et du RBAC)
    -   `alumni_profiles` (1:1) -> données spécifiques aux anciens élèves (promo, poste actuel, données enrichies)
    -   `job_offers` (1:N) -> créées par les administrateurs
    -   `events` (1:N) -> créés par les administrateurs
    -   `messages` (N:M) -> échanges entre alumni via des `conversations`

### Tables Clés
| Table | Description | Clés Étrangères |
|:------|:------------|:----------------|
| `users` | Comptes de connexion et gestion des rôles (Admin, Staff, Alumni). | - |
| `alumni_profiles` | Contient les détails spécifiques à chaque ancien élève, y compris les données enrichies via le scraping LinkedIn. | `user_id` -> `users.id` |
| `job_offers` | Liste des offres d'emploi ou de stage publiées par l'école. | `author_id` -> `users.id` |
| `events` | Détails des événements organisés par l'école pour les alumni. | `author_id` -> `users.id` |
| `event_registrations` | Enregistre la participation des alumni aux événements. | `user_id`, `event_id` |
| `conversations` | Représente les discussions (groupes ou 1-1) entre alumni. | - |
| `messages` | Contient les messages échangés au sein des conversations. | `conversation_id`, `sender_id` |

## 6. Détails des Champs (Model Sequelize)

Voici un aperçu des champs clés pour les entités `users` et `alumni_profiles`. Les autres entités suivront des conventions similaires.

### `users`
-   `id`: UUID (Clé Primaire)
-   `email`: VARCHAR(255) (Unique, utilisé pour la connexion)
-   `password_hash`: VARCHAR(255) (Hash du mot de passe)
-   `role`: ENUM('ADMIN', 'STAFF', 'ALUMNI') (Rôle de l'utilisateur pour le RBAC)
-   `created_at`: TIMESTAMP (Date de création du compte)
-   `updated_at`: TIMESTAMP (Date de dernière modification)

### `alumni_profiles`
-   `id`: UUID (Clé Primaire)
-   `user_id`: UUID (Clé Étrangère vers `users.id`, Unique)
-   `first_name`: VARCHAR(100)
-   `last_name`: VARCHAR(100)
-   `promo_year`: INT (Année de promotion de l'ancien élève)
-   `diploma`: VARCHAR(100) (Diplôme obtenu)
-   `linkedin_url`: VARCHAR(255) (URL du profil LinkedIn)
-   `current_position`: VARCHAR(255) (Poste actuel, enrichi via scraping)
-   `status`: ENUM('OPEN_TO_WORK', 'HIRED', 'STUDENT', 'UNKNOWN') (Statut d'emploi, enrichi via scraping)
-   `data_enriched`: BOOLEAN (Indique si le profil a été enrichi par le pipeline, Default: `false`)
-   `created_at`: TIMESTAMP
-   `updated_at`: TIMESTAMP

## 7. Conventions de Nommage

Afin de maintenir une cohérence et une lisibilité élevées dans la base de données et le code, les conventions suivantes sont adoptées :
-   **Tables :** `snake_case` au pluriel (ex: `users`, `job_offers`, `alumni_profiles`).
-   **Colonnes :** `snake_case` (ex: `first_name`, `promo_year`).
-   **Models (Code Sequelize) :** `PascalCase` au singulier (ex: `User`, `AlumniProfile`, `JobOffer`).
-   **Clés Étrangères :** `[nom_table_singulier]_id` (ex: `user_id`, `event_id`).
-   **Timestamps :** `created_at` et `updated_at` pour la traçabilité.

## 8. Helper Script Migration (Sequelize CLI)

Pour faciliter la gestion des évolutions du schéma de base de données :

### Générer une nouvelle migration
```bash
npx sequelize-cli migration:generate --name create-users-table
```

### Appliquer les migrations en attente
```bash
npx sequelize-cli db:migrate
```

### Annuler la dernière migration
```bash
npx sequelize-cli db:migrate:undo
```

### Annuler toutes les migrations
```bash
npx sequelize-cli db:migrate:undo:all
```