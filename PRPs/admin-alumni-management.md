# PRP: admin-alumni-management

## Goal
Permettre aux administrateurs de gérer les profils Alumni individuellement : modification des informations de base (issues du CSV) et suppression complète d'un étudiant.

## Why
Les erreurs de saisie dans les fichiers CSV sont fréquentes. L'administrateur doit pouvoir corriger manuellement les informations d'un étudiant (nom, prénom, email, etc.) ou supprimer un profil erroné sans avoir à ré-importer toute la promotion.

## What
- **Modification** :
    - Mise à jour des champs "CSV" : Nom, Prénom, Email, LinkedIn, Année de promotion, Diplôme.
    - **Restriction** : Les données issues du scraping (poste actuel, entreprise, statut, flag enrichi) ne sont pas modifiables manuellement pour préserver l'intégrité du pipeline de données.
- **Suppression** :
    - Suppression en cascade : l'AlumniProfile et le compte User associé doivent être supprimés simultanément.
- **Interface** :
    - Ajout d'une colonne "Actions" dans le tableau de détail d'une promotion.
    - Création d'une modal d'édition pour les corrections rapides.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/alumni/models/alumni-profile.model.ts` | Définition des champs (identifiés CSV vs Scraping) |
| `server/src/modules/users/models/user.model.ts` | Relation 1:1 avec le profil |
| `client/src/app/core/services/alumni.service.ts` | Service frontend existant |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/alumni/dto/update-alumni.dto.ts` | CREATE | DTO limitant les champs modifiables |
| `server/src/modules/alumni/services/alumni.service.ts` | MODIFY | Logique `update` (avec transaction) et `delete` |
| `server/src/modules/alumni/controllers/alumni.controller.ts` | MODIFY | Endpoints `PATCH /:id` et `DELETE /:id` |
| `client/src/app/features/admin/promos/alumni-edit-modal/` | CREATE | Modal de formulaire d'édition |
| `client/src/app/features/admin/promos/promo-detail/promo-detail.component.ts` | MODIFY | Intégration des boutons et de la modal |

## Implementation Details

### Fields allowed for Update
- `first_name`
- `last_name`
- `email` (nécessite une mise à jour sur le modèle `User`)
- `linkedin_url`
- `promo_year`
- `diploma`

### API Endpoints
- `PATCH /api/alumni/:id` : Mise à jour du profil et de l'email utilisateur.
- `DELETE /api/alumni/:id` : Suppression totale.

### UI/UX
- Boutons discrets (icônes) en fin de ligne.
- Confirmation systématique avant suppression.
- Rechargement de la liste après action.

## Validation Criteria

### Functional Requirements
- [ ] L'admin peut changer l'email d'un étudiant (vérification d'unicité).
- [ ] Changer l'année de promotion déplace l'étudiant dans la vue correspondante.
- [ ] La suppression retire bien l'utilisateur de la table `users`.
- [ ] Les champs de scraping ne sont pas présents dans le formulaire d'édition.

### Technical Requirements
- [ ] Utilisation d'une transaction Sequelize pour la mise à jour simultanée User/Profile.
- [ ] TypeScript compile & Lint passe.
