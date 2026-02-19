import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOffer } from '../../../../../core/services/jobs.service';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-all group">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ job.title }}</h3>
          <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
            <span class="flex items-center">
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {{ job.company }}
            </span>
            <span class="flex items-center">
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {{ job.location || 'Distanciel' }}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
              {{ job.type }}
            </span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-400">Publiée le {{ job.created_at | date: 'dd/MM/yyyy' }}</p>
          <button
            (click)="viewDetails.emit(job)"
            class="mt-4 px-4 py-2 border border-indigo-600 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
          >
            Voir les détails
          </button>
        </div>
      </div>
      <p class="mt-4 text-gray-600 line-clamp-2 text-sm">
        {{ job.description }}
      </p>
    </div>
  `,
})
export class JobCardComponent {
  @Input({ required: true }) job!: JobOffer;
  @Output() viewDetails = new EventEmitter<JobOffer>();
}
