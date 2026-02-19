import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JobsService, JobOffer } from '../../../../core/services/jobs.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-alumni-job-list',
  imports: [CommonModule, ReactiveFormsModule],
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              [formControl]="titleFilter"
              type="text" 
              placeholder="Poste, mots-clés..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <input 
              [formControl]="locationFilter"
              type="text" 
              placeholder="Ville, pays..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
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
        @for (job of jobs(); track job.id) {
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-all group">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ job.title }}</h3>
                <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {{ job.company }}
                  </span>
                  <span class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {{ job.location || 'Distanciel' }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
                    {{ job.type }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-400">Publiée le {{ job.created_at | date:'dd/MM/yyyy' }}</p>
                <button class="mt-4 px-4 py-2 border border-indigo-600 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                  Voir les détails
                </button>
              </div>
            </div>
            <p class="mt-4 text-gray-600 line-clamp-2 text-sm">
              {{ job.description }}
            </p>
          </div>
        } @empty {
          <div class="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p class="text-gray-500 italic">Aucune offre ne correspond à vos critères.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AlumniJobListComponent implements OnInit {
  private jobsService = inject(JobsService);

  jobs = signal<JobOffer[]>([]);
  
  titleFilter = new FormControl('');
  locationFilter = new FormControl('');
  sortFilter = new FormControl('DESC');

  ngOnInit() {
    this.loadJobs();

    // Setup reactive filtering
    [this.titleFilter, this.locationFilter, this.sortFilter].forEach(control => {
      control.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => this.loadJobs());
    });
  }

  loadJobs() {
    const filters = {
      title: this.titleFilter.value || undefined,
      location: this.locationFilter.value || undefined,
      sort: (this.sortFilter.value as 'ASC' | 'DESC') || 'DESC'
    };

    // Note: I need to update the service to support these params if not already done
    // Let's check JobsService in client
    this.jobsService.getJobsWithFilters(filters).subscribe(data => this.jobs.set(data));
  }
}
