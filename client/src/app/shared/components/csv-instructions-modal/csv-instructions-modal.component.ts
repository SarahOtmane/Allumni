import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-csv-instructions-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal title="Importer des Alumni via CSV" (closed)="modalClosed.emit()">
      <div class="space-y-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-bold text-blue-800 mb-2">Structure du fichier requis :</h4>
          <p class="text-sm text-blue-700">
            Votre fichier CSV doit comporter les colonnes suivantes (respectez l'ordre et les noms exacts) :
          </p>
          <code class="block mt-2 text-xs bg-white p-2 rounded border border-blue-200">
            Nom,Prénom,Email,URL Linkedin,Année de diplôme,Quel diplôme
          </code>
        </div>

        <div class="border-t pt-4">
          <h4 class="font-bold text-gray-900 mb-2">Instructions :</h4>
          <ul class="list-disc ml-5 text-sm text-gray-600 space-y-1">
            <li>L'année de diplôme doit correspondre à l'année de la promotion sélectionnée.</li>
            <li>Les emails doivent être uniques.</li>
            <li>Le fichier doit être au format .csv uniquement.</li>
          </ul>
        </div>

        <div
          class="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 hover:border-indigo-500 transition-colors cursor-pointer relative"
          [ngClass]="{ 'border-indigo-500 bg-indigo-50': isDragging() }"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave()"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <input type="file" #fileInput class="hidden" accept=".csv" (change)="onFileSelected($event)" />

          <svg class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="text-gray-600 font-medium">Cliquez ou déposez votre fichier CSV ici</p>
          <p class="text-xs text-gray-400 mt-1">Format supporté : .csv</p>
        </div>
      </div>
    </app-modal>
  `,
})
export class CsvInstructionsModalComponent {
  @Output() fileUploaded = new EventEmitter<File>();
  @Output() modalClosed = new EventEmitter<void>();

  isDragging = signal(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    if (file.name.endsWith('.csv')) {
      this.fileUploaded.emit(file);
    } else {
      alert('Veuillez sélectionner un fichier au format CSV.');
    }
  }
}
