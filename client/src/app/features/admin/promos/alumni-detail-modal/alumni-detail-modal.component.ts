import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Alumni } from '../../../../core/services/alumni.service';

@Component({
  selector: 'app-alumni-detail-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [title]="'Détails : ' + alumnus.first_name + ' ' + (alumnus.last_name | uppercase)" (closed)="closed.emit()">
      <div class="space-y-6">
        <!-- Informations de base -->
        <section>
          <h3 class="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Informations Générales</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 block">Email</span>
              <span class="font-medium">{{ alumnus.user?.email || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-500 block">Promotion</span>
              <span class="font-medium">{{ alumnus.promo_year }}</span>
            </div>
            <div>
              <span class="text-gray-500 block">Diplôme</span>
              <span class="font-medium">{{ alumnus.diploma }}</span>
            </div>
            <div>
              <span class="text-gray-500 block">LinkedIn</span>
              @if (alumnus.linkedin_url) {
                <a [href]="alumnus.linkedin_url" target="_blank" class="text-indigo-600 hover:underline flex items-center">
                  Profil Public
                  <svg class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              } @else {
                <span class="text-gray-400">Non renseigné</span>
              }
            </div>
          </div>
        </section>

        <!-- Parcours Professionnel -->
        <section>
          <div class="flex justify-between items-center border-b pb-2 mb-3">
            <h3 class="text-lg font-semibold text-gray-900">Parcours Professionnel</h3>
            <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase">
              Depuis diplôme
            </span>
          </div>

          @if (alumnus.experiences && alumnus.experiences.length > 0) {
            <div class="flow-root">
              <ul role="list" class="-mb-8">
                @for (exp of alumnus.experiences; track exp.id; let last = $last) {
                  <li>
                    <div class="relative pb-8">
                      @if (!last) {
                        <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      }
                      <div class="relative flex space-x-3">
                        <div>
                          <span class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                                [ngClass]="exp.is_current ? 'bg-indigo-500' : 'bg-gray-400'">
                            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div>
                            <div class="text-sm">
                              <p class="font-bold text-gray-900">{{ exp.title }}</p>
                            </div>
                            <p class="mt-0.5 text-sm text-gray-500">{{ exp.company }}</p>
                          </div>
                          <div class="mt-2 text-xs text-gray-400">
                            {{ exp.start_date | date:'MMM yyyy' }} - {{ exp.is_current ? 'Aujourd'hui' : (exp.end_date | date:'MMM yyyy') }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                }
              </ul>
            </div>
          } @else {
            <div class="bg-gray-50 rounded-lg p-6 text-center italic text-gray-500 text-sm">
              @if (alumnus.data_enriched) {
                Aucune expérience trouvée après l'obtention du diplôme.
              } @else {
                En attente du scraping LinkedIn pour récupérer l'historique...
              }
            </div>
          }
        </section>
      </div>
    </app-modal>
  `,
})
export class AlumniDetailModalComponent {
  @Input({ required: true }) alumnus!: Alumni;
  @Output() closed = new EventEmitter<void>();
}
