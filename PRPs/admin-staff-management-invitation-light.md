# PRP: admin-staff-management-invitation-light

## Goal
Permettre aux administrateurs de gérer les membres de l'équipe (Admin et Staff) en les invitant uniquement via leur adresse email.

## Why
Simplifier la gestion de l'équipe au démarrage en se concentrant sur l'accès. L'identifiant unique (email) suffit pour déclencher le flux d'activation sécurisé.

## What
- **Backend** : 
    - Utilisation de la logique existante `inviteUser(email, role)`.
    - Création d'un endpoint pour lister les utilisateurs ADMIN et STAFF.
- **Frontend** :
    - Page "Équipe" (`/admin/staff`).
    - Formulaire d'invitation ultra-simple (Email + Sélecteur de rôle).
    - Tableau listant les membres et leur état d'activation.

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/users/controllers/users.controller.ts` | Endpoint d'invitation existant |
| `server/src/modules/auth/auth.service.ts` | Méthode `inviteUser` existante |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/users/controllers/users.controller.ts` | MODIFY | Ajout de l'endpoint `GET /team` |
| `client/src/app/features/admin/staff/` | CREATE | Dossier de la feature (List, Invite Form) |
| `client/src/app/layout/sidebar/sidebar.component.ts` | MODIFY | Ajout du lien "Équipe" |

## Implementation Details

### API Endpoints
- `POST /api/users/invite` : (Déjà fait) `{ email, role }`.
- `GET /api/users/team` : Renvoie `{ id, email, role, is_active }` pour les rôles Admin/Staff.

### UI/UX
- Liste simple : Email | Rôle | Statut.
- Petit formulaire en haut de page pour ajouter un email rapidement.

## Validation Criteria

### Functional Requirements
- [ ] L'Admin peut inviter un membre via email.
- [ ] Le membre reçoit le mail d'activation.
- [ ] Le membre apparaît dans la liste dès l'envoi de l'invitation.

### Security Checklist
- [ ] Liste de l'équipe accessible uniquement par un `ADMIN`.
