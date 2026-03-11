import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
          <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight text-white italic">ALUMNI<span class="text-indigo-400 font-normal">HUB</span></h1>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Management Suite</p>
          </div>
        </div>
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
      </nav>

      <div class="p-4 border-t border-slate-800">
        <div class="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">v1.0.0-dev</div>
      </div>
    </div>

    <style>
      .nav-item {
        @apply flex items-center px-4 py-3.5 text-slate-400 rounded-2xl transition-all duration-300 hover:text-white hover:bg-white/5;
      }
      .active-link {
        @apply bg-indigo-600/10 text-indigo-400 shadow-sm ring-1 ring-indigo-500/20;
      }
      .active-link .icon-container {
        @apply text-indigo-400 bg-indigo-500/10;
      }
      .icon-container {
        @apply p-2 rounded-xl mr-4 transition-all duration-300;
      }
      .nav-item:hover .icon-container {
        @apply bg-white/5 text-white scale-110;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        @apply bg-slate-800 rounded-full;
      }
    </style>
  `,
})
export class SidebarComponent {}
