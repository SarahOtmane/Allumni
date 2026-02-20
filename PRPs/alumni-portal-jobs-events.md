# Alumni Portal - Jobs & Events PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Permettre aux alumni de consulter les offres d'emploi avec des filtres avancés et de gérer leurs inscriptions aux événements (voir, s'inscrire, annuler) avec une expérience utilisateur fluide incluant des états de chargement et des vues détaillées.

## Why

**Justification Métier :**
- **Alumni** : Accéder aux opportunités professionnelles du réseau et participer aux événements de l'école.
- **Problème** : L'interface actuelle est un prototype incomplet (pas de détails, pas d'états de chargement, UI à polir).
- **Impact** : Augmentation de l'engagement des anciens élèves sur la plateforme.

**Priority :** High

---

## What

### Feature Description
Finalisation du portail Alumni pour les sections Jobs et Événements. Cela inclut l'ajout de modales de détails pour les offres d'emploi et les événements, ainsi que l'implémentation des squelettes de chargement (skeletons) pour respecter les conventions du projet.

### Scope

**In Scope :**
- **Job Board** :
    - Filtres réactifs (Titre, Ville, Tri par date).
    - Modale de détails affichant la description complète, les missions et le profil recherché.
    - Squelette de chargement (`job-list.loading.ts`).
- **Event Board** :
    - Navigation par onglets (À venir, Passés, Mes inscriptions).
    - Inscription / Désinscription avec confirmation.
    - Modale de détails affichant la description complète et les infos pratiques.
    - Squelette de chargement (`event-list.loading.ts`).

**Out of Scope :**
- Candidature directe aux jobs (pour l'instant via lien externe).
- Partage d'événements sur les réseaux sociaux.

### User Stories
1. En tant qu'alumni, je veux filtrer les offres d'emploi par ville et par titre pour trouver celles qui me correspondent.
2. En tant qu'alumni, je veux voir les détails d'un job pour comprendre les missions proposées.
3. En tant qu'alumni, je veux voir les événements auxquels je suis inscrit pour m'organiser.
4. En tant qu'alumni, je veux m'inscrire ou me désinscrire d'un événement facilement.

---

## Technical Context

### Files to Reference (Read-Only)
Ces fichiers fournissent le contexte et les patterns à suivre :

| File | Purpose |
|------|---------|
| `ai_docs/patterns.md` | Patterns NestJS & Angular à suivre |
| `server/src/modules/jobs/controllers/jobs.controller.ts` | Endpoints jobs existants |
| `server/src/modules/events/controllers/events.controller.ts` | Endpoints events existants |
| `client/src/app/shared/components/confirm-modal/confirm-modal.component.ts` | Exemple de modal réutilisable |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `client/src/app/features/alumni/jobs/job-list/job-list.component.ts` | MODIFY | Intégration de la modale de détails et du composant de chargement |
| `client/src/app/features/alumni/jobs/job-list/job-list.loading.ts` | CREATE | Skeleton loader pour la liste des jobs |
| `client/src/app/features/alumni/events/event-list/event-list.component.ts` | MODIFY | Intégration de la modale de détails et du composant de chargement |
| `client/src/app/features/alumni/events/event-list/event-list.loading.ts` | CREATE | Skeleton loader pour la liste des événements |
| `client/src/app/shared/components/detail-modal/detail-modal.component.ts` | CREATE | Composant générique (ou spécifique) pour afficher les détails |

### Existing Patterns to Follow

**Frontend — Skeleton Loader :**
```typescript
@Component({
  standalone: true,
  selector: 'app-job-list-loading',
  template: `
    <div class="space-y-4 animate-pulse">
      @for (i of [1, 2, 3]; track i) {
        <div class="bg-gray-200 h-40 rounded-xl shadow-sm border"></div>
      }
    </div>
  `,
})
export class JobListLoadingComponent {}
```

**Frontend — Signal-based State :**
```typescript
isLoading = signal(true);
selectedJob = signal<JobOffer | null>(null);

loadJobs() {
  this.isLoading.set(true);
  this.jobsService.getJobs().subscribe(data => {
    this.jobs.set(data);
    this.isLoading.set(false);
  });
}
```

---

## Implementation Details

### Angular Components

| Component | Type | Location | Description |
|-----------|------|----------|-------------|
| `JobDetailModalComponent` | Dumb | `shared/components/` | Affiche les détails d'une offre (Input: JobOffer) |
| `EventDetailModalComponent` | Dumb | `shared/components/` | Affiche les détails d'un événement (Input: AlumniEvent) |

### Functional Logic

1. **Jobs Filtering** : Utiliser `debounceTime(300)` sur les `valueChanges` des FormControl pour éviter de surcharger le serveur.
2. **Modal Management** : Utiliser un Signal `selectedItem` dans le Smart Component. Si `selectedItem` n'est pas nul, afficher la modal en overlay.

---

## Validation Criteria

### Functional Requirements
- [ ] Les filtres de jobs (titre, lieu, tri) fonctionnent en temps réel.
- [ ] Cliquer sur "Voir les détails" d'un job ouvre une modale avec toutes les infos (Missions, Profil, etc.).
- [ ] Les onglets d'événements (À venir, Passés, Mes inscriptions) filtrent correctement la liste.
- [ ] L'inscription à un événement affiche immédiatement le badge "Inscrit".
- [ ] La désinscription demande une confirmation via une modale.

### Technical Requirements
- [ ] TypeScript compile sans erreur : `docker compose exec client npx ng build`
- [ ] ESLint passe : `docker compose exec client npm run lint`
- [ ] Skeleton loaders affichés pendant le chargement des données.
- [ ] Utilisation stricte des Signals Angular pour l'état.

### Security Checklist
- [ ] Vérifier que les routes `GET /jobs` et `GET /event-management` ont bien le décorateur `@Roles('ALUMNI')`.
- [ ] S'assurer que les données sensibles ne sont pas exposées dans les détails (ex: author_id n'est pas nécessaire pour l'alumni).

### Testing Steps
1. Se connecter en tant qu'ALUMNI.
2. Aller sur `/portal/jobs`, saisir "Paris" dans le filtre lieu. Vérifier la liste.
3. Cliquer sur un job, vérifier que la modale s'affiche.
4. Aller sur `/portal/events`, s'inscrire à un événement "À venir".
5. Vérifier qu'il apparaît dans l'onglet "Mes inscriptions".
6. Annuler l'inscription et vérifier la disparition.

---

**Created :** 2026-02-19
**Status :** Ready
