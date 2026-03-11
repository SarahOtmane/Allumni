import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AlumniService, Promotion, Alumni } from '../../../core/services/alumni.service';
import { DirectoryLoadingComponent } from './directory.loading';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChatService } from '../../../core/services/chat.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-alumni-directory',
  imports: [CommonModule, DirectoryLoadingComponent, ReactiveFormsModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <!-- High-Fidelity Header Section -->
      <header class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center space-x-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">
            <span class="w-8 h-[2px] bg-indigo-600"></span>
            <span>Réseau Alumni</span>
          </div>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">
            Annuaire des
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Anciens</span>
          </h1>
          <p class="text-slate-500 mt-2 text-lg font-medium">
            Connectez-vous avec vos camarades et boostez votre carrière.
          </p>
        </div>

        <div class="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex -space-x-3 overflow-hidden p-1">
            <div
              *ngFor="let i of [1, 2, 3, 4]"
              class="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase"
            >
              {{ i }}
            </div>
          </div>
          <div class="pr-4 border-l border-slate-100 pl-4">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter">Membres Actifs</p>
            <p class="text-sm font-black text-slate-900">{{ alumni().length }}+</p>
          </div>
        </div>
      </header>

      <!-- Search & Filters Bar (Glassmorphism) -->
      <div
        class="sticky top-4 z-10 mb-10 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-3xl p-6 transition-all duration-300"
      >
        <div class="flex flex-col lg:flex-row gap-6 items-center">
          <!-- Search Bar -->
          <div class="relative flex-1 w-full">
            <span
              class="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              [formControl]="searchFilter"
              type="text"
              placeholder="Rechercher par nom, poste ou entreprise..."
              class="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none font-medium"
            />
          </div>

          <!-- Promo Selector -->
          <div
            class="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar w-full lg:w-auto min-w-0"
          >
            @for (promo of promos(); track promo.year) {
              <button
                (click)="selectedYear.set(promo.year)"
                [class.active-promo]="selectedYear() === promo.year"
                class="promo-btn shrink-0"
              >
                {{ promo.year }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Alumni Grid -->
      @if (isLoading()) {
        <app-directory-loading />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          @for (alumnus of alumni(); track alumnus.id) {
            <div class="alumni-card group">
              <!-- Card Header with Cover (minimal) -->
              <div
                class="h-20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-t-3xl border-b border-white/10 group-hover:from-indigo-500/20 group-hover:to-violet-500/20 transition-all duration-500"
              ></div>

              <div class="px-6 pb-6 -mt-10">
                <!-- Avatar & Status -->
                <div class="flex justify-between items-end mb-4">
                  <div class="relative">
                    <div class="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-50 overflow-hidden">
                      <div
                        class="h-full w-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-indigo-600 font-black text-2xl group-hover:scale-110 transition-transform duration-500"
                      >
                        {{ alumnus.first_name?.[0] || '?' }}{{ alumnus.last_name?.[0] || '' }}
                      </div>
                    </div>
                    <span
                      class="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-4 border-white rounded-full shadow-sm"
                    ></span>
                  </div>

                  @if (alumnus.linkedin_url) {
                    <a
                      [href]="alumnus.linkedin_url"
                      target="_blank"
                      class="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/5 transition-all duration-300"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                        />
                      </svg>
                    </a>
                  }
                </div>

                <!-- Info -->
                <div class="space-y-1">
                  <h3
                    class="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors"
                  >
                    {{ alumnus.first_name }} {{ alumnus.last_name }}
                  </h3>
                  <p class="text-sm font-bold text-slate-500 flex items-center">
                    <svg class="w-4 h-4 mr-1.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {{ alumnus.current_position || 'Explore de nouvelles opportunités' }}
                  </p>
                  @if (alumnus.company) {
                    <p class="text-sm font-medium text-slate-400 flex items-center">
                      <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {{ alumnus.company }}
                    </p>
                  }
                </div>

                <!-- Footer Action -->
                <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                  <button
                    (click)="contactAlumni(alumnus.user_id)"
                    class="flex-1 py-3 px-4 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-indigo-600 shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center group/btn"
                  >
                    <svg
                      class="h-4 w-4 mr-2 group-hover/btn:animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Message
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div
              class="col-span-full py-24 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem]"
            >
              <div class="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">Aucun profil trouvé</h3>
              <p class="text-slate-500 max-w-sm mx-auto">
                Ajustez votre recherche ou choisissez une autre promotion pour explorer notre communauté.
              </p>
            </div>
          }
        </div>
      }
    </div>

    <style>
      .promo-btn {
        @apply px-6 py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-bold transition-all hover:bg-slate-50 active:scale-95;
      }
      .active-promo {
        @apply bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20;
      }
      .alumni-card {
        @apply bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10;
      }
      .custom-scrollbar::-webkit-scrollbar {
        height: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        @apply bg-slate-200 rounded-full;
      }
    </style>
  `,
})
export class AlumniDirectoryComponent implements OnInit {
  private alumniService = inject(AlumniService);
  private chatService = inject(ChatService);
  private router = inject(Router);

  promos = signal<Promotion[]>([]);
  alumni = signal<Alumni[]>([]);
  selectedYear = signal<number | null>(null);
  searchQuery = signal<string>('');
  isLoading = signal(false);

  searchFilter = new FormControl('');

  constructor() {
    // Re-fetch alumni whenever the selected year OR search query changes
    effect(
      () => {
        const year = this.selectedYear();
        const search = this.searchQuery();
        if (year !== null) {
          this.loadAlumni(year, search);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    this.loadPromos();

    this.searchFilter.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.searchQuery.set(value || '');
    });
  }

  loadPromos() {
    this.alumniService.getPromos().subscribe({
      next: (data) => {
        this.promos.set(data);
        if (data.length > 0 && !this.selectedYear()) {
          this.selectedYear.set(data[0].year);
        }
      },
      error: (err) => {
        console.error('Failed to load promotions:', err);
        this.isLoading.set(false);
      },
    });
  }

  loadAlumni(year: number, search?: string) {
    this.isLoading.set(true);
    this.alumniService.getAlumniByYear(year, search).subscribe({
      next: (data) => {
        this.alumni.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  contactAlumni(userId: string | undefined) {
    if (!userId) return;
    this.chatService.createConversation(userId).subscribe((conv) => {
      this.router.navigate(['/portal/chat'], { queryParams: { id: conv.id } });
    });
  }
}
