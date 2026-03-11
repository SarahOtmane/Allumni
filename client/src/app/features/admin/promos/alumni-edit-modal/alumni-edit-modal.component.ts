import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Alumni, AlumniService } from '../../../../core/services/alumni.service';

@Component({
  selector: 'app-alumni-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal title="Modifier l'étudiant" (closed)="closed.emit()">
      <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input
              type="text"
              formControlName="first_name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              formControlName="last_name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Adresse Email *</label>
          <input
            type="email"
            formControlName="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL LinkedIn</label>
          <input
            type="url"
            formControlName="linkedin_url"
            placeholder="https://linkedin.com/in/..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Promotion (Année) *</label>
            <input
              type="number"
              formControlName="promo_year"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Diplôme *</label>
            <input
              type="text"
              formControlName="diploma"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div class="pt-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            (click)="closed.emit()"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            [disabled]="editForm.invalid || isSubmitting()"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ isSubmitting() ? 'Enregistrement...' : 'Sauvegarder' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AlumniEditModalComponent implements OnInit {
  @Input({ required: true }) alumnus!: Alumni;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private alumniService = inject(AlumniService);
  isSubmitting = signal(false);

  editForm = new FormGroup({
    first_name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    last_name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    linkedin_url: new FormControl(''),
    promo_year: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1900)],
    }),
    diploma: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit() {
    this.editForm.patchValue({
      first_name: this.alumnus.first_name,
      last_name: this.alumnus.last_name,
      email: this.alumnus.user?.email || '',
      linkedin_url: this.alumnus.linkedin_url || '',
      promo_year: this.alumnus.promo_year,
      diploma: this.alumnus.diploma,
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;

    this.isSubmitting.set(true);
    const rawData = this.editForm.getRawValue();

    const data = {
      ...rawData,
      linkedin_url: rawData.linkedin_url || undefined,
    };

    this.alumniService.updateAlumni(this.alumnus.id, data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err.error?.message || 'Erreur lors de la modification');
      },
    });
  }
}
