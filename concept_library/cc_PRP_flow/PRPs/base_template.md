# [Feature Name] PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

[Une phrase claire : "Permettre à [type d'utilisateur] de [action] afin que [bénéfice]"]

## Why

**Justification Métier :**
- [Qui bénéficie de cette feature ?]
- [Quel problème résout-elle ?]
- [Quel est l'impact attendu ?]

**Priority :** [High / Medium / Low]

---

## What

### Feature Description
[Explication détaillée de ce que fait la feature]

### Scope

**In Scope :**
- [Aspect de la feature 1]
- [Aspect de la feature 2]

**Out of Scope :**
- [Aspect explicitement exclu 1]
- [Aspect explicitement exclu 2]

### User Stories
1. En tant que [type d'utilisateur], je veux [action] afin de [bénéfice]
2. ...

---

## Technical Context

### Files to Reference (Read-Only)
Ces fichiers fournissent le contexte et les patterns à suivre :

| File | Purpose |
|------|---------|
| `ai_docs/architecture.md` | Stack technique & structure des dossiers |
| `ai_docs/database.md` | Schéma MySQL, conventions de nommage |
| `ai_docs/patterns.md` | Patterns NestJS (Controller/Service/DTO) & Angular (Smart/Dumb, Signals) |
| `ai_docs/services.md` | Services métier existants à réutiliser |
| `path/to/existing/file.ts` | [Pourquoi ce fichier est pertinent] |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/src/modules/[module]/[module].controller.ts` | CREATE | Controller NestJS avec Guards |
| `server/src/modules/[module]/[module].service.ts` | CREATE | Logique métier |
| `server/src/modules/[module]/dto/[action].dto.ts` | CREATE | DTO avec class-validator |
| `server/src/modules/[module]/[module].model.ts` | CREATE | Model Sequelize |
| `client/src/app/features/[feature]/[page].component.ts` | CREATE | Smart Component Angular |
| `client/src/app/features/[feature]/[page].component.html` | CREATE | Template Angular |
| `path/to/existing/file.ts` | MODIFY | [Ce qui change] |

### Existing Patterns to Follow

**Backend — Controller NestJS :**
```typescript
@Controller('resource')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  async findAll(@Query() query: PaginationDto) {
    return this.resourceService.findAll(query);
  }
}
```

**Backend — Service NestJS :**
```typescript
@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource)
    private resourceModel: typeof Resource,
  ) {}

  async findAll(query: any): Promise<Resource[]> {
    return this.resourceModel.findAll({ where: { ...query.filters } });
  }
}
```

**Frontend — Smart Component Angular :**
```typescript
@Component({
  standalone: true,
  imports: [AsyncPipe, DumbComponent],
  template: `...`
})
export class PageComponent {
  private service = inject(FeatureService);
  data = this.service.getData();
}
```

### Dependencies
- [Nouvelle lib npm si nécessaire — sinon "Aucune nouvelle dépendance"]
- [Dépendances internes existantes à utiliser]

---

## Implementation Details

### API Endpoints (if applicable)

#### `METHOD /api/endpoint`
**Purpose :** [Ce que fait cet endpoint]

**Auth :** Roles requis : `['ADMIN']` | `['ADMIN', 'STAFF']` | `['ALUMNI']`

**Request :**
```typescript
{
  field: string
  optionalField?: number
}
```

**Response :**
```typescript
{
  data: { ... }
  message?: string
}
```

### Database Schema (if applicable)

```sql
-- Nouvelle table
CREATE TABLE table_name (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  -- ... autres colonnes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_table_user (user_id)
);
```

**Migration Sequelize à générer :**
```bash
docker compose exec server npx sequelize-cli migration:generate --name create-table-name
```

### Angular Components (if applicable)

| Component | Type | Location | Description |
|-----------|------|----------|-------------|
| `FeaturePageComponent` | Smart | `features/[feature]/` | Page principale, fetche les données |
| `FeatureCardComponent` | Dumb | `shared/components/` | UI réutilisable, reçoit les données en @Input |

---

## Validation Criteria

### Functional Requirements
- [ ] [Requirement 1 — testable]
- [ ] [Requirement 2 — testable]
- [ ] [Requirement 3 — testable]

### Technical Requirements
- [ ] TypeScript compile sans erreur : `docker compose exec server npm run build`
- [ ] TypeScript compile sans erreur : `docker compose exec client npx ng build`
- [ ] ESLint passe : `docker compose exec server npm run lint`
- [ ] ESLint passe : `docker compose exec client npm run lint`
- [ ] Prettier appliqué : `docker compose exec server npm run format`
- [ ] Aucune `console.error` dans le navigateur
- [ ] Loading states implémentés sur les composants Angular
- [ ] Gestion des erreurs HTTP en place (interceptor ou try/catch)

### Security Checklist
- [ ] `@UseGuards(JwtAuthGuard, RolesGuard)` sur tous les controllers protégés
- [ ] `@Roles(...)` défini sur chaque route selon le RBAC
- [ ] Validation des inputs via classes DTO + `class-validator`
- [ ] Aucune clé secrète ou variable d'env hardcodée
- [ ] Guard Angular implémenté sur les routes protégées côté client

### Testing Steps
1. [Étape 1 : Comment tester — ex: `POST http://localhost:3000/api/resource`]
2. [Étape 2 : Résultat attendu]
3. [Étape 3 : Cas limite à vérifier]

---

## External Resources

- [Lien vers la documentation officielle si lib externe]
- [Lien vers le design / maquette si disponible]
- [Lien vers la tâche associée dans TASKS.md]

---

**Created :** [Date]
**Status :** Draft | Ready | In Progress | Completed