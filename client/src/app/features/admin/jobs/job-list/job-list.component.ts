import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobsService, JobOffer } from '../../../../core/services/jobs.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="p-6">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Offres d'Emploi</h1>
          <p class="text-gray-600">Gérez les opportunités publiées pour les Alumni</p>
        </div>

        <a
          routerLink="/admin/jobs/new"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle offre
        </a>
      </header>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de début
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (job of jobs(); track job.id) {
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ job.title }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ job.company }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {{ job.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ job.start_date | date: 'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a [routerLink]="['/admin/jobs/edit', job.id]" class="text-indigo-600 hover:text-indigo-900 mr-4"
                    >Modifier</a
                  >
                  <button (click)="onDeleteClick(job.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
                  Aucune offre publiée pour le moment.
                </td>
              </tr>
            }
          </tbody>
        </table>
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
