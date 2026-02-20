# Alumni Real-time Messaging PRP

## Goal
Permettre aux anciens élèves (Alumni) de communiquer directement entre eux sur la plateforme via un système de messagerie instantanée en temps réel, accessible depuis l'annuaire.

## Why
**Justification métier :**
- **Renforcer la communauté** : Faciliter les échanges directs pour le mentorat, le recrutement ou le réseautage.
- **Engagement** : Augmenter la rétention des utilisateurs en centralisant les communications professionnelles.
- **Confidentialité** : Permettre le networking sans avoir à partager son email personnel ou son numéro de téléphone.

## What
- **Action de contact** : Ajout d'un bouton "Contacter" sur chaque carte d'alumni dans l'annuaire.
- **Gestion des conversations** : Création ou récupération automatique d'une conversation 1-to-1 lors du clic sur "Contacter".
- **Chat temps réel** : Envoi et réception de messages instantanés via WebSockets.
- **Interface de messagerie** : Une page dédiée pour gérer ses discussions actives.

### Scope
- **Inclus** : Messagerie 1-to-1, historique des messages, indicateur de messages non lus, interface de chat de base.
- **Exclus** : Chats de groupe, partage de fichiers, appels audio/vidéo, édition/suppression de messages (V1).

---

## Technical Context

### Dependencies to Add
> ⚠️ Ces dépendances doivent être installées via `docker compose exec` sur les conteneurs respectifs.

**Server :**
- `@nestjs/websockets`
- `@nestjs/platform-socket.io`

**Client :**
- `socket.io-client`

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/patterns.md` | Patterns NestJS & Angular à suivre |
| `server/src/modules/chat/models/*.model.ts` | Modèles Sequelize déjà présents |
| `client/src/app/features/alumni/directory/directory.component.ts` | Composant où ajouter le bouton "Contacter" |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/chat/chat.gateway.ts` | CREATE | Gateway WebSocket pour les événements temps réel |
| `server/src/modules/chat/services/chat.service.ts` | CREATE | Logique métier (création conv, stockage messages) |
| `server/src/modules/chat/controllers/chat.controller.ts` | CREATE | Endpoints REST (historique, liste des convs) |
| `client/src/app/core/services/chat.service.ts` | CREATE | Service Angular (WebSocket + HTTP) |
| `client/src/app/features/alumni/chat/chat.component.ts` | CREATE | Interface principale de messagerie (Smart) |
| `client/src/app/features/alumni/chat/chat.loading.ts` | CREATE | Skeleton loader pour le chat |
| `client/src/app/app.routes.ts` | MODIFY | Route `/portal/chat` |

---

## Implementation Details

### API Endpoints (REST)
- `GET /api/chat/conversations` : Liste des discussions de l'utilisateur connecté.
- `GET /api/chat/conversations/:id/messages` : Historique des messages d'une discussion.
- `POST /api/chat/conversations` : Initialise une conversation avec un autre utilisateur (via `user_id`).

### WebSocket Events (Socket.io)
- `sendMessage` : Envoyer un message vers une conversation.
- `newMessage` : (Serveur -> Client) Notifier le destinataire d'un nouveau message.
- `joinRoom` : Rejoindre une "room" de conversation pour isoler les flux.

### Security
- **Auth WS** : Le handshake Socket.io doit valider le token JWT.
- **Isolation** : Un utilisateur ne peut rejoindre que les rooms des conversations dont il est participant.

---

## Validation Criteria

### Functional Requirements
- [ ] Cliquer sur "Contacter" dans l'annuaire ouvre une discussion avec l'alumni ciblé.
- [ ] Les messages s'affichent instantanément sans rafraîchir la page pour les deux participants.
- [ ] L'historique des messages est conservé et s'affiche correctement lors de la réouverture d'un chat.
- [ ] Une notification visuelle apparaît pour les messages non lus.

### Technical Requirements
- [ ] Utilisation des **Signals Angular** pour la réactivité de la liste des messages.
- [ ] Gestion des états de connexion/déconnexion du WebSocket.
- [ ] Respect strict du pattern Smart/Dumb pour les composants de chat.

### Security Checklist
- [ ] Validation du JWT lors de la connexion WebSocket.
- [ ] Vérification systématique des droits d'accès à une conversation côté serveur.

---

**Created :** 2026-02-19
**Status :** Ready
