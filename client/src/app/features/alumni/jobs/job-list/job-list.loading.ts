import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-job-list-loading',
  template: `
    <div class="space-y-4 animate-pulse">
      @for (i of [1, 2, 3]; track i) {
        <div class="bg-gray-200 h-40 rounded-xl shadow-sm border border-gray-100"></div>
      }
    </div>
  `,
})
export class JobListLoadingComponent {}
