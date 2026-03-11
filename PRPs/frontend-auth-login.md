# PRP: frontend-auth-login

## Goal
Implémenter la page de connexion (Login) et la gestion de l'état d'authentification (JWT) dans le frontend Angular.

## Why
Une fois leur compte activé, les utilisateurs doivent pouvoir se connecter pour accéder aux fonctionnalités protégées de la plateforme (Admin, Staff ou Alumni).

## What
- Mise à jour du `AuthService` pour gérer le login, le stockage du token (localStorage) et l'état de l'utilisateur (Signals).
- Création du composant `LoginComponent` dans `features/auth/login`.
- Formulaire de connexion (Email / Password) avec validation.
- Mise en place d'un `AuthInterceptor` pour injecter automatiquement le token JWT dans toutes les requêtes HTTP.
- Redirection automatique selon le rôle après connexion (ex: `/admin` pour les admins, `/portal` pour les alumni).

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/patterns.md` | Patterns Angular (Signals, Interceptor, Forms) |
| `PRPs/backend-foundation-models-routes.md` | Spécification de l'endpoint `/api/auth/login` |
| `client/src/app/core/services/auth.service.ts` | Base existante du service auth |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `client/src/app/core/services/auth.service.ts` | MODIFY | Ajout de `login`, `logout` et `checkAuth` |
| `client/src/app/core/interceptors/auth.interceptor.ts` | CREATE | Intercepteur pour attacher le token |
| `client/src/app/features/auth/login/login.component.ts` | CREATE | Page de connexion |
| `client/src/app/features/auth/login/login.loading.ts` | CREATE | État de chargement |
| `client/src/app/app.routes.ts` | MODIFY | Route `/auth/login` |
| `client/src/app/app.config.ts` | MODIFY | Enregistrement de l'intercepteur |

## Implementation Details

### API Interaction
Endpoint: `POST /api/auth/login`
Request: `{ email, password }`
Response: `{ access_token, user: { id, email, role, ... } }`

### AuthService Logic
- `login()`: Appelle l'API, stocke le token dans `localStorage`, met à jour le signal `currentUser`.
- `logout()`: Vide le `localStorage`, réinitialise le signal et redirige vers le login.

### AuthInterceptor
```typescript
const token = authService.getToken();
if (token) {
  req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
```

## Validation Criteria

### Functional Requirements
- [ ] L'utilisateur peut se connecter avec ses identifiants activés.
- [ ] Le token est bien stocké dans le navigateur.
- [ ] En cas d'erreur (identifiants invalides), un message d'erreur s'affiche.
- [ ] Si l'utilisateur est déjà connecté, il ne devrait pas voir la page de login (redirection).
- [ ] Les requêtes suivantes vers l'API contiennent bien le header `Authorization`.

### Technical Requirements
- [ ] Utilisation des **Signals** pour l'état `currentUser`.
- [ ] Reactive Forms typés stricts.
- [ ] TypeScript compile & Lint passe.
- [ ] Respect du pattern Loading component.
