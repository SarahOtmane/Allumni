import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="flex flex-col w-64 bg-slate-900 h-screen text-white border-r border-slate-800">
      <div class="p-6">
        <h1 class="text-xl font-bold tracking-wider text-indigo-400">ALUMNI</h1>
        <p class="text-xs text-slate-400 mt-1 uppercase">Backoffice Admin</p>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-4">
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
          routerLink="/admin/staff"
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
      </nav>

      <div class="p-4 border-t border-slate-800">
        <div class="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">v1.0.0-dev</div>
      </div>
    </div>
  `,
})
export class SidebarComponent {}
