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
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'promos',
        loadComponent: () =>
          import('./features/admin/promos/promo-list/promo-list.component').then((m) => m.PromoListComponent),
      },
      {
        path: 'promos/:year',
        loadComponent: () =>
          import('./features/admin/promos/promo-detail/promo-detail.component').then((m) => m.PromoDetailComponent),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/admin/staff/staff-list/staff-list.component').then((m) => m.StaffListComponent),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/admin/jobs/job-list/job-list.component').then((m) => m.JobListComponent),
      },
      {
        path: 'jobs/new',
        loadComponent: () =>
          import('./features/admin/jobs/job-create/job-create.component').then((m) => m.JobCreateComponent),
      },
      {
        path: 'jobs/edit/:id',
        loadComponent: () =>
          import('./features/admin/jobs/job-create/job-create.component').then((m) => m.JobCreateComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/admin/events/event-list/event-list.component').then((m) => m.EventListComponent),
      },
      {
        path: 'events/new',
        loadComponent: () =>
          import('./features/admin/events/event-create/event-create.component').then((m) => m.EventCreateComponent),
      },
      {
        path: 'events/edit/:id',
        loadComponent: () =>
          import('./features/admin/events/event-create/event-create.component').then((m) => m.EventCreateComponent),
      },
    ],
  },

  {
    path: 'portal',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ALUMNI'] },
    loadComponent: () => import('./layout/alumni-layout/alumni-layout.component').then((m) => m.AlumniLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: '/portal/jobs',
        pathMatch: 'full',
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/alumni/jobs/job-list/job-list.component').then((m) => m.AlumniJobListComponent),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/alumni/events/event-list/event-list.component').then((m) => m.AlumniEventListComponent),
      },
    ],
  },
  {
    path: '',

    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];
