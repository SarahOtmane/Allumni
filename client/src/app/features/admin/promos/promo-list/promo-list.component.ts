import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlumniService, Promotion } from '../../../../core/services/alumni.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-10 bg-gray-50/30 min-h-screen">
      <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div class="flex items-center text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">
            <span class="opacity-50">Gestion</span>
            <span class="mx-2 text-gray-300">/</span>
            <span>Promotions</span>
          </div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Annuaires par Promotion</h1>
          <p class="text-gray-500 font-medium mt-1">Gérez les années de diplôme et accédez aux listes d'étudiants.</p>
        </div>

        @if (authService.currentUser()?.role === 'ADMIN' || authService.currentUser()?.role === 'STAFF') {
          <div
            class="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100 group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          >
            <input
              type="number"
              [formControl]="yearControl"
              placeholder="Ex: 2025"
              class="block w-32 px-4 py-2 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900"
            />
            <button
              (click)="addYear()"
              [disabled]="yearControl.invalid"
              class="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              Ajouter
            </button>
          </div>
        }
      </header>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        @for (promo of promos(); track promo.year) {
          <a
            [routerLink]="['/admin/promos', promo.year]"
            class="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
          >
            <!-- Background Decoration -->
            <div
              class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100"
            ></div>

            <div class="relative z-10">
              <div class="flex flex-col items-center text-center">
                <div
                  class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:rotate-6 shadow-sm"
                >
                  <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                </div>
                <h3 class="text-2xl font-black text-gray-900 mb-1 italic">PROMO</h3>
                <span class="text-4xl font-black text-indigo-600 tracking-tighter">{{ promo.year }}</span>
              </div>

              <div class="mt-8 flex justify-center">
                <span
                  class="inline-flex items-center text-xs font-bold text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300"
                >
                  Voir la liste
                  <svg class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        } @empty {
          <div
            class="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center"
          >
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p class="text-gray-400 font-bold">Aucune promotion enregistrée.</p>
            <p class="text-gray-300 text-sm">Commencez par ajouter une année ci-dessus.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class PromoListComponent implements OnInit {
  private alumniService = inject(AlumniService);
  authService = inject(AuthService);

  promos = signal<Promotion[]>([]);
  yearControl = new FormControl<number | null>(null, [Validators.required, Validators.min(1900), Validators.max(2100)]);

  ngOnInit() {
    this.loadPromos();
  }

  loadPromos() {
    this.alumniService.getPromos().subscribe((data) => {
      const sorted = [...data].sort((a, b) => b.year - a.year);
      this.promos.set(sorted);
    });
  }

  addYear() {
    if (this.yearControl.invalid) return;
    const year = this.yearControl.value!;

    this.alumniService.createPromo(year).subscribe({
      next: () => {
        this.loadPromos();
        this.yearControl.reset();
      },
      error: (err) => alert(err.error?.message || "Erreur lors de l'ajout"),
    });
  }
}
