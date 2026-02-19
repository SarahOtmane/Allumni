import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/activate',
    loadComponent: () => import('./features/auth/activate/activate.component').then((m) => m.ActivateComponent),
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'STAFF'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },

  {
    path: 'portal',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ALUMNI'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./app.component').then((m) => m.AppComponent), // Placeholder
      },
    ],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];
