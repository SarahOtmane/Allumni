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
    <div class="p-10 bg-gray-50/30 min-h-screen">
      <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <a
            routerLink="/admin/promos"
            class="group inline-flex items-center text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4 hover:text-indigo-700 transition-colors"
          >
            <svg
              class="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux promotions
          </a>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight italic">
            Promotion <span class="text-indigo-600 not-italic">{{ year() }}</span>
          </h1>
          <p class="text-gray-500 font-medium mt-1">Liste des étudiants et diplômés de cette année.</p>
        </div>

        @if (authService.currentUser()?.role === 'ADMIN') {
          <button
            (click)="showImportModal.set(true)"
            class="inline-flex items-center px-6 py-3 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
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
      </header>

      @if (importSummary()) {
        <div
          class="mb-10 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <div class="flex justify-between items-start mb-6">
            <h3 class="font-black text-xl text-gray-900 italic">Rapport d'Importation</h3>
            <button
              (click)="importSummary.set(null)"
              class="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex space-x-8 mb-6">
            <div class="bg-emerald-50 px-6 py-4 rounded-2xl flex flex-col">
              <span class="text-2xl font-black text-emerald-600">{{ importSummary()!.success }}</span>
              <span class="text-xs font-bold text-emerald-500 uppercase tracking-widest">Succès</span>
            </div>
            <div class="bg-rose-50 px-6 py-4 rounded-2xl flex flex-col">
              <span class="text-2xl font-black text-rose-600">{{ importSummary()!.failed }}</span>
              <span class="text-xs font-bold text-rose-500 uppercase tracking-widest">Échecs</span>
            </div>
          </div>
          @if (importSummary()!.errorDetails.length > 0) {
            <div
              class="bg-gray-50 p-6 rounded-2xl text-sm text-gray-600 max-h-48 overflow-y-auto custom-scrollbar border border-gray-100"
            >
              <p class="font-black text-gray-400 uppercase text-[10px] tracking-widest mb-3">Détails des erreurs</p>
              <ul class="space-y-2">
                @for (err of importSummary()!.errorDetails; track err) {
                  <li class="flex items-start">
                    <span class="text-rose-500 mr-2">•</span>
                    {{ err }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      }

      <!-- Barre de Filtres -->
      <div class="mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div class="relative w-full md:w-96">
          <input
            type="text"
            (input)="onSearch($event)"
            placeholder="Rechercher un étudiant, poste..."
            class="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium placeholder:text-gray-400"
          />
          <svg
            class="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div class="flex items-center gap-4 w-full md:w-auto">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap"
            >Filtrer par diplôme :</span
          >
          <select
            (change)="onDiplomaChange($event)"
            class="px-6 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-black text-gray-700 min-w-[240px] appearance-none cursor-pointer italic"
          >
            <option value="">Tous les diplômes</option>
            @for (diploma of diplomas(); track diploma) {
              <option [value]="diploma">{{ diploma }}</option>
            }
          </select>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Étudiant
                </th>
                <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  LinkedIn
                </th>
                <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Diplôme
                </th>
                <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Poste Actuel
                </th>
                <th class="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Scraping
                </th>
                <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Statut
                </th>
                <th class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (alumnus of alumni(); track alumnus.id) {
                <tr class="hover:bg-indigo-50/20 transition-all group">
                  <td class="px-8 py-6">
                    <div class="flex items-center">
                      <div
                        class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 mr-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
                      >
                        {{ alumnus.first_name[0] }}{{ alumnus.last_name[0] }}
                      </div>
                      <div>
                        <div class="text-sm font-black text-gray-900 italic uppercase">
                          {{ alumnus.last_name }}
                          <span class="font-bold not-italic capitalize text-gray-600">{{ alumnus.first_name }}</span>
                        </div>
                        <div class="text-xs font-medium text-gray-400 mt-0.5">{{ alumnus.user?.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    @if (alumnus.linkedin_url) {
                      <a
                        [href]="alumnus.linkedin_url"
                        target="_blank"
                        class="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M19 0h-14c-2.761 0-4 1.239-4 4v14c0 2.761 1.239 4 4 4h14c2.761 0 4-1.239 4-4v-14c0-2.761-1.239-4-4-4zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          />
                        </svg>
                      </a>
                    } @else {
                      <span class="text-[10px] font-bold text-gray-300 uppercase italic">Non lié</span>
                    }
                  </td>
                  <td class="px-8 py-6">
                    <span
                      class="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 italic"
                    >
                      {{ alumnus.diploma || 'N/A' }}
                    </span>
                  </td>
                  <td class="px-8 py-6">
                    @if (alumnus.scraping_status === 'COMPLETED' || alumnus.current_position || alumnus.company) {
                      <div class="text-sm font-bold text-gray-900 tracking-tight">
                        {{ alumnus.current_position || '-' }}
                      </div>
                      <div class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
                        {{ alumnus.company || '-' }}
                      </div>
                    } @else if (alumnus.scraping_status === 'FAILED') {
                      <div class="text-[10px] font-bold text-rose-500 uppercase tracking-widest italic">
                        Échec scraping
                      </div>
                    } @else {
                      <div class="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic animate-pulse">
                        En attente...
                      </div>
                    }
                  </td>
                  <td class="px-8 py-6 text-center">
                    @if (alumnus.scraping_status === 'COMPLETED') {
                      <div class="flex flex-col items-center">
                        <span class="text-emerald-500" title="Données enrichies">
                          <svg class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <button
                          (click)="onRetryScrape(alumnus.id)"
                          class="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest mt-1 transition-colors"
                        >
                          Refaire
                        </button>
                      </div>
                    } @else if (alumnus.scraping_status === 'PROCESSING') {
                      <span class="text-indigo-500 animate-spin inline-block" title="Scraping en cours">
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
                        <span class="text-rose-500" [title]="alumnus.scraping_error">
                          <svg class="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </span>
                        <button
                          (click)="onRetryScrape(alumnus.id)"
                          class="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest mt-1 transition-colors"
                        >
                          Réessayer
                        </button>
                      </div>
                    } @else {
                      <span class="text-amber-500 animate-pulse inline-block" title="En attente">
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
                  <td class="px-8 py-6">
                    @if (alumnus.user?.is_active) {
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest border border-emerald-100"
                        >Actif</span
                      >
                    } @else {
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-50 text-gray-400 uppercase tracking-widest border border-gray-100"
                        >Invitation</span
                      >
                    }
                  </td>
                  <td class="px-8 py-6 text-right">
                    <div class="flex justify-end space-x-2">
                      <button
                        (click)="onViewDetail(alumnus)"
                        class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Détails"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01"
                          />
                        </svg>
                      </button>
                      <button
                        (click)="onContactAlumni(alumnus.user_id)"
                        class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
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
                          class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
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
                          class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-8 py-20 text-center">
                    <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <p class="text-gray-400 font-bold italic">Aucun étudiant dans cette promotion.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals (non modifiées car gérées ailleurs ou par leur propre composant) -->
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
      <app-alumni-detail-modal [alumnus]="selectedAlumnusForDetail()!" (closed)="selectedAlumnusForDetail.set(null)" />
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
  diplomas = signal<string[]>([]);
  searchTerm = signal<string>('');
  selectedDiploma = signal<string>('');
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
      this.loadDiplomas();
    });

    // Auto-refresh every 5 seconds if any alumnus is being processed or pending
    this.refreshSubscription = interval(5000).subscribe(() => {
      const needsRefresh = this.alumni().some(
        (a) => a.scraping_status === 'PROCESSING' || a.scraping_status === 'PENDING',
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
    this.alumniService
      .getAlumniByYear(this.year(), this.searchTerm(), this.selectedDiploma())
      .subscribe((data) => this.alumni.set(data));
  }

  loadDiplomas() {
    this.alumniService.getDistinctDiplomas(this.year()).subscribe((data) => this.diplomas.set(data));
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.loadAlumni();
  }

  onDiplomaChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedDiploma.set(select.value);
    this.loadAlumni();
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
