# Alumni Directory PRP

## Goal
Permettre aux anciens élèves (Alumni) de consulter l'annuaire de la communauté, filtré par promotion, avec un accès restreint aux informations professionnelles publiques (Nom, Prénom, Poste actuel).

## Why
**Justification métier :**
- **Favoriser le réseautage** : Permettre aux membres de s'identifier par leurs rôles professionnels actuels.
- **Confidentialité** : Respecter le souhait de ne partager que les informations de carrière "publiques" entre pairs, sans exposer les données de contact privées (email) ou les détails administratifs.

## What
Espace "Annuaire" dans le portail Alumni.
- **Inclus** : Liste des promotions, liste des membres par promo, affichage Nom / Prénom / Poste actuel.
- **Exclus** : Emails, numéros de téléphone, historique complet, recherche hors promo (V1).

### User Stories
1. En tant qu'Alumni, je veux sélectionner une promotion pour voir qui en faisait partie.
2. En tant qu'Alumni, je veux voir le poste actuel de mes anciens camarades pour savoir ce qu'ils sont devenus professionnellement.

---

## Technical Context

### Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `ai_docs/patterns.md` | Patterns NestJS & Angular à suivre |
| `server/src/modules/alumni/models/alumni-profile.model.ts` | Structure des données |
| `client/src/app/core/services/alumni.service.ts` | Méthodes de fetch existantes |

### Files to Implement/Modify
| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/alumni/controllers/alumni.controller.ts` | MODIFY | Autoriser l'accès aux promos pour `ALUMNI` |
| `server/src/modules/alumni/services/alumni.service.ts` | MODIFY | Adapter `findByYear` pour filtrer selon le rôle |
| `client/src/app/features/alumni/directory/directory.component.ts` | CREATE | Smart Component de l'annuaire |
| `client/src/app/features/alumni/directory/directory.loading.ts` | CREATE | Skeleton loader |
| `client/src/app/app.routes.ts` | MODIFY | Route `/portal/directory` |
| `client/src/app/layout/alumni-layout/alumni-layout.component.ts` | MODIFY | Lien dans la sidebar |

---

## Implementation Details

### API Endpoints

#### `GET /api/alumni/promos/:year`
**Auth :** `['ADMIN', 'STAFF', 'ALUMNI']`
**Logique de restriction :**
```typescript
async findByYear(year: number, userRole: string) {
  const isAlumni = userRole === 'ALUMNI';
  return this.alumniProfileModel.findAll({
    where: { promo_year: year },
    attributes: isAlumni 
      ? ['id', 'first_name', 'last_name', 'current_position', 'promo_year'] 
      : undefined,
    include: isAlumni ? [] : [{ model: User, attributes: ['id', 'email', 'is_active'] }],
    order: [['last_name', 'ASC']],
  });
}
```

### Angular Components
- **DirectoryComponent** :
  - Sélecteur de promo (Signal `selectedYear`).
  - Liste d'Alumni sous forme de grille ou liste épurée.
  - Affichage : `{{ alumni.first_name }} {{ alumni.last_name }}` et `{{ alumni.current_position || 'N/C' }}`.

---

## Validation Criteria

### Functional Requirements
- [ ] L'email n'apparaît **jamais** dans les résultats pour un utilisateur Alumni.
- [ ] Le poste actuel est affiché s'il est renseigné (sinon afficher "Non renseigné" ou "N/C").
- [ ] La navigation par promotion est fluide.

### Technical Requirements
- [ ] Compilation backend/frontend OK.
- [ ] ESLint sans erreurs.
- [ ] Utilisation de `inject()` et `Signals`.

### Security Checklist
- [ ] `@Roles('ALUMNI')` ajouté sur les endpoints nécessaires.
- [ ] Vérification que `attributes` filtre bien les données sensibles au niveau SQL.

---

**Created :** 2026-02-19
**Status :** Ready
