import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-dashboard-loading',
  template: `
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      @for (i of [1, 2, 3, 4, 5, 6, 7]; track i) {
        <div class="bg-gray-200 h-32 rounded-lg shadow"></div>
      }
    </div>
  `,
})
export class DashboardLoadingComponent {}
