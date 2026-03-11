import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlumniService, Alumni } from '../../../../core/services/alumni.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CsvInstructionsModalComponent } from '../../../../shared/components/csv-instructions-modal/csv-instructions-modal.component';
import { AlumniEditModalComponent } from '../alumni-edit-modal/alumni-edit-modal.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ChatService } from '../../../../core/services/chat.service';
import { Router } from '@angular/router';

export interface ImportSummary {
  success: number;
  failed: number;
  errorDetails: string[];
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, CsvInstructionsModalComponent, AlumniEditModalComponent, ConfirmModalComponent],
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

        <div class="flex space-x-3">
          @if (authService.currentUser()?.role === 'ADMIN' || authService.currentUser()?.role === 'STAFF') {
            <button
              (click)="onExportForApify()"
              class="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 shadow-sm"
              title="Télécharger les URLs LinkedIn pour Apify"
            >
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export Apify
            </button>

            <button
              (click)="triggerJsonInput()"
              class="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 shadow-sm"
              title="Importer le résultat JSON d'Apify"
            >
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a2 2 0 002 2h10a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Import Apify
            </button>
            <input type="file" #jsonInput class="hidden" accept=".json" (change)="onJsonFileSelected($event)" />

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
              Importer CSV
            </button>
          }
        </div>
      </header>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom / Prénom
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poste / Entreprise
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Enrichi
                </th>
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    @if (alumnus.linkedin_url) {
                      <a
                        [href]="alumnus.linkedin_url"
                        target="_blank"
                        class="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        Voir Profil
                      </a>
                    } @else {
                      <span class="text-gray-300 italic text-xs">Non renseigné</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    @if (alumnus.current_position || alumnus.company) {
                      <div class="text-gray-900 font-medium">{{ alumnus.current_position || '-' }}</div>
                      <div class="text-xs text-gray-500">{{ alumnus.company || '-' }}</div>
                    } @else {
                      <span class="text-gray-300 italic text-xs">En attente de données</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    @if (alumnus.data_enriched) {
                      <span class="text-green-500" title="Données enrichies">
                        <svg class="h-5 w-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </span>
                    } @else {
                      <span class="text-gray-300" title="Non enrichi">
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
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      (click)="onShowDetails(alumnus)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Détails du parcours"
                    >
                      Détails
                    </button>
                    @if (authService.currentUser()?.role === 'ADMIN' || authService.currentUser()?.role === 'STAFF') {
                      <button
                        (click)="onEditAlumnus(alumnus)"
                        class="text-gray-600 hover:text-gray-900 mr-3"
                        title="Modifier"
                      >
                        Modifier
                      </button>
                      <button (click)="onDeleteClick(alumnus.id)" class="text-red-600 hover:text-red-900" title="Supprimer">
                        Supprimer
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
                    Pas d'étudiants ajoutés pour cette promotion.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    @if (detailsAlumnus()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            (click)="detailsAlumnus.set(null)"
          ></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div
            class="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          >
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Parcours de {{ detailsAlumnus()?.first_name }} {{ detailsAlumnus()?.last_name }}
                  </h3>
                  <div class="mt-4 border-t border-gray-100 pt-4">
                    <div class="space-y-6">
                      @for (exp of (detailsAlumnus()?.experiences || []); track $index) {
                        <div class="relative pl-8 border-l-2 border-indigo-100 pb-2">
                          <div class="absolute -left-2 top-0 h-4 w-4 rounded-full bg-indigo-500"></div>
                          <h4 class="font-bold text-gray-900">{{ exp.title }}</h4>
                          <p class="text-indigo-600 text-sm font-medium">{{ exp.company }}</p>
                          <p class="text-gray-500 text-xs mt-1">{{ exp.duration }}</p>
                          @if (exp.description) {
                            <p class="text-gray-600 text-sm mt-2 italic whitespace-pre-line">{{ exp.description }}</p>
                          }
                        </div>
                      } @empty {
                        <p class="text-center text-gray-500 italic py-8">Aucune expérience répertoriée.</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                (click)="detailsAlumnus.set(null)"
                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    }

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

    @if (alumnusIdToDelete()) {
      <app-confirm-modal
        title="Supprimer l'étudiant"
        message="Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible et supprimera également son compte utilisateur."
        confirmText="Supprimer"
        (confirmed)="handleDelete()"
        (cancelled)="alumnusIdToDelete.set(null)"
      />
    }
  `,
})
export class PromoDetailComponent implements OnInit {
  @ViewChild('jsonInput') jsonInput!: ElementRef<HTMLInputElement>;

  private route = inject(ActivatedRoute);
  private alumniService = inject(AlumniService);
  private chatService = inject(ChatService);
  private router = inject(Router);
  authService = inject(AuthService);

  year = signal<number>(0);
  alumni = signal<Alumni[]>([]);
  showImportModal = signal(false);
  importSummary = signal<ImportSummary | null>(null);
  selectedAlumnus = signal<Alumni | null>(null);
  detailsAlumnus = signal<Alumni | null>(null);
  alumnusIdToDelete = signal<string | null>(null);

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

  onExportForApify() {
    console.log('Export button clicked for year:', this.year());
    this.alumniService.getLinkedinUrls(this.year()).subscribe({
      next: (data) => {
        console.log('Received URLs from server:', data);
        if (!data.profileUrls || data.profileUrls.length === 0) {
          alert("Aucune URL LinkedIn trouvée pour cette promotion.");
          return;
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkedin-urls-promo-${this.year()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Download triggered');
      },
      error: (err) => {
        console.error('Error fetching URLs:', err);
        alert("Erreur lors de l'exportation des URLs.");
      }
    });
  }

  triggerJsonInput() {
    this.jsonInput.nativeElement.click();
  }

  onJsonFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = JSON.parse(e.target.result);
        this.alumniService.importScrapedData(data).subscribe({
          next: (res) => {
            alert(`${res.updated} profils mis à jour avec succès !`);
            this.loadAlumni();
            event.target.value = ''; // Reset input
          },
          error: (err) => alert("Erreur lors de l'importation du JSON Apify"),
        });
      } catch (error) {
        alert("Le fichier JSON n'est pas valide.");
      }
    };
    reader.readAsText(file);
  }

  onShowDetails(alumnus: Alumni) {
    this.detailsAlumnus.set(alumnus);
  }

  onEditAlumnus(alumnus: Alumni) {
    this.selectedAlumnus.set(alumnus);
  }

  onAlumnusSaved() {
    this.selectedAlumnus.set(null);
    this.loadAlumni();
  }

  onDeleteClick(id: string) {
    this.alumnusIdToDelete.set(id);
  }

  handleDelete() {
    if (!this.alumnusIdToDelete()) return;

    this.alumniService.deleteAlumni(this.alumnusIdToDelete()!).subscribe({
      next: () => {
        this.alumnusIdToDelete.set(null);
        this.loadAlumni();
      },
      error: (err) => {
        this.alumnusIdToDelete.set(null);
        alert(err.error?.message || 'Erreur lors de la suppression');
      },
    });
  }
}
