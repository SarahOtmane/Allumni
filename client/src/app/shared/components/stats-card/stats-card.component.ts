import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 rounded-md" [ngClass]="colorClass">
            <ng-content></ng-content>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">{{ value }}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number | string;
  @Input() colorClass: string = 'bg-indigo-100 text-indigo-600';
}
