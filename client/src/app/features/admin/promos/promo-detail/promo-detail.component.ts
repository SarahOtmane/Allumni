import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlumniService, Alumni } from '../../../../core/services/alumni.service';
import { CsvInstructionsModalComponent } from '../../../../shared/components/csv-instructions-modal/csv-instructions-modal.component';

export interface ImportSummary {
  success: number;
  failed: number;
  errorDetails: string[];
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, CsvInstructionsModalComponent],
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
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diplôme</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (alumnus of alumni(); track alumnus.id) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ alumnus.last_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ alumnus.first_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ alumnus.user?.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ alumnus.diploma }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [ngClass]="alumnus.user?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ alumnus.user?.is_active ? 'Actif' : 'En attente' }}
                  </span>
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

    @if (showImportModal()) {
      <app-csv-instructions-modal (modalClosed)="showImportModal.set(false)" (fileUploaded)="onFileUploaded($event)" />
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
}
