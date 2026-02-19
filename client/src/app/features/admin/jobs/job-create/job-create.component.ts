import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobsService, JobOffer } from '../../../../core/services/jobs.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <a routerLink="/admin/jobs" class="text-sm text-indigo-600 hover:text-indigo-500 flex items-center mb-2">
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux offres
          </a>
          <h1 class="text-2xl font-bold text-gray-900">Nouvelle Offre d'Emploi</h1>
        </div>
      </header>

      <form
        [formGroup]="jobForm"
        (ngSubmit)="onSubmit()"
        class="bg-white shadow-sm border border-gray-200 rounded-xl p-8 space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom du poste *</label>
            <input
              type="text"
              formControlName="title"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
            <select
              formControlName="type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="PRESTATAIRE">Prestataire</option>
            </select>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
            <input
              type="text"
              formControlName="company"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Localisation (Ville, Distanciel...)</label>
            <input
              type="text"
              formControlName="location"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
            <input
              type="date"
              formControlName="start_date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Lien de l'offre (optionnel)</label>
            <input
              type="url"
              formControlName="link"
              placeholder="https://..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description du poste *</label>
            <textarea
              formControlName="description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description de l'entreprise</label>
            <textarea
              formControlName="company_description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description du profil recherché</label>
            <textarea
              formControlName="profile_description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Missions</label>
            <textarea
              formControlName="missions"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-100 flex justify-end space-x-4">
          <a
            routerLink="/admin/jobs"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >Annuler</a
          >
          <button
            type="submit"
            [disabled]="jobForm.invalid || isSubmitting()"
            class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {{ isSubmitting() ? 'Publication...' : "Publier l'offre" }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class JobCreateComponent {
  private jobsService = inject(JobsService);
  private router = inject(Router);

  isSubmitting = signal(false);

  jobForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl('CDI', { nonNullable: true, validators: [Validators.required] }),
    company: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl(''),
    start_date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    company_description: new FormControl(''),
    profile_description: new FormControl(''),
    missions: new FormControl(''),
    link: new FormControl(''),
  });

  onSubmit() {
    if (this.jobForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.jobForm.getRawValue();

    const payload: Partial<JobOffer> = {
      title: val.title,
      type: val.type as 'CDI' | 'CDD' | 'PRESTATAIRE',
      company: val.company,
      location: val.location || undefined,
      start_date: val.start_date,
      description: val.description,
      link: val.link || undefined,
      company_description: val.company_description || undefined,
      profile_description: val.profile_description || undefined,
      missions: val.missions || undefined,
    };

    this.jobsService.createJob(payload).subscribe({
      next: () => {
        this.router.navigate(['/admin/jobs']);
      },
      error: () => {
        this.isSubmitting.set(false);
        alert("Erreur lors de la création de l'offre");
      },
    });
  }
}
