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
  @Roles('ADMIN', 'STAFF')
  async findAll(@Query() query: PaginationDto) {
    return this.alumniService.findAll(query);
  }

  @Get('directory')
  @Roles('ALUMNI')
  async findDirectory() {
    return this.alumniService.findRestrictedView();
  }
}
```

### DTO & Validation

Ne jamais utiliser `any` dans les contrôleurs. Toujours utiliser des classes DTO avec `class-validator`.

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

Toujours utiliser `@InjectModel` pour injecter les repositories Sequelize dans les services.

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
      limit: 20,
    });
  }
}
```

### Guard NestJS (JWT + Roles)

```typescript
// server/src/common/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

```typescript
// server/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

```typescript
// server/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

## Frontend (Angular + Signals)

### Smart Component (Page)

Les pages fetchent les données et les passent aux composants enfants via `@Input`.
Ne jamais mélanger Signals et `AsyncPipe` — choisir l'un ou l'autre.

```typescript
// client/src/app/features/admin/dashboard/dashboard.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

@Component({
  standalone: true,
  imports: [StatsCardComponent],
  template: `
    <div class="grid grid-cols-3 gap-4">
      @if (stats()) {
        <app-stats-card title="Total Alumni" [value]="stats()!.total" />
      } @else {
        <p>Chargement...</p>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);

  ngOnInit() {
    this.dashboardService.getStats().subscribe((data) => this.stats.set(data));
  }
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
  `,
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number;
}
```

### Guard Angular (Protection des Routes)

```typescript
// client/src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
```

```typescript
// client/src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'] as string;

  if (authService.currentUser()?.role === requiredRole) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
```

```typescript
// client/src/app/app.routes.ts — Utilisation des guards
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'portal',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ALUMNI' },
    loadChildren: () => import('./features/alumni/alumni.routes').then((m) => m.ALUMNI_ROUTES),
  },
];
```

### Interceptor HTTP (Attacher le Token JWT)

```typescript
// client/src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(authReq);
  }

  return next(req);
};
```

```typescript
// client/src/app/app.config.ts — Enregistrement de l'interceptor
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

### Injection de Dépendances (New Style)

Utiliser `inject()` au lieu du constructeur.

```typescript
export class UserProfileComponent {
  private authService = inject(AuthService); // ✅ Nouveau pattern
  private route = inject(ActivatedRoute);
}
```

### Gestion des Formulaires (Reactive Forms Typed)

```typescript
loginForm = new FormGroup({
  email: new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  }),
  password: new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  }),
});

onSubmit() {
  const { email, password } = this.loginForm.getRawValue(); // Typage garanti
}
```