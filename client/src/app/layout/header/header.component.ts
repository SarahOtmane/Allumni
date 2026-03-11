import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../core/services/auth.service';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm relative">
      <div class="flex items-center">
        <!-- Breadcrumb placeholder or Page title -->
        @if (breadcrumbPrefix) {
          <span class="text-gray-400 mr-2">{{ breadcrumbPrefix }} /</span>
        }
        <span class="font-medium text-gray-700">{{ pageTitle }}</span>
      </div>

      <div class="flex items-center space-x-6">
        <!-- Notifications Bell -->
        <div class="relative">
          <button
            (click)="toggleNotifications()"
            class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            @if (notificationService.unreadCount() > 0) {
              <span
                class="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold text-center leading-4 shadow-sm border-2 border-white"
              >
                {{ notificationService.unreadCount() }}
              </span>
            }
          </button>

          <!-- Notifications Dropdown -->
          @if (showNotifications) {
            <div
              class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <span class="font-bold text-sm text-gray-900">Notifications</span>
                <button (click)="markAllAsRead()" class="text-xs text-indigo-600 hover:underline">
                  Tout marquer comme lu
                </button>
              </div>
              <div class="max-h-96 overflow-y-auto">
                @for (notif of notificationService.notifications(); track notif.id) {
                  <div
                    (click)="onNotifClick(notif)"
                    [class.bg-indigo-50]="!notif.is_read"
                    class="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div class="flex items-start">
                      <div
                        [class.bg-blue-100]="notif.type === 'MESSAGE'"
                        [class.bg-green-100]="notif.type === 'JOB'"
                        [class.bg-purple-100]="notif.type === 'EVENT'"
                        class="p-2 rounded-lg mr-3 shrink-0"
                      >
                        @if (notif.type === 'MESSAGE') {
                          <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                          </svg>
                        } @else if (notif.type === 'JOB') {
                          <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        } @else if (notif.type === 'EVENT') {
                          <svg class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        }
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-gray-900 truncate">{{ notif.title }}</p>
                        <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">{{ notif.content }}</p>
                        <p class="text-[10px] text-gray-400 mt-1">{{ notif.created_at | date: 'short' }}</p>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="p-8 text-center text-gray-400 italic text-sm">Aucune notification.</div>
                }
              </div>
            </div>
          }
        </div>

        <div class="flex flex-col text-right">
          <span class="text-sm font-bold text-gray-900">{{ user?.email }}</span>
          <span class="text-xs text-indigo-600 font-medium tracking-tight">{{ user?.role }}</span>
        </div>

        <button
          (click)="logout.emit()"
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
          title="Déconnexion"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;
  @Input() breadcrumbPrefix: string = '';
  @Input() pageTitle: string = "Vue d'ensemble";
  @Output() logout = new EventEmitter<void>();

  notificationService = inject(NotificationService);
  private router = inject(Router);

  showNotifications = false;

  ngOnInit() {
    this.notificationService.connect();
  }

  ngOnDestroy() {
    this.notificationService.disconnect();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  onNotifClick(notif: Notification) {
    if (!notif.is_read) {
      this.notificationService.markAsRead(notif.id);
    }
    this.showNotifications = false;

    // Navigate based on type
    if (notif.type === 'MESSAGE') {
      if (this.user?.role === 'ALUMNI') {
        this.router.navigate(['/portal/chat'], { queryParams: { id: notif.reference_id } });
      } else {
        this.router.navigate(['/admin/messages'], { queryParams: { id: notif.reference_id } });
      }
    } else if (notif.type === 'JOB') {
      const path = this.user?.role === 'ALUMNI' ? '/portal/jobs' : '/admin/jobs';
      this.router.navigate([path]);
    } else if (notif.type === 'EVENT') {
      const path = this.user?.role === 'ALUMNI' ? '/portal/events' : '/admin/events';
      this.router.navigate([path]);
    }
  }
}
