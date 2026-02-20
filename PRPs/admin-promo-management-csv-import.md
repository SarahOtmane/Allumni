# PRP: admin-promo-management-csv-import

## Goal
Permettre aux administrateurs de gérer les promotions (années de diplôme), de visualiser les listes d'alumni par année, et d'importer massivement des étudiants via des fichiers CSV avec validation de l'année.

## Why
L'import CSV est le point d'entrée principal des données de la plateforme. La gestion par promotion permet une navigation structurée et facilite le suivi des cohortes par l'école.

## What
- **Gestion des Promotions** :
    - Liste des années de promotion existantes.
    - Ajout d'une nouvelle année (promotion) avec vérification d'unicité.
    - Vue détaillée d'une promotion (liste des alumni).
    - État vide : afficher "Pas d'étudiants ajoutés" si la promo est vide.
- **Import CSV** :
    - Bouton d'import présent dans chaque promotion.
    - Pop-up informative expliquant le format requis (Nom, Prénom, Email, Linkedin, Année, Diplôme).
    - Validation : L'année de diplôme dans le CSV doit correspondre à l'année de la promotion sélectionnée.
    - Rapport d'erreurs : Liste des lignes rejetées (ex: année incorrecte, email déjà pris).
    - Création automatique : Création du `User` (rôle ALUMNI, inactif) et du `AlumniProfile`.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/users/models/user.model.ts` | Création des comptes Alumni |
| `server/src/modules/alumni/models/alumni-profile.model.ts` | Stockage des infos de promotion |
| `server/src/modules/auth/auth.service.ts` | Utilisation de `inviteUser` après création |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/alumni/models/promotion.model.ts` | CREATE | Nouveau modèle pour stocker les années de promo |
| `server/src/modules/alumni/controllers/alumni.controller.ts` | MODIFY | Endpoints promos et import |
| `server/src/modules/alumni/services/alumni.service.ts" | MODIFY | Logique d'import et de parsing CSV |
| `client/src/app/features/admin/promos/` | CREATE | Dossier de la feature (List, Detail, Import) |
| `client/src/app/shared/components/modal/` | CREATE | Composant générique pour la pop-up CSV |

### Existing Patterns to Follow
- **Backend** : Utilisation de `multer` pour l'upload et `csv-parser` pour le traitement.
- **Frontend** : Pattern Smart/Dumb. Utilisation de `ReactiveFormsModule` pour l'ajout d'année.

## Implementation Details

### API Endpoints
- `GET /api/alumni/promos` : Liste toutes les promotions.
- `POST /api/alumni/promos` : Crée une nouvelle année `{ year: number }`.
- `GET /api/alumni/promos/:year` : Liste les alumni d'une année.
- `POST /api/alumni/import/:year` : Upload et traite le fichier CSV.

### CSV Structure Reclame
| Nom | Prénom | Email | URL Linkedin | Année de diplôme | Quel diplôme |
|-----|--------|-------|--------------|------------------|--------------|

### Frontend Components
- `PromoListComponent` : Grille de cartes (ex: "2025", "2024").
- `PromoDetailComponent` : Tableau des étudiants.
- `CsvImportModal` : Template avec exemple de CSV et bouton d'upload.

## Validation Criteria

### Functional Requirements
- [ ] L'admin ne peut pas créer deux fois la même année.
- [ ] Si le CSV contient "2024" alors qu'on importe dans la promo "2025", la ligne est rejetée.
- [ ] Les étudiants importés apparaissent immédiatement dans la liste (après rafraîchissement).
- [ ] La pop-up d'explication s'affiche avant chaque import.

### Technical Requirements
- [ ] TypeScript compile & Lint passe sur les deux projets.
- [ ] Gestion propre des fichiers temporaires après import CSV.
- [ ] Utilisation de `transaction` Sequelize pour garantir que `User` et `AlumniProfile` sont créés ensemble.

### Security Checklist
- [ ] Seul le rôle `ADMIN` peut importer des CSV.
- [ ] Validation du type MIME du fichier (uniquement `.csv`).
