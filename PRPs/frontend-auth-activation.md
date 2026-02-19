# PRP: frontend-auth-activation

## Goal
Implémenter la page d'activation de compte dans le frontend Angular pour permettre aux utilisateurs invités (Admin, Staff, Alumni) de définir leur mot de passe et d'activer leur accès.

## Why
Le backend est prêt à recevoir les demandes d'activation. Cette interface est indispensable pour fermer la boucle du flux d'invitation sécurisé.

## What
- Création du service `AuthService` côté client pour communiquer avec l'API.
- Création du composant `ActivateComponent` dans les features.
- Récupération du `token` depuis l'URL (`/auth/activate?token=...`).
- Formulaire de saisie du mot de passe avec validation de force et confirmation.
- Gestion des états (chargement, erreur de token expiré, succès).

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/patterns.md` | Conventions Angular (Signals, inject, Standalone) |
| `ai_docs/architecture.md` | Structure des dossiers attendue (`features/auth`) |
| `PRPs/backend-foundation-models-routes.md` | Spécification de l'endpoint `/api/auth/activate` |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `client/src/app/core/services/auth.service.ts` | CREATE | Service pour l'appel API `activate` |
| `client/src/app/features/auth/activate/activate.component.ts` | CREATE | Composant Smart de la page d'activation |
| `client/src/app/features/auth/activate/activate.loading.ts` | CREATE | État de chargement (Règle absolue GEMINI.md) |
| `client/src/app/app.routes.ts` | MODIFY | Enregistrement de la route `/auth/activate` |

### Existing Patterns to Follow
- Utilisation de `inject(ActivatedRoute)` pour le token.
- Utilisation de `ReactiveFormsModule` avec typage strict.
- Tailwind CSS pour le styling (Material Design inspiration).

## Implementation Details

### API Interaction
Endpoint: `POST /api/auth/activate`
Payload: `{ token: string, password: string }`

### Angular Component (ActivateComponent)
- **Logic** :
  - `token = signal<string | null>(null)` (via `route.queryParamMap`).
  - `form = new FormGroup(...)` avec `Validators.minLength(8)`.
  - `loading = signal(false)`.
- **Template** :
  - Design épuré, centré.
  - Inputs stylisés avec Tailwind.
  - Messages d'erreur clairs (ex: "Le lien a expiré").

### Routing
```typescript
{ path: 'auth/activate', component: ActivateComponent }
```

## Validation Criteria

### Functional Requirements
- [ ] La page s'affiche correctement quand on clique sur le lien Mailtrap.
- [ ] Le token est bien extrait de l'URL.
- [ ] Le bouton d'activation est désactivé si le formulaire est invalide.
- [ ] Une erreur 400 du serveur (token expiré) affiche un message explicite à l'utilisateur.
- [ ] Après succès, l'utilisateur est redirigé vers `/auth/login` avec un message de succès.

### Technical Requirements
- [ ] Standalone component : `true`.
- [ ] TypeScript compile : `docker compose exec client npx ng build`.
- [ ] ESLint passe : `docker compose exec client npm run lint`.
- [ ] Présence du fichier `activate.loading.ts`.
- [ ] Utilisation des **Signals** pour l'état de la page.

### Security Checklist
- [ ] Validation de la longueur du mot de passe côté client (min 8).
- [ ] Pas de stockage du token en clair dans le `localStorage`.
