# Patterns de Code Alumni

## Backend (NestJS + Sequelize)

### Controller Pattern (avec DTO & RBAC)
Chaque contrôleur doit être sécurisé par défaut avec `JwtAuthGuard`. Le RBAC est géré via le décorateur custom `@Roles`.

```typescript
// server/src/modules/alumni/alumni.controller.ts
import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AlumniService } from './alumni.service';

@Controller('alumni')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Get()
  @Roles('ADMIN', 'STAFF') // Seuls Admin/Staff voient tout
  async findAll(@Query() query: PaginationDto) {
    return this.alumniService.findAll(query);
  }

  @Get('public')
  @Roles('ALUMNI') // Vue restreinte pour les alumni
  async findPublicDirectory() {
    return this.alumniService.findRestrictedViews();
  }
}
```

### DTO & Validation
Ne jamais utiliser any dans les contrôleurs. Utiliser des classes DTO avec class-validator.

```typescript
// server/src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(['ADMIN', 'STAFF', 'ALUMNI'])
  role: string;
}
```

### Service Pattern (Repository Injection)
Toujours utiliser @InjectModel pour injecter les repositories Sequelize dans les services. Cela facilite les tests unitaires.

```typescript
// server/src/modules/alumni/alumni.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AlumniProfile } from './alumni.model';

@Injectable()
export class AlumniService {
  constructor(
    @InjectModel(AlumniProfile)
    private alumniModel: typeof AlumniProfile,
  ) {}

  async findAll(query: any): Promise<AlumniProfile[]> {
    return this.alumniModel.findAll({
      where: { ...query.filters },
      limit: 20
    });
  }
}
```

## Frontend (Angular + Signals)

### Smart Component (Page)
```typescript
// client/src/app/features/admin/dashboard/dashboard.component.ts
import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';

@Component({
  standalone: true,
  imports: [AsyncPipe, StatsCardComponent],
  template: `
    <div class="grid grid-cols-3 gap-4">
      <app-stats-card title="Total Alumni" [value]="stats()?.total" />
    </div>
  `
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);
  
  // Utilisation des Signals pour l'état local
  stats = this.dashboardService.getStats(); 
}
```

### Dumb Component (UI)
```typescript
// client/src/app/shared/components/stats-card/stats-card.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 class="text-gray-500 text-sm font-medium">{{ title }}</h3>
      <p class="text-3xl font-bold text-primary-600 mt-2">{{ value }}</p>
    </div>
  `
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number | undefined;
}
```

### Standalone Components
Nous n'utilisons plus de NgModule (sauf cas rare). Tous les composants sont standalone: true.

```typescript
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ButtonComponent], // Importer ce dont on a besoin
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {}
```

### Injection de Dépendances (New Style)
Utiliser la fonction inject() au lieu du constructeur pour plus de clarté.

```typescript
export class UserProfileComponent {
  private authService = inject(AuthService); // ✅ Nouveau pattern
  private route = inject(ActivatedRoute);
  
  // user$ = this.authService.currentUser$;
}
```

### Gestion des Formulaires (Reactive Forms Typed)
Utiliser les formulaires réactifs typés stricts.

```typescript
loginForm = new FormGroup({
  email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
});

onSubmit() {
  const { email, password } = this.loginForm.getRawValue(); // Typage garanti
}
```