# PRP Flow - Product Requirement Prompts

## Concept

Un **PRP (Product Requirement Prompt)** est un document structuré qui fournit à un agent IA tout ce dont il a besoin pour livrer du code production-ready du premier coup.

## Différence avec un PRD classique

| PRD Classique | PRP |
|---------------|-----|
| Décrit **quoi** construire | Décrit **quoi** + **comment** |
| Évite les détails techniques | Inclut les détails d'implémentation |
| Pour les humains | Optimisé pour les agents IA |
| Références abstraites | Chemins de fichiers exacts |

## Les 3 Couches d'un PRP

### 1. Contexte
- Chemins de fichiers précis à référencer
- Versions des dépendances
- Extraits de code existants
- Documentation dans `ai_docs/`

### 2. Détails d'Implémentation
- Spécifications API exactes (endpoints NestJS)
- Patterns à suivre (Controllers, Services, DTOs, Angular Signals)
- Architecture des composants Angular (Smart/Dumb)
- Schéma de base de données MySQL + migrations Sequelize

### 3. Validation
- Critères testables
- Checklist de sécurité (JWT Guards, DTOs, RLS)
- Étapes de test manuelles via Docker

## Workflow

```
1. Tu décris la feature à implémenter
   ↓
2. Gemini explore le codebase + ai_docs/
   ↓
3. Gemini génère un PRP dans PRPs/
   ↓
4. Tu valides/ajustes le PRP
   ↓
5. Tu donnes le PRP à Gemini pour implémenter (workflow EPCT)
   ↓
6. Code production-ready
```

## Quand utiliser un PRP ?

| Situation | Workflow |
|-----------|----------|
| Setup initial, grosse feature, nouveau module | **PRP** (ce dossier) |
| Bugfix, refacto, petite feature quotidienne | **EPCT** (`explore-and-plan.md`) |

## Structure des Dossiers

```
alumni-platform/
├── ai_docs/                      # Documentation permanente pour l'IA
│   ├── architecture.md           # Vue d'ensemble technique & stack
│   ├── database.md               # Schéma MySQL, migrations Sequelize
│   ├── patterns.md               # Patterns NestJS & Angular à suivre
│   ├── services.md               # Services métier disponibles
│   └── concept.md                # Vision produit & fonctionnalités
├── PRPs/                         # PRPs générés par feature
│   ├── project-setup.md
│   ├── auth-module.md
│   └── ...
└── concept_library/
    └── cc_PRP_flow/
        ├── README.md             # Ce fichier
        └── PRPs/
            └── base_template_v1.md   # Template de référence
```

## Principe Fondamental

> "Context is king" en ingénierie de prompts agentic.
>
> Les LLM génèrent du code de meilleure qualité avec des références directes
> plutôt que des descriptions vagues.

## Utilisation avec Gemini CLI

```bash
# Dans le terminal à la racine du projet :
gemini

# Prompt pour créer un PRP :
> Lis ai_docs/ et GEMINI.md, puis crée un PRP dans PRPs/ pour [description de la feature]

# Prompt pour exécuter un PRP existant :
> Lis GEMINI.md et ai_docs/, puis implémente le PRP PRPs/[nom-du-prp].md
```

## Commandes de Validation Post-Implémentation

Toujours vérifier via Docker après chaque PRP implémenté :

```bash
# Vérifier que tout compile
docker compose exec server npm run build
docker compose exec client npx ng build

# Vérifier le linting
docker compose exec server npm run lint
docker compose exec client npm run lint

# Vérifier le formatting
docker compose exec server npm run format
docker compose exec client npm run format
```