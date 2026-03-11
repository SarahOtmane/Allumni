import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div
      class="flex flex-col w-72 bg-gradient-to-b from-slate-900 to-slate-950 h-screen text-white border-r border-white/5 relative z-20"
    >
      <!-- Logo Section -->
      <div class="p-8 mb-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight text-white italic">
              ALUMNI<span class="text-indigo-400 font-normal">HUB</span>
            </h1>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {{ isAdmin() || isStaff() ? 'Management Suite' : 'Espace Membre' }}
            </p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        <!-- ADMIN & STAFF SECTION -->
        <ng-container *ngIf="isAdmin() || isStaff()">
          <a
            routerLink="/admin"
            [routerLinkActiveOptions]="{ exact: true }"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </a>

          <a
            routerLink="/admin/promos"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Promotions
          </a>

          <a
            *ngIf="isAdmin() || isStaff()"
            routerLink="/admin/staff"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Équipe
          </a>

          <a
            routerLink="/admin/jobs"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            routerLink="/admin/events"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Événements
          </a>

          <a
            routerLink="/admin/messages"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Messages
          </a>

          <div class="pt-4 pb-2 border-t border-slate-800">
            <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Outils</p>
          </div>

          <a
            routerLink="/admin/scraping-guide"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Guide LinkedIn
          </a>
        </ng-container>

        <!-- ALUMNI SECTION -->
        <ng-container *ngIf="isAlumni()">
          <a
            routerLink="/portal/jobs"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            routerLink="/portal/events"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Événements
          </a>

          <a
            routerLink="/portal/chat"
            routerLinkActive="bg-slate-800 text-indigo-400 border-l-4 border-indigo-400"
            class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 transition-all group"
          >
            <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Messages
          </a>
        </ng-container>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <div class="bg-slate-800 rounded-lg p-3 text-xs text-slate-400 italic">
          {{ authService.currentUser()?.email }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #1e293b;
        border-radius: 10px;
      }
    `,
  ],
})
export class SidebarComponent {
  authService = inject(AuthService);

  isAdmin(): boolean {
    return this.authService.currentUser()?.role === 'ADMIN';
  }

  isStaff(): boolean {
    return this.authService.currentUser()?.role === 'STAFF';
  }

  isAlumni(): boolean {
    return this.authService.currentUser()?.role === 'ALUMNI';
  }
}
