import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventsService, AlumniEvent } from '../../../../core/services/events.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="p-6">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Événements</h1>
          <p class="text-gray-600">Gérez le calendrier des événements pour les Alumni</p>
        </div>

        <a
          routerLink="/admin/events/new"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel événement
        </a>
      </header>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (event of events(); track event.id) {
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ event.title }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ event.date | date: 'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ event.location }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a [routerLink]="['/admin/events/edit', event.id]" class="text-indigo-600 hover:text-indigo-900 mr-4">
                    Modifier
                  </a>
                  <button (click)="onDeleteClick(event.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-500 italic">
                  Aucun événement programmé pour le moment.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (eventIdToDelete()) {
      <app-confirm-modal
        title="Supprimer l'événement"
        message="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
        confirmText="Supprimer"
        (confirmed)="handleDelete()"
        (cancelled)="eventIdToDelete.set(null)"
      />
    }
  `,
})
export class EventListComponent implements OnInit {
  private eventsService = inject(EventsService);

  events = signal<AlumniEvent[]>([]);
  eventIdToDelete = signal<string | null>(null);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventsService.getEvents().subscribe((data) => this.events.set(data));
  }

  onDeleteClick(id: string) {
    this.eventIdToDelete.set(id);
  }

  handleDelete() {
    if (!this.eventIdToDelete()) return;

    this.eventsService.deleteEvent(this.eventIdToDelete()!).subscribe(() => {
      this.eventIdToDelete.set(null);
      this.loadEvents();
    });
  }
}
