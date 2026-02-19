import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
      <div class="flex items-center">
        <!-- Breadcrumb placeholder or Page title -->
        <span class="text-gray-400 mr-2">Admin /</span>
        <span class="font-medium text-gray-700">Vue d'ensemble</span>
      </div>

      <div class="flex items-center space-x-6">
        <div class="flex flex-col text-right">
          <span class="text-sm font-bold text-gray-900">{{ user?.email }}</span>
          <span class="text-xs text-indigo-600 font-medium tracking-tight">{{ user?.role }}</span>
        </div>

        <button
          (click)="logout.emit()"
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
          title="Déconnexion"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() user: User | null = null;
  @Output() logout = new EventEmitter<void>();
}
