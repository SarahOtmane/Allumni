import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlumniService, Alumni } from '../../../../core/services/alumni.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CsvInstructionsModalComponent } from '../../../../shared/components/csv-instructions-modal/csv-instructions-modal.component';
import { AlumniEditModalComponent } from '../alumni-edit-modal/alumni-edit-modal.component';
import { AlumniDetailModalComponent } from '../alumni-detail-modal/alumni-detail-modal.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ChatService } from '../../../../core/services/chat.service';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

export interface ImportSummary {
  success: number;
  failed: number;
  errorDetails: string[];
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CsvInstructionsModalComponent,
    AlumniEditModalComponent,
    AlumniDetailModalComponent,
    ConfirmModalComponent,
  ],
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

        @if (authService.currentUser()?.role === 'ADMIN') {
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
        }
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scraping</th>
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
                    @if (alumnus.scraping_status === 'COMPLETED' || alumnus.current_position || alumnus.company) {
                      <div class="text-gray-900 font-medium">{{ alumnus.current_position || '-' }}</div>
                      <div class="text-xs text-gray-500">{{ alumnus.company || '-' }}</div>
                    } @else if (alumnus.scraping_status === 'FAILED') {
                      <span class="text-red-400 italic text-xs" [title]="alumnus.scraping_error">Échec du scraping</span>
                    } @else {
                      <span class="text-gray-300 italic text-xs">En attente...</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    @if (alumnus.scraping_status === 'COMPLETED') {
                      <div class="flex flex-col items-center">
                        <span class="text-green-500" title="Données enrichies">
                          <svg class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <button (click)="onRetryScrape(alumnus.id)" class="text-[10px] text-gray-400 hover:text-indigo-600 mt-1">Refaire</button>
                      </div>
                    } @else if (alumnus.scraping_status === 'PROCESSING') {
                      <span class="text-indigo-500 animate-spin" title="Scraping en cours">
                        <svg class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </span>
                    } @else if (alumnus.scraping_status === 'FAILED') {
                      <div class="flex flex-col items-center">
                        <span class="text-red-500" [title]="alumnus.scraping_error">
                          <svg class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </span>
                        <button (click)="onRetryScrape(alumnus.id)" class="text-[10px] text-indigo-600 hover:underline mt-1">Réessayer</button>
                      </div>
                    } @else {
                      <span class="text-yellow-500 animate-pulse" title="En attente">
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
                      (click)="onViewDetail(alumnus)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Détails"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
                      </svg>
                    </button>
                    <button
                      (click)="onContactAlumni(alumnus.user_id)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Contacter"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                    @if (authService.currentUser()?.role === 'ADMIN') {
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
                        (click)="onDeleteClick(alumnus.id)"
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
                    } @else {
                      <span class="text-gray-300 italic text-xs">Lecture seule</span>
                    }
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

    @if (selectedAlumnusForDetail()) {
      <app-alumni-detail-modal
        [alumnus]="selectedAlumnusForDetail()!"
        (closed)="selectedAlumnusForDetail.set(null)"
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
export class PromoDetailComponent implements OnInit, OnDestroy {
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
  selectedAlumnusForDetail = signal<Alumni | null>(null);
  alumnusIdToDelete = signal<string | null>(null);

  private refreshSubscription?: Subscription;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.year.set(+params['year']);
      this.loadAlumni();
    });

    // Auto-refresh every 5 seconds if any alumnus is being processed or pending
    this.refreshSubscription = interval(5000).subscribe(() => {
      const needsRefresh = this.alumni().some(
        (a) => a.scraping_status === 'PROCESSING' || a.scraping_status === 'PENDING'
      );
      if (needsRefresh) {
        this.loadAlumni();
      }
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  loadAlumni() {
    this.alumniService.getAlumniByYear(this.year()).subscribe((data) => this.alumni.set(data));
  }

  onRetryScrape(id: string) {
    this.alumniService.triggerScraping(id).subscribe({
      next: () => this.loadAlumni(),
      error: (err) => alert('Erreur lors de la relance : ' + (err.error?.message || 'Inconnue')),
    });
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

  onViewDetail(alumnus: Alumni) {
    this.selectedAlumnusForDetail.set(alumnus);
  }

  onContactAlumni(userId: string) {
    this.chatService.createConversation(userId).subscribe((conv) => {
      this.router.navigate(['/admin/messages'], { queryParams: { id: conv.id } });
    });
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
