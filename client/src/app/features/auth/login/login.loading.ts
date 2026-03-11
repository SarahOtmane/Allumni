import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-login-loading',
  template: `
    <div class="flex flex-col items-center justify-center p-4 space-y-3">
      <div class="relative">
        <div class="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
        <div
          class="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"
        ></div>
      </div>
      <span class="text-sm font-medium text-gray-500 animate-pulse">Connexion en cours...</span>
    </div>
  `,
})
export class LoginLoadingComponent {}
