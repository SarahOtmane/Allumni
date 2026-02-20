import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardStats } from '../services/admin.service';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { DashboardLoadingComponent } from './dashboard.loading';

@Component({
  standalone: true,
  imports: [CommonModule, StatsCardComponent, DashboardLoadingComponent],
  template: `
    <div class="p-6">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p class="text-gray-600">Vue d'ensemble de la plateforme Alumni</p>
      </header>

      @if (isLoading()) {
        <app-dashboard-loading />
      } @else if (stats()) {
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Promotions -->
          <app-stats-card
            title="Promotions"
            [value]="stats()!.promotionsCount"
            colorClass="bg-purple-100 text-purple-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </app-stats-card>

          <!-- Total Etudiants -->
          <app-stats-card
            title="Total Étudiants"
            [value]="stats()!.alumni.total"
            colorClass="bg-blue-100 text-blue-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </app-stats-card>

          <!-- Etudiants Actifs -->
          <app-stats-card
            title="Étudiants Actifs"
            [value]="stats()!.alumni.active"
            colorClass="bg-green-100 text-green-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </app-stats-card>

          <!-- Etudiants Inactifs -->
          <app-stats-card
            title="Étudiants Inactifs"
            [value]="stats()!.alumni.inactive"
            colorClass="bg-red-100 text-red-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </app-stats-card>

          <!-- Staff -->
          <app-stats-card
            title="Membres Staff"
            [value]="stats()!.staffCount"
            colorClass="bg-yellow-100 text-yellow-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </app-stats-card>

          <!-- Admins -->
          <app-stats-card title="Administrateurs" [value]="stats()!.adminCount" colorClass="bg-gray-100 text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12V5a2 2 0 012-2h2a2 2 0 012 2v7m4 9V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14m-4 0H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z"
              />
            </svg>
          </app-stats-card>

          <!-- Events -->
          <app-stats-card title="Événements" [value]="stats()!.eventsCount" colorClass="bg-pink-100 text-pink-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </app-stats-card>

          <!-- Jobs -->
          <app-stats-card
            title="Offres d'Emploi"
            [value]="stats()!.jobsCount"
            colorClass="bg-indigo-100 text-indigo-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </app-stats-card>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
