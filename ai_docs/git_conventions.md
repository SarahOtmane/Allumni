# Conventions Git (Commits et Pushes)

Ce document établit les conventions à suivre pour les messages de commit et les pratiques de push dans le projet Alumni Platform. L'objectif est de maintenir un historique Git clair, cohérent et facile à naviguer, facilitant ainsi la revue de code, le débogage et la génération automatique de changelogs.

---

## 1. Conventions de Messages de Commit

Les messages de commit doivent adhérer à la spécification [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), comme mentionné dans `GEMINI.md`.

### Format du Message

Le format de base est le suivant :

```
type(scope): description du commit

[corps du commit optionnel]

[pied de page optionnel, ex: BREAKING CHANGE ou références de tickets]
```

#### `type` (Obligatoire)

Le `type` est un mot clé qui décrit la nature du changement. Il doit être en minuscules.

| Type      | Description                                                                 |
| :-------- | :-------------------------------------------------------------------------- |
| `feat`    | Une nouvelle fonctionnalité (feature)                                       |
| `fix`     | Une correction de bug                                                       |
| `docs`    | Changements de documentation uniquement                                     |
| `style`   | Changements qui n'affectent pas la signification du code (espaces, format, etc.) |
| `refactor`| Un changement de code qui ne corrige pas un bug ni n'ajoute une fonctionnalité |
| `perf`    | Un changement de code qui améliore les performances                         |
| `test`    | Ajout de tests manquants ou correction de tests existants                   |
| `chore`   | Changements à la chaîne de build ou aux outils auxiliaires (non lié à l'app) |
| `build`   | Changements qui affectent le système de build ou les dépendances externes   |
| `ci`      | Changements à nos fichiers et scripts de configuration CI                   |
| `revert`  | Annule un commit précédent                                                  |

#### `scope` (Optionnel)

Le `scope` est un identifiant optionnel qui indique la partie du codebase affectée par le changement. Il doit être en minuscules et ne pas contenir d'espaces.

**Exemples de `scope` pour ce projet :**
*   `client` : Pour les changements dans l'application Angular.
*   `server` : Pour les changements dans l'API NestJS.
*   `auth` : Pour les fonctionnalités d'authentification/autorisation.
*   `alumni` : Pour la gestion des profils alumni.
*   `scraping` : Pour le pipeline d'enrichissement LinkedIn.
*   `db` : Pour les migrations de base de données ou les modèles.
*   `docker` : Pour les fichiers Docker et `docker-compose`.
*   `deps` : Pour les mises à jour de dépendances.
*   `root` : Pour les fichiers à la racine du monorepo (ex: `package.json` racine, `.gitignore`).
*   `prp` : Pour les documents PRP.
*   `docs` : Pour la documentation (fichiers `ai_docs/` ou `docs/`).

#### `description` (Obligatoire)

La `description` est un résumé concis du changement. Elle doit être :
*   Au mode impératif (ex: "ajouter" au lieu de "ajoute" ou "a ajouté").
*   En minuscules.
*   Courte (idéalement moins de 72 caractères).
*   Sans point final.

### Corps du Commit (Optionnel)

Un corps de commit plus détaillé peut être fourni si le changement le justifie. Il doit :
*   Fournir une explication plus approfondie du **pourquoi** du changement (pas seulement le quoi).
*   Être séparé de la description par une ligne vide.
*   Utiliser le mode impératif.

### Pied de Page (Optionnel)

Le pied de page peut inclure des informations importantes comme :
*   **`BREAKING CHANGE:`** (en majuscules) : Indique un changement qui brise la compatibilité ascendante. Doit être suivi d'une description des changements et des instructions de migration si nécessaire.
*   Références à des tickets de gestion de projet (ex: `Closes #123`, `Fixes #456`).

### Exemples de Messages de Commit

```
feat(client): ajouter la page de connexion initiale

refactor(server,auth): séparer le service d'authentification

fix(scraping): corriger l'extraction de l'URL LinkedIn

docs(db): ajouter les détails de la table user
```

---

## 2. Conventions de Push

### Fréquence des Pushes

*   **Pusher souvent et par petits incréments :** Chaque commit doit représenter une unité de travail logique et atomique.
*   **Ne pas pusher de code cassé sur `main` :** Conformément à `GEMINI.md`, la branche `main` doit toujours être stable et déployable.

### Stratégie de Branches

*   **`main` :** La branche principale et stable. Toutes les releases proviennent de cette branche. Les commits directs sur `main` sont **interdits** (sauf pour des hotfixes critiques après approbation).
*   **`develop` :** Branche d'intégration pour toutes les nouvelles fonctionnalités. Les branches de fonctionnalités y sont fusionnées.
*   **Branches de Fonctionnalités (`feat/ma-nouvelle-feature`, `fix/bug-correction`...) :** Chaque nouvelle fonctionnalité, correction de bug ou refactoring significatif doit être développé sur une branche dédiée à partir de `develop`.

### Pull Requests (PRs)

*   Toute fusion vers `develop` (et `main` si applicable) doit se faire via une **Pull Request (PR)**.
*   Les PRs doivent être revues et approuvées par au moins un autre développeur (ou par le Lead Tech/PM pour les PRs de l'IA).
*   Les PRs doivent inclure une description claire des changements, des validations effectuées et des instructions de test si nécessaire.

### Rebase ou Merge ?

*   **Préférer le `rebase`** pour maintenir un historique linéaire et propre sur les branches de fonctionnalités avant la fusion dans `develop`.
*   Utiliser le `merge` (fast-forward si possible) lors de la fusion d'une branche de fonctionnalité dans `develop` ou `develop` dans `main`. Éviter les `merge commits` excessifs pour garder l'historique clair.

---

Ce document servira de référence pour tous les contributeurs au projet afin d'assurer la qualité et la clarté de l'historique de version.
