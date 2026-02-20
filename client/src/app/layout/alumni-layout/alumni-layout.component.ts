import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Alumni Sidebar -->
      <div class="flex flex-col w-64 bg-indigo-900 h-screen text-white border-r border-indigo-800">
        <div class="p-6">
          <h1 class="text-xl font-bold tracking-wider text-white">PORTAIL ALUMNI</h1>
          <p class="text-xs text-indigo-300 mt-1 uppercase">Communauté & Carrière</p>
        </div>

        <nav class="flex-1 px-4 space-y-2 mt-4">
          <a
            routerLink="/portal/jobs"
            routerLinkActive="bg-indigo-800 text-white border-l-4 border-white"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Offres d'Emploi
          </a>

          <a
            routerLink="/portal/directory"
            routerLinkActive="bg-indigo-800 text-white border-l-4 border-white"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Annuaire
          </a>

          <a
            routerLink="/portal/chat"
            routerLinkActive="bg-indigo-800 text-white border-l-4 border-white"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Messages
          </a>

          <a
            routerLink="/portal/events"
            routerLinkActive="bg-indigo-800 text-white border-l-4 border-white"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Événements
          </a>
        </nav>

        <div class="p-4 border-t border-indigo-800">
          <div class="bg-indigo-800 rounded-lg p-3 text-xs text-indigo-300">Espace Membre</div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Reusing HeaderComponent -->
        <app-header
          [user]="authService.currentUser()"
          (logout)="onLogout()"
          breadcrumbPrefix="Alumni"
          pageTitle="Espace Membre"
        ></app-header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-gray-50">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AlumniLayoutComponent {
  authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
  }
}
