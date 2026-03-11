# Admin/Staff Messaging PRP

## Goal
Permettre aux administrateurs et membres du staff de contacter n'importe quel utilisateur de la plateforme (Alumni, Staff ou Admin) via la messagerie instantanée en temps réel.

## Why
**Justification métier :**
- **Support & Accompagnement** : Permettre à l'école de répondre directement aux questions des Alumni sur les offres ou événements.
- **Coordination Interne** : Faciliter la communication entre les membres de l'équipe administrative.
- **Centralisation** : Éviter l'utilisation de canaux externes (emails, WhatsApp) pour les échanges liés à la plateforme.

## What
- **Sidebar Admin** : Ajout d'un accès aux messages.
- **Gestion de l'Équipe** : Ajout d'un bouton "Contacter" dans la liste des membres.
- **Gestion des Alumni** : Ajout d'un bouton "Contacter" dans la liste des étudiants d'une promotion.
- **Backend** : Ouverture des droits de création de conversation aux rôles `ADMIN` et `STAFF`.

### Scope
- **Inclus** : Messagerie 1-to-1 avec n'importe quel utilisateur, historique, temps réel.
- **Exclus** : Envoi de messages groupés (broadcast) dans cette version.

---

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `server/src/modules/chat/services/chat.service.ts` | Logique de création de conversation |
| `client/src/app/features/alumni/chat/chat.component.ts` | Composant de chat à réutiliser pour l'interface admin |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/chat/controllers/chat.controller.ts` | MODIFY | Autoriser `ADMIN` et `STAFF` sur `POST /conversations` |
| `client/src/app/app.routes.ts` | MODIFY | Ajouter la route `/admin/messages` |
| `client/src/app/layout/sidebar/sidebar.component.ts` | MODIFY | Ajouter le lien "Messages" dans la sidebar admin |
| `client/src/app/features/admin/staff/staff-list/staff-list.component.ts` | MODIFY | Ajouter le bouton de contact dans le tableau |
| `client/src/app/features/admin/promos/promo-detail/promo-detail.component.ts` | MODIFY | Ajouter le bouton de contact dans le tableau des étudiants |

---

## Implementation Details

### API Endpoints
#### `POST /api/chat/conversations`
- **Roles actuels** : `['ALUMNI']`
- **Nouveaux roles** : `['ALUMNI', 'ADMIN', 'STAFF']`

### Angular Routing
Ajouter sous les enfants de `admin` dans `app.routes.ts` :
```typescript
{
  path: 'messages',
  loadComponent: () => import('./features/alumni/chat/chat.component').then((m) => m.AlumniChatComponent),
}
```

### UI Components (Buttons)
Utiliser l'icône de message (`M8 12h.01M12 12h.01M16 12h.01...`) déjà présente dans l'annuaire pour garder une cohérence visuelle.

---

## Validation Criteria

### Functional Requirements
- [ ] Un Admin peut cliquer sur "Contacter" depuis la liste du staff pour ouvrir un chat avec un collègue.
- [ ] Un Staff peut cliquer sur "Contacter" depuis le détail d'une promo pour ouvrir un chat avec un étudiant.
- [ ] Le lien "Messages" dans la sidebar admin mène vers l'interface de chat complète.
- [ ] On ne peut pas se contacter soi-même.

### Technical Requirements
- [ ] La réutilisation du composant `AlumniChatComponent` fonctionne sans erreur de contexte (Header/Sidebar).
- [ ] TypeScript compile : `docker compose exec server npm run build` & `docker compose exec client npx ng build`

### Security Checklist
- [ ] Vérifier que les conversations créées par un Admin sont bien privées (seuls l'admin et le destinataire y ont accès).
- [ ] Pas de régression sur les droits des Alumni.

---

**Created :** 2026-02-20
**Status :** Ready
