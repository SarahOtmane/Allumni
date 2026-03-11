import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventsService, AlumniEvent } from '../../../../core/services/events.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <a routerLink="/admin/events" class="text-sm text-indigo-600 hover:text-indigo-500 flex items-center mb-2">
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux événements
          </a>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode() ? "Modifier l'événement" : 'Nouvel Événement' }}
          </h1>
        </div>
      </header>

      <form
        [formGroup]="eventForm"
        (ngSubmit)="onSubmit()"
        class="bg-white shadow-sm border border-gray-200 rounded-xl p-8 space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Titre de l'événement *</label>
            <input
              type="text"
              formControlName="title"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date et heure *</label>
            <input
              type="datetime-local"
              formControlName="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
            <input
              type="text"
              formControlName="location"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre max de participants</label>
            <input
              type="number"
              formControlName="max_participants"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              formControlName="description"
              rows="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-100 flex justify-end space-x-4">
          <a
            routerLink="/admin/events"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >Annuler</a
          >
          <button
            type="submit"
            [disabled]="eventForm.invalid || isSubmitting()"
            class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {{ isSubmitting() ? 'Traitement...' : isEditMode() ? "Modifier l'événement" : "Créer l'événement" }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class EventCreateComponent implements OnInit {
  private eventsService = inject(EventsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = signal(false);
  isEditMode = signal(false);
  eventId: string | null = null;

  eventForm = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    max_participants: new FormControl<number | null>(null),
  });

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditMode.set(true);
      this.loadEventData(this.eventId);
    }
  }

  loadEventData(id: string) {
    this.eventsService.getEvent(id).subscribe({
      next: (event) => {
        this.eventForm.patchValue({
          title: event.title,
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
          location: event.location,
          description: event.description,
          max_participants: event.max_participants || null,
        });
      },
      error: () => alert("Erreur lors du chargement de l'événement"),
    });
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.eventForm.getRawValue();

    const payload: Partial<AlumniEvent> = {
      title: val.title,
      date: val.date,
      location: val.location,
      description: val.description,
      max_participants: val.max_participants || undefined,
    };

    const request = this.isEditMode()
      ? this.eventsService.updateEvent(this.eventId!, payload)
      : this.eventsService.createEvent(payload);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/events']);
      },
      error: () => {
        this.isSubmitting.set(false);
        alert("Erreur lors de l'enregistrement de l'événement");
      },
    });
  }
}
