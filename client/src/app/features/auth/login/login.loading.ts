import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-login-loading',
  template: `
    <div class="flex items-center justify-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600">Connexion en cours...</span>
    </div>
  `,
})
export class LoginLoadingComponent {}
