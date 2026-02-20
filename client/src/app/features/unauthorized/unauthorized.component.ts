import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 class="text-6xl font-bold text-indigo-600">403</h1>
      <h2 class="mt-4 text-2xl font-semibold text-gray-900">Accès non autorisé</h2>
      <p class="mt-2 text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      <div class="mt-6">
        <a routerLink="/" class="text-indigo-600 hover:text-indigo-500 font-medium">Retourner à l'accueil</a>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {}
