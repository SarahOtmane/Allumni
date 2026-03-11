import { Component, inject, signal, OnInit } from '@angular/core';
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
                  Poste Actuel
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
                    @if (alumnus.current_position) {
                      <div class="text-sm font-bold text-gray-900 tracking-tight">{{ alumnus.current_position }}</div>
                      <div class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
                        {{ alumnus.company }}
                      </div>
                    } @else {
                      <div
                        class="flex items-center text-[10px] font-bold text-amber-500 uppercase tracking-widest italic animate-pulse"
                      >
                        <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Enrichissement...
                      </div>
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
                  <td colspan="5" class="px-8 py-20 text-center">
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

  onEditAlumnus(alumnus: Alumni) {
    this.selectedAlumnus.set(alumnus);
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
