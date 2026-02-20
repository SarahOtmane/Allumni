import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JobsService, JobOffer } from '../../../../core/services/jobs.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { JobCardComponent } from '../components/job-card/job-card.component';
import { JobDetailModalComponent } from '../components/job-detail-modal/job-detail-modal.component';
import { JobListLoadingComponent } from './job-list.loading';

@Component({
  standalone: true,
  selector: 'app-alumni-job-list',
  imports: [CommonModule, ReactiveFormsModule, JobCardComponent, JobDetailModalComponent, JobListLoadingComponent],
  template: `
    <div class="p-6">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Offres d'Emploi</h1>
        <p class="text-gray-600">Trouvez votre prochaine opportunité dans le réseau</p>
      </header>

      <!-- Search & Filters -->
      <section class="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              [formControl]="titleFilter"
              type="text"
              placeholder="Poste, mots-clés..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            </span>
            <input
              [formControl]="locationFilter"
              type="text"
              placeholder="Ville, pays..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <select
              [formControl]="sortFilter"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="DESC">Plus récentes</option>
              <option value="ASC">Plus anciennes</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Job List -->
      <div class="space-y-4">
        @if (isLoading()) {
          <app-job-list-loading />
        } @else {
          @for (job of jobs(); track job.id) {
            <app-job-card [job]="job" (viewDetails)="onViewDetails($event)" />
          } @empty {
            <div class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p class="text-gray-500 italic">Aucune offre ne correspond à vos critères.</p>
            </div>
          }
        }
      </div>
    </div>

    <!-- Detail Modal -->
    @if (selectedJob()) {
      <app-job-detail-modal [job]="selectedJob()" (closed)="onCloseDetails()" />
    }
  `,
})
export class AlumniJobListComponent implements OnInit {
  private jobsService = inject(JobsService);

  jobs = signal<JobOffer[]>([]);
  isLoading = signal(false);
  selectedJob = signal<JobOffer | null>(null);

  titleFilter = new FormControl('');
  locationFilter = new FormControl('');
  sortFilter = new FormControl('DESC');

  ngOnInit() {
    this.loadJobs();

    // Setup reactive filtering
    [this.titleFilter, this.locationFilter, this.sortFilter].forEach((control) => {
      control.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.loadJobs());
    });
  }

  loadJobs() {
    this.isLoading.set(true);
    const filters = {
      title: this.titleFilter.value || undefined,
      location: this.locationFilter.value || undefined,
      sort: (this.sortFilter.value as 'ASC' | 'DESC') || 'DESC',
    };

    this.jobsService.getJobsWithFilters(filters).subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading jobs', err);
        this.isLoading.set(false);
      },
    });
  }

  onViewDetails(job: JobOffer) {
    this.selectedJob.set(job);
  }

  onCloseDetails() {
    this.selectedJob.set(null);
  }
}
