import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobsService, JobOffer } from '../../../../core/services/jobs.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="p-10 bg-gray-50/30 min-h-screen">
      <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div class="flex items-center text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">
            <span class="opacity-50">Gestion</span>
            <span class="mx-2 text-gray-300">/</span>
            <span>Carrières</span>
          </div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Offres d'Emploi</h1>
          <p class="text-gray-500 font-medium mt-1">Gérez les opportunités professionnelles pour la communauté.</p>
        </div>

        <a
          routerLink="/admin/jobs/new"
          class="inline-flex items-center px-6 py-3.5 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Publier une offre
        </a>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        @for (job of jobs(); track job.id) {
          <div
            class="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="flex justify-between items-start mb-6">
                <div
                  class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:rotate-3"
                >
                  <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span
                  class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100"
                >
                  {{ job.type }}
                </span>
              </div>

              <h3
                class="text-xl font-black text-gray-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors"
              >
                {{ job.title }}
              </h3>
              <p class="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-4">{{ job.company }}</p>

              <div class="flex items-center text-xs font-bold text-gray-500 space-x-4">
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {{ job.location || 'Télétravail' }}
                </div>
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {{ job.start_date | date: 'MMM yyyy' }}
                </div>
              </div>
            </div>

            <div class="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center">
              <a
                [routerLink]="['/admin/jobs/edit', job.id]"
                class="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] hover:text-indigo-800 transition-colors"
              >
                Éditer l'offre
              </a>
              <button
                (click)="onDeleteClick(job.id)"
                class="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14"
                  />
                </svg>
              </button>
            </div>
          </div>
        } @empty {
          <div
            class="col-span-full py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center"
          >
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p class="text-gray-400 font-bold">Aucune offre d'emploi publiée.</p>
          </div>
        }
      </div>
    </div>

    @if (jobIdToDelete()) {
      <app-confirm-modal
        title="Supprimer l'offre"
        message="Êtes-vous sûr de vouloir supprimer cette offre d'emploi ?"
        confirmText="Supprimer"
        (confirmed)="handleDelete()"
        (cancelled)="jobIdToDelete.set(null)"
      />
    }
  `,
})
export class JobListComponent implements OnInit {
  private jobsService = inject(JobsService);

  jobs = signal<JobOffer[]>([]);
  jobIdToDelete = signal<string | null>(null);

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobsService.getJobs().subscribe((data) => this.jobs.set(data));
  }

  onDeleteClick(id: string) {
    this.jobIdToDelete.set(id);
  }

  handleDelete() {
    if (!this.jobIdToDelete()) return;

    this.jobsService.deleteJob(this.jobIdToDelete()!).subscribe(() => {
      this.jobIdToDelete.set(null);
      this.loadJobs();
    });
  }
}
