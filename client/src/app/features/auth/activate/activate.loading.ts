import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-activate-loading',
  template: `
    <div class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600 font-medium">Activation de votre compte en cours...</p>
    </div>
  `,
})
export class ActivateLoadingComponent {}
