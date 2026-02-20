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
    <div class="p-6">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Annuaire des Anciens</h1>
        <p class="text-gray-600">Retrouvez vos camarades et développez votre réseau</p>
      </header>

      <!-- Filters & Search -->
      <div class="flex flex-col md:flex-row md:items-end gap-6 mb-8">
        <!-- Promo Selector -->
        <div class="flex-1">
          <label for="promo-select" class="block text-sm font-medium text-gray-700 mb-2">Choisir une promotion</label>
          <div class="flex flex-wrap gap-2">
            @for (promo of promos(); track promo.year) {
              <button
                (click)="selectedYear.set(promo.year)"
                [class.bg-indigo-600]="selectedYear() === promo.year"
                [class.text-white]="selectedYear() === promo.year"
                [class.bg-white]="selectedYear() !== promo.year"
                [class.text-gray-700]="selectedYear() !== promo.year"
                class="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium transition-all hover:border-indigo-300 shadow-sm"
              >
                {{ promo.year }}
              </button>
            }
          </div>
        </div>

        <!-- Search Bar -->
        <div class="w-full md:w-80">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
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
              placeholder="Nom, prénom, poste..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Alumni List -->
      @if (isLoading()) {
        <app-directory-loading />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (alumnus of alumni(); track alumnus.id) {
            <div
              class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all group"
            >
              <div class="flex items-center space-x-4 mb-4">
                <div
                  class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0"
                >
                  {{ alumnus.first_name[0] }}{{ alumnus.last_name[0] }}
                </div>
                <div class="min-w-0">
                  <h3 class="font-bold text-gray-900 truncate">{{ alumnus.first_name }} {{ alumnus.last_name }}</h3>
                  <p class="text-sm text-indigo-600 font-medium truncate">
                    {{ alumnus.current_position || 'Poste non renseigné' }}
                  </p>
                </div>
              </div>

              <div class="mt-auto pt-4 border-t border-gray-50">
                <button
                  (click)="contactAlumni(alumnus.user_id)"
                  class="w-full py-2 px-4 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Contacter
                </button>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p class="text-gray-500 italic">Aucun membre trouvé pour cette promotion ou recherche.</p>
            </div>
          }
        </div>
      }
    </div>
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
    this.alumniService.getPromos().subscribe((data) => {
      this.promos.set(data);
      if (data.length > 0 && !this.selectedYear()) {
        this.selectedYear.set(data[0].year);
      }
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
