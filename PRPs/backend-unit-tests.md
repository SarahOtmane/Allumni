# Backend Unit Tests PRP

## Goal
Implémenter des tests unitaires complets pour les services critiques du backend : `AuthService`, `AlumniService` et `AdminService`.

## Why
Garantir la fiabilité de la logique métier, prévenir les régressions lors des futurs refactorings (notamment pour le pipeline de scraping) et documenter le comportement attendu des services.

## What
Création des fichiers de tests unitaires utilisant Jest et les utilitaires de test de NestJS.
- **AuthService** : Tester la validation, le login, l'invitation et l'activation de compte.
- **AlumniService** : Tester le CRUD, la recherche filtrée et la logique complexe d'import CSV (incluant les transactions).
- **AdminService** : Tester l'agrégation des statistiques du dashboard.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/auth/auth.service.ts` | Logique d'authentification et invitations |
| `server/src/modules/alumni/services/alumni.service.ts` | Logique métier Alumni et Import CSV |
| `server/src/modules/admin/services/admin.service.ts` | Statistiques du dashboard |
| `server/src/app.controller.spec.ts` | Exemple simple de test unitaires NestJS |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/auth/auth.service.spec.ts` | CREATE | Tests unitaires pour AuthService |
| `server/src/modules/alumni/services/alumni.service.spec.ts` | CREATE | Tests unitaires pour AlumniService |
| `server/src/modules/admin/services/admin.service.spec.ts` | CREATE | Tests unitaires pour AdminService |

### Existing Patterns to Follow
- Utiliser `Test.createTestingModule` de `@nestjs/testing`.
- Mocker les modèles Sequelize avec `getModelToken(Model)`.
- Mocker les dépendances externes : `MailService`, `JwtService`, `Sequelize` (instance), `argon2`.

## Implementation Details

### Mocking Strategy
- **Sequelize Models** : Créer des objets avec les méthodes `findOne`, `findAll`, `create`, `update`, `destroy`, `findByPk`, `count`.
- **Transactions** : Mocker `sequelize.transaction()` pour retourner un objet avec `commit()` et `rollback()`.
- **Argon2** : Mocker `argon2.hash` et `argon2.verify` (utiliser `jest.mock('argon2')`).

### Test Cases Scenarios

#### AuthService
- `validateUser` : Succès, Échec (mauvais mot de passe), Échec (utilisateur inexistant), Échec (compte inactif).
- `inviteUser` : Succès (nouvel utilisateur), Succès (ré-invitation), Échec (déjà actif).
- `activateAccount` : Succès, Échec (token invalide/expiré).

#### AlumniService
- `findByYear` : Avec et sans filtre de recherche.
- `update` / `remove` : Vérifier que la transaction est bien gérée (commit/rollback).
- `importCsv` : Cas de succès (summary correct), Cas d'erreurs de validation (année différente), Cas d'erreurs de doublons.

#### AdminService
- `getStats` : Vérifier que tous les `count()` sont appelés et que l'objet retourné est structuré comme attendu.

## Validation Criteria

### Technical Requirements
- [ ] Les tests passent : `docker compose exec server npm run test`
- [ ] Couverture de code > 80% sur les services ciblés : `docker compose exec server npm run test:cov`
- [ ] Aucun appel réel à la base de données ou aux services externes (Mail) pendant les tests unitaires.
- [ ] ESLint passe : `docker compose exec server npm run lint`

### Security Checklist
- [ ] Vérifier que les mots de passe ne sont jamais loggués en clair dans les tests.
- [ ] Vérifier que les tokens d'activation sont correctement mockés.

### Testing Steps
1. Lancer les tests : `docker compose exec server npm run test`.
2. Vérifier la couverture : `docker compose exec server npm run test:cov`.
3. Simuler une erreur dans un service (ex: changer une condition de validation) et vérifier que le test correspondant échoue.
