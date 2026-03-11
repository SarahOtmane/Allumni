import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { JobOffer } from '../../../../../core/services/jobs.service';

@Component({
  selector: 'app-job-detail-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal *ngIf="job" [title]="job.title" (closed)="closed.emit()">
      <div class="space-y-6">
        <!-- Header Info -->
        <div class="flex flex-wrap gap-4 items-center pb-6 border-b border-gray-100">
          <div class="flex items-center text-gray-600">
            <svg class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span class="font-semibold">{{ job.company }}</span>
          </div>
          <div class="flex items-center text-gray-600">
            <svg class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
            <span>{{ job.location || 'Distanciel' }}</span>
          </div>
          <div class="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase">
            {{ job.type }}
          </div>
        </div>

        <!-- Sections -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-2 space-y-6">
            <section>
              <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description du poste</h4>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ job.description }}</p>
            </section>

            <section *ngIf="job.missions">
              <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Missions</h4>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ job.missions }}</p>
            </section>

            <section *ngIf="job.profile_description">
              <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Profil recherché</h4>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ job.profile_description }}</p>
            </section>
          </div>

          <div class="space-y-6">
            <section class="bg-gray-50 p-4 rounded-xl">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Détails pratiques</h4>
              <div class="space-y-3">
                <div *ngIf="job.start_date">
                  <p class="text-xs text-gray-500">Date de début</p>
                  <p class="text-sm font-medium text-gray-900">{{ job.start_date | date: 'longDate' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Publiée le</p>
                  <p class="text-sm font-medium text-gray-900">{{ job.created_at | date: 'dd/MM/yyyy' }}</p>
                </div>
              </div>
            </section>

            <div class="pt-4">
              <a
                *ngIf="job.link"
                [href]="job.link"
                target="_blank"
                class="block w-full text-center py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Postuler sur le site
              </a>
              <p *ngIf="!job.link" class="text-xs text-center text-gray-400 italic">
                Contactez l'école pour plus d'informations sur cette offre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </app-modal>
  `,
})
export class JobDetailModalComponent {
  @Input() job: JobOffer | null = null;
  @Output() closed = new EventEmitter<void>();
}
