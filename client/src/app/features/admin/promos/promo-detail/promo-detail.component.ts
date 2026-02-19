import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlumniService, Alumni } from '../../../../core/services/alumni.service';
import { CsvInstructionsModalComponent } from '../../../../shared/components/csv-instructions-modal/csv-instructions-modal.component';
import { AlumniEditModalComponent } from '../alumni-edit-modal/alumni-edit-modal.component';

export interface ImportSummary {
  success: number;
  failed: number;
  errorDetails: string[];
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, CsvInstructionsModalComponent, AlumniEditModalComponent],
  template: `
    <div class="p-6">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <a routerLink="/admin/promos" class="text-sm text-indigo-600 hover:text-indigo-500 flex items-center mb-2">
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux promotions
          </a>
          <h1 class="text-2xl font-bold text-gray-900">Promotion {{ year() }}</h1>
        </div>

        <button
          (click)="showImportModal.set(true)"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Importer via CSV
        </button>
      </header>

      @if (importSummary()) {
        <div class="mb-6 bg-white border rounded-lg p-4 shadow-sm">
          <h3 class="font-bold text-lg mb-2">Résultat de l'import :</h3>
          <div class="flex space-x-4 mb-4">
            <span class="text-green-600 font-medium">{{ importSummary()!.success }} Succès</span>
            <span class="text-red-600 font-medium">{{ importSummary()!.failed }} Échecs</span>
          </div>
          @if (importSummary()!.errorDetails.length > 0) {
            <div class="bg-red-50 p-3 rounded text-xs text-red-700 max-h-40 overflow-y-auto">
              <ul>
                @for (err of importSummary()!.errorDetails; track err) {
                  <li>• {{ err }}</li>
                }
              </ul>
            </div>
          }
          <button (click)="importSummary.set(null)" class="mt-4 text-xs text-gray-500 hover:underline">
            Fermer le rapport
          </button>
        </div>
      }

      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom / Prénom
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diplôme</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poste / Entreprise
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrichi</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (alumnus of alumni(); track alumnus.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="font-bold text-gray-900">{{ alumnus.last_name | uppercase }}</div>
                    <div class="text-gray-500">{{ alumnus.first_name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ alumnus.user?.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    @if (alumnus.linkedin_url) {
                      <a
                        [href]="alumnus.linkedin_url"
                        target="_blank"
                        class="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M19 0h-14c-2.761 0-4 1.239-4 4v14c0 2.761 1.239 4 4 4h14c2.761 0 4-1.239 4-4v-14c0-2.761-1.239-4-4-4zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          />
                        </svg>
                      </a>
                    } @else {
                      <span class="text-gray-300 italic text-xs">Non renseigné</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ alumnus.diploma }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    @if (alumnus.current_position || alumnus.company) {
                      <div class="text-gray-900 font-medium">{{ alumnus.current_position || '-' }}</div>
                      <div class="text-xs text-gray-500">{{ alumnus.company || '-' }}</div>
                    } @else {
                      <span class="text-gray-300 italic text-xs">En attente de scraping</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    @if (alumnus.data_enriched) {
                      <span class="text-green-500" title="Données enrichies">
                        <svg class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    } @else {
                      <span class="text-yellow-500 animate-pulse" title="Scraping en cours ou à venir">
                        <svg class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      [ngClass]="alumnus.user?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    >
                      {{ alumnus.user?.is_active ? 'Actif' : 'En attente' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      (click)="onEditAlumnus(alumnus)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Modifier"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      (click)="onDeleteAlumnus(alumnus.id)"
                      class="text-red-600 hover:text-red-900"
                      title="Supprimer"
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
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-6 py-12 text-center text-gray-500 italic">
                    Pas d'étudiants ajoutés pour cette promotion.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showImportModal()) {
      <app-csv-instructions-modal (modalClosed)="showImportModal.set(false)" (fileUploaded)="onFileUploaded($event)" />
    }

    @if (selectedAlumnus()) {
      <app-alumni-edit-modal
        [alumnus]="selectedAlumnus()!"
        (closed)="selectedAlumnus.set(null)"
        (saved)="onAlumnusSaved()"
      />
    }
  `,
})
export class PromoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private alumniService = inject(AlumniService);

  year = signal<number>(0);
  alumni = signal<Alumni[]>([]);
  showImportModal = signal(false);
  importSummary = signal<ImportSummary | null>(null);
  selectedAlumnus = signal<Alumni | null>(null);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.year.set(+params['year']);
      this.loadAlumni();
    });
  }

  loadAlumni() {
    this.alumniService.getAlumniByYear(this.year()).subscribe((data) => this.alumni.set(data));
  }

  onFileUploaded(file: File) {
    this.showImportModal.set(false);
    this.alumniService.importCsv(this.year(), file).subscribe({
      next: (summary) => {
        this.importSummary.set(summary as ImportSummary);
        this.loadAlumni();
      },
      error: () => alert("Erreur lors de l'import"),
    });
  }

  onEditAlumnus(alumnus: Alumni) {
    this.selectedAlumnus.set(alumnus);
  }

  onAlumnusSaved() {
    this.selectedAlumnus.set(null);
    this.loadAlumni();
  }

  onDeleteAlumnus(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible.')) {
      this.alumniService.deleteAlumni(id).subscribe({
        next: () => this.loadAlumni(),
        error: (err) => alert(err.error?.message || 'Erreur lors de la suppression'),
      });
    }
  }
}
