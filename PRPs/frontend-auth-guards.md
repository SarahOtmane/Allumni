# PRP: frontend-auth-guards

## Goal
Implémenter les Guards Angular (`authGuard` et `roleGuard`) pour sécuriser l'accès aux routes selon l'état d'authentification et le rôle de l'utilisateur.

## Why
Pour empêcher les utilisateurs non authentifiés d'accéder aux parties privées de l'application et s'assurer qu'un Alumni ne puisse pas accéder à l'interface Admin (et inversement).

## What
- Création du `authGuard` (vérifie la présence d'un token/utilisateur).
- Création du `roleGuard` (vérifie si le rôle de l'utilisateur correspond au rôle requis par la route).
- Mise en place de structures de routes protégées dans `app.routes.ts`.
- Création d'une page `UnauthorizedComponent` simple pour les accès refusés.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/patterns.md` | Patterns Angular (Guards) |
| `client/src/app/core/services/auth.service.ts` | Service utilisé par les guards |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `client/src/app/core/guards/auth.guard.ts` | CREATE | Guard de vérification d'authentification |
| `client/src/app/core/guards/role.guard.ts` | CREATE | Guard de vérification de rôle |
| `client/src/app/features/unauthorized/unauthorized.component.ts` | CREATE | Page d'erreur 403 |
| `client/src/app/app.routes.ts` | MODIFY | Application des guards sur les routes |

## Implementation Details

### authGuard logic
```typescript
if (authService.isAuthenticated()) return true;
return router.createUrlTree(['/auth/login']);
```

### roleGuard logic
```typescript
const requiredRole = route.data['role'];
if (authService.currentUser()?.role === requiredRole) return true;
return router.createUrlTree(['/unauthorized']);
```

## Validation Criteria

### Functional Requirements
- [ ] Tenter d'accéder à `/admin` sans être connecté redirige vers `/auth/login`.
- [ ] Un utilisateur avec le rôle `ALUMNI` est redirigé vers `/unauthorized` s'il tente d'accéder à une route `ADMIN`.
- [ ] Un utilisateur avec le rôle `ADMIN` peut accéder aux routes `/admin`.

### Technical Requirements
- [ ] Utilisation de la syntaxe `CanActivateFn` (Functional Guards).
- [ ] TypeScript compile & Lint passe.
