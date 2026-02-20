import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-directory-loading',
  template: `
    <div class="animate-pulse space-y-6">
      <div class="h-10 bg-gray-200 rounded w-1/4"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (i of [1, 2, 3, 4, 5, 6]; track i) {
          <div class="bg-gray-100 h-32 rounded-xl border border-gray-100"></div>
        }
      </div>
    </div>
  `,
})
export class DirectoryLoadingComponent {}
