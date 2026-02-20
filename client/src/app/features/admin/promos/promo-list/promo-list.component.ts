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
    <div class="p-6">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Promotions</h1>
          <p class="text-gray-600">Gérez les années de diplôme et les étudiants</p>
        </div>

        @if (authService.currentUser()?.role === 'ADMIN') {
          <div class="flex items-center space-x-2">
            <input
              type="number"
              [formControl]="yearControl"
              placeholder="Ex: 2025"
              class="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              (click)="addYear()"
              [disabled]="yearControl.invalid"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              Ajouter une année
            </button>
          </div>
        }
      </header>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        @for (promo of promos(); track promo.year) {
          <a
            [routerLink]="['/admin/promos', promo.year]"
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div class="flex justify-between items-center">
              <span class="text-3xl font-bold text-gray-900">Promo {{ promo.year }}</span>
              <div
                class="p-2 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        } @empty {
          <div class="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p class="text-gray-500">Aucune promotion créée pour le moment.</p>
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
