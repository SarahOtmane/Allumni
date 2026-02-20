# TASKS.md — Alumni Platform

> Fichier de suivi vivant. Mis à jour après chaque session de travail.
> Indique toujours la "prochaine étape" pour l'agent.

## État Actuel du Projet

**Phase :** 🛠️ Développement des fonctionnalités core  
**Dernière mise à jour :** 2026-02-19

---

## ✅ Terminé

### Fondations & Infrastructure
- [x] Conception du produit (`ai_docs/concept.md`)
- [x] Documentation technique (`ai_docs/architecture.md`, `ai_docs/database.md`, `ai_docs/patterns.md`, `ai_docs/services.md`)
- [x] Initialisation du Monorepo (Docker, Angular, NestJS, MySQL, Redis)
- [x] Environnement de développement avec Hot-Reload
- [x] Configuration ESLint & Prettier (Client & Server)

### Backend (NestJS)
- [x] Initialisation des modules : Users, Auth, Alumni, Jobs, Events, Chat, Mail
- [x] Modèles Sequelize & Migrations (Users, AlumniProfile, Promotion, JobOffer, Event, EventRegistration)
- [x] Système d'Auth complet : JWT Strategy, Guards, Login
- [x] Système d'invitation & activation de compte (Token, Mail)
- [x] RBAC (Roles Decorator & Guard)
- [x] CRUD Admin pour Alumni, Staff, Jobs et Events
- [x] Logique d'import CSV pour les alumni
- [x] Endpoints statistiques pour le dashboard

### Frontend (Angular)
- [x] Layouts globaux (Admin & Alumni) avec Header dynamique et Sidebar
- [x] Authentification : Page de login, Activation de compte
- [x] Guards & Interceptor JWT
- [x] **Backoffice Admin** :
    - [x] Dashboard avec KPIs (StatsCard)
    - [x] Gestion des promotions (Liste, Création)
    - [x] Gestion des étudiants (Liste par promo, Détails, Édition, Suppression, Import CSV)
    - [x] Gestion de l'équipe (Invitation Staff/Admin, Liste)
    - [x] Gestion des Offres d'Emploi (CRUD)
    - [x] Gestion des Événements (CRUD)
- [x] **Portail Alumni** :
    - [x] Job Board (Liste filtrable, Détails en modal, Skeleton loading)
    - [x] Events Board (Liste par onglets, Inscription/Désinscription, Confirmation)
    - [x] Annuaire (Vue restreinte par promo, Recherche par nom/poste, Skeleton loading)

---

## 🔄 En Cours

- [ ] Optimisation de l'UX et polissage des interfaces.

---

## 📋 Backlog (Par Ordre de Priorité)

### Phase 5 — Pipeline de Scraping (LinkedIn)
- [ ] Module `scraping` NestJS
- [ ] Producer BullMQ (ajout à la queue lors de l'import CSV)
- [ ] Consumer/Processor Puppeteer (scraping LinkedIn pour extraire le poste actuel)
- [ ] Gestion des erreurs et retry (profils privés, etc.)

### Phase 6 — Communication & Engagement
- [x] PRP Créé : `PRPs/alumni-messaging.md`
- [x] PRP Créé : `PRPs/admin-messaging.md`
- [x] Messagerie instantanée entre Alumni (temps réel)
- [x] Messagerie Admin/Staff vers tous les utilisateurs
- [x] Système de notifications temps réel (Messages, Jobs, Events)
- [ ] Système de notifications par Email (nouvelles offres ou events)

### Phase 7 — Finalisation & Déploiement
- [x] `docker-compose.yml` de production
- [ ] Configuration Nginx pour la production (SSL avec Certbot)
- [ ] Scripts de backup base de données
- [ ] Documentation utilisateur final

---

## 🚀 Prochaine Étape

**Implémenter le pipeline de scraping LinkedIn** pour enrichir automatiquement les profils alumni importés.
