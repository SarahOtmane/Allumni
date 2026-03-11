import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventsService, AlumniEvent } from '../../../../core/services/events.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="p-10 bg-gray-50/30 min-h-screen">
      <header class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div class="flex items-center text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">
            <span class="opacity-50">Gestion</span>
            <span class="mx-2 text-gray-300">/</span>
            <span>Événements</span>
          </div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Calendrier Alumni</h1>
          <p class="text-gray-500 font-medium mt-1">Organisez et gérez les événements de la communauté.</p>
        </div>

        <a
          routerLink="/admin/events/new"
          class="inline-flex items-center px-6 py-3.5 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Créer un événement
        </a>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        @for (event of events(); track event.id) {
          <div
            class="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col"
          >
            <!-- Header/Date Card Style -->
            <div class="relative h-32 bg-indigo-600 p-6 flex flex-col justify-end overflow-hidden">
              <div
                class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"
              ></div>
              <div class="relative z-10 flex justify-between items-end">
                <div>
                  <span class="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]"
                    >Date de l'événement</span
                  >
                  <div class="text-white font-black text-lg">{{ event.date | date: 'dd MMMM yyyy' }}</div>
                </div>
                <div
                  class="bg-white/20 backdrop-blur-md rounded-xl p-2 text-white border border-white/10 text-center min-w-[50px]"
                >
                  <div class="text-xs font-black">{{ event.date | date: 'HH:mm' }}</div>
                </div>
              </div>
            </div>

            <div class="p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3
                  class="text-xl font-black text-gray-900 tracking-tight mb-4 group-hover:text-indigo-600 transition-colors"
                >
                  {{ event.title }}
                </h3>

                <div class="flex items-center text-sm font-bold text-gray-500 mb-2">
                  <div
                    class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mr-3 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  {{ event.location }}
                </div>
              </div>

              <div class="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                <a
                  [routerLink]="['/admin/events/edit', event.id]"
                  class="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] hover:text-indigo-800 transition-colors"
                >
                  Gérer les détails
                </a>
                <button
                  (click)="onDeleteClick(event.id)"
                  class="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
              </div>
            </div>
          </div>
        } @empty {
          <div
            class="col-span-full py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center"
          >
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p class="text-gray-400 font-bold">Aucun événement programmé.</p>
          </div>
        }
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
