import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsService, AlumniEvent } from '../../../../core/services/events.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  standalone: true,
  selector: 'app-alumni-event-list',
  imports: [CommonModule, ConfirmModalComponent],
  template: `
    <div class="p-6">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Événements</h1>
          <p class="text-gray-600">Participez à la vie du réseau et rencontrez vos pairs</p>
        </div>

        <div class="flex bg-white rounded-lg border p-1 shadow-sm">
          <button
            (click)="activeTab.set('UPCOMING')"
            [class.bg-indigo-600]="activeTab() === 'UPCOMING'"
            [class.text-white]="activeTab() === 'UPCOMING'"
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
          >
            À venir
          </button>
          <button
            (click)="activeTab.set('PAST')"
            [class.bg-indigo-600]="activeTab() === 'PAST'"
            [class.text-white]="activeTab() === 'PAST'"
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
          >
            Passés
          </button>
          <button
            (click)="activeTab.set('MY_EVENTS')"
            [class.bg-indigo-600]="activeTab() === 'MY_EVENTS'"
            [class.text-white]="activeTab() === 'MY_EVENTS'"
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
          >
            Mes inscriptions
          </button>
        </div>
      </header>

      <!-- Events Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (event of filteredEvents(); track event.id) {
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col"
          >
            <div class="h-32 bg-indigo-50 flex items-center justify-center border-b border-gray-50 relative">
              <div class="text-center">
                <span class="block text-3xl font-black text-indigo-600">{{ event.date | date: 'dd' }}</span>
                <span class="block text-xs uppercase font-bold text-indigo-400">{{ event.date | date: 'MMM' }}</span>
              </div>
              @if (event.isRegistered) {
                <span
                  class="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full shadow-sm"
                >
                  Inscrit
                </span>
              }
            </div>

            <div class="p-5 flex-1 flex flex-col">
              <h3 class="font-bold text-lg text-gray-900 line-clamp-1">{{ event.title }}</h3>
              <div class="mt-2 space-y-1">
                <p class="text-sm text-gray-500 flex items-center">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ event.date | date: 'HH:mm' }}
                </p>
                <p class="text-sm text-gray-500 flex items-center">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  {{ event.location }}
                </p>
              </div>

              <p class="mt-4 text-sm text-gray-600 line-clamp-3 mb-6">{{ event.description }}</p>

              <div class="mt-auto">
                @if (isPast(event)) {
                  <button
                    disabled
                    class="w-full py-2 bg-gray-100 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed"
                  >
                    Événement terminé
                  </button>
                } @else {
                  @if (event.isRegistered) {
                    <button
                      (click)="onUnregisterClick(event.id)"
                      class="w-full py-2 border-2 border-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Annuler mon inscription
                    </button>
                  } @else {
                    <button
                      (click)="onRegister(event.id)"
                      class="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Je participe
                    </button>
                  }
                }
              </div>
            </div>
          </div>
        } @empty {
          <div
            class="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 italic"
          >
            Aucun événement trouvé dans cette catégorie.
          </div>
        }
      </div>
    </div>

    @if (eventIdToUnregister()) {
      <app-confirm-modal
        title="Annuler l'inscription"
        message="Voulez-vous vraiment annuler votre inscription à cet événement ?"
        confirmText="Confirmer l'annulation"
        (confirmed)="handleUnregister()"
        (cancelled)="eventIdToUnregister.set(null)"
      />
    }
  `,
})
export class AlumniEventListComponent implements OnInit {
  private eventsService = inject(EventsService);

  events = signal<AlumniEvent[]>([]);
  activeTab = signal<'UPCOMING' | 'PAST' | 'MY_EVENTS'>('UPCOMING');
  eventIdToUnregister = signal<string | null>(null);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventsService.getEvents().subscribe((data) => this.events.set(data));
  }

  filteredEvents() {
    const now = new Date();
    const allEvents = this.events();

    switch (this.activeTab()) {
      case 'UPCOMING':
        return allEvents.filter((e) => new Date(e.date) >= now);
      case 'PAST':
        return allEvents.filter((e) => new Date(e.date) < now);
      case 'MY_EVENTS':
        return allEvents.filter((e) => e.isRegistered);
      default:
        return allEvents;
    }
  }

  isPast(event: AlumniEvent) {
    return new Date(event.date) < new Date();
  }

  onRegister(id: string) {
    this.eventsService.register(id).subscribe(() => this.loadEvents());
  }

  onUnregisterClick(id: string) {
    this.eventIdToUnregister.set(id);
  }

  handleUnregister() {
    if (!this.eventIdToUnregister()) return;

    this.eventsService.unregister(this.eventIdToUnregister()!).subscribe(() => {
      this.eventIdToUnregister.set(null);
      this.loadEvents();
    });
  }
}
