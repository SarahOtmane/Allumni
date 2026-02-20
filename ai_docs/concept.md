# Vision du Produit : Alumni

Ce document définit la vision, les objectifs, les fonctionnalités et l'architecture conceptuelle de la plateforme "Alumni".

## 1. Objectifs & Pitch

**Pitch :** Fournir une plateforme SAAS permettant à une école de suivre la carrière de ses anciens élèves via de l'enrichissement de données (notamment depuis LinkedIn) et d'animer sa communauté professionnelle.

**Objectifs Clés :**
- **Pour l'école :** Obtenir des statistiques fiables sur l'employabilité et le parcours des diplômés. Centraliser la communication et la diffusion d'opportunités.
- **Pour les alumni :** Faciliter le réseautage, l'accès à des opportunités de carrière exclusives et le maintien du lien avec la communauté de l'école.

## 2. Acteurs & Rôles (RBAC) & Accès

L'application n'autorise pas l'inscription publique (Self-Register). L'accès est strictement contrôlé par invitation.

- **Flux d'activation (commun à tous) :**
  1. L'utilisateur est créé dans la base (soit par l'Admin, soit via Import CSV/Scraping).
  2. Un email est envoyé avec un lien contenant un **Token d'activation** unique (valide 48h).
  3. L'utilisateur clique sur le lien, définit son mot de passe, et active son compte.

- **School Admin (Backoffice) :**
  - **Création :** Le premier Admin est initialisé par le développeur.
  - **Permissions :** Création de comptes Staff/Admin, Import Alumni, Gestion CRUD totale.

- **School Staff (Backoffice) :**
  - **Accès :** Limité (Lecture seule).
  - **Permissions :** Consultation des profils alumni et des statistiques.

- **Alumni (Portail) :**
  - **Accès :** Portail web dédié.
  - **Permissions :** Accès à l'annuaire (vue restreinte), consultation et inscription aux événements/offres, utilisation de la messagerie interne.

## 3. Architecture des Interfaces

La solution est composée de deux interfaces web distinctes :

- **Backoffice Admin :** Une application web sécurisée destinée à l'administration de l'école. Elle centralise la gestion des données, le content management et l'analyse statistique (Tableaux de données, Dashboard stats, Logs d'import).
- **Portail Alumni :** Une plateforme communautaire pour les anciens élèves, axée sur le networking, les opportunités et le contenu partagé par l'école.

## 4. Fonctionnalités Clés

### 4.1. Backoffice Admin
- **Dashboard Analytique :** Visualisation de métriques clés (taux d'emploi, secteurs d'activité, répartition géographique, etc.).
- **Gestion des Alumni (CRUD) :** Création, lecture, mise à jour et suppression des fiches étudiants.
- **Gestion des Contenus :** Publication et gestion des offres d'emploi, stages, et événements.

### 4.2. Portail Alumni
- **Annuaire des Anciens :** Liste consultable et filtrable des alumni. Les informations sont volontairement restreintes pour la confidentialité (Nom, Prénom, Poste actuel, Promotion).
- **Job & Event Board :** Consultation des opportunités postées par l'école avec possibilité de s'inscrire ou postuler.
- **Messagerie Interne :** Système de chat sécurisé pour permettre les échanges directs entre alumni.

## 5. Flux de Données Principal : Le Pipeline d'Enrichissement

Le cœur de la plateforme réside dans son pipeline de traitement de données automatisé.Elle est conçue de manière asynchrone pour gérer la charge.

1.  **Phase 1 : Import (Trigger)**
    - L'Admin `School Admin` upload un fichier CSV contenant la liste des étudiants.
    - **Champs requis :** `Nom`, `Prénom`, `Email`, `URL LinkedIn`, `Promotion`, `Diplôme`.

2.  **Phase 2 : Mise en file (Queue)**
    - Le backend ne traite pas tout immédiatement. Il valide le fichier et ajoute chaque ligne dans une File d'attente (Redis/BullMQ).

2.  **Phase 2 : Enrichissement - Scraping (Worker)**
    - Un service automatisé (worker) parcourt les URL LinkedIn fournies.
    - Il extrait des informations publiques clés : `Poste actuel` et `Statut` (En poste, En recherche active, etc.).
    - Ce processus doit être conçu pour être résilient et gérer les erreurs (profils privés, URL invalides).

3.  **Phase 3 : Mise à Jour (Persistence)**
    - La base de données de la plateforme est automatiquement mise à jour avec les données fraîchement collectées.
    - Un historique des postes peut être conservé pour suivre l'évolution de carrière.