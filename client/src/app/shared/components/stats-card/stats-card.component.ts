import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="group bg-white overflow-hidden shadow-sm hover:shadow-xl rounded-2xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div
            class="flex-shrink-0 p-4 rounded-xl transition-colors duration-300 group-hover:scale-110"
            [ngClass]="colorClass"
          >
            <ng-content></ng-content>
          </div>
          @if (trend) {
            <div
              [class]="trendPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'"
              class="flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              <svg *ngIf="trendPositive" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <svg *ngIf="!trendPositive" class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              {{ trend }}
            </div>
          }
        </div>
        <div class="mt-5">
          <dt class="text-sm font-semibold text-gray-400 uppercase tracking-wider">{{ title }}</dt>
          <dd class="mt-1 flex items-baseline justify-between">
            <div class="text-3xl font-black text-gray-900 tracking-tight">{{ value }}</div>
          </dd>
        </div>
      </div>
      <!-- Décoration de fond subtile -->
      <div
        class="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500"
      >
        <ng-content select="svg"></ng-content>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number | string;
  @Input() colorClass: string = 'bg-indigo-50 text-indigo-600';
  @Input() trend?: string; // Ex: "+12%"
  @Input() trendPositive: boolean = true;
}
