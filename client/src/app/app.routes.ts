import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth/activate',
    loadComponent: () => import('./features/auth/activate/activate.component').then((m) => m.ActivateComponent),
  },
];
