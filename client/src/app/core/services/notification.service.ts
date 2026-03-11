import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  JOB = 'JOB',
  EVENT = 'EVENT',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/notifications`;
  private socketUrl = environment.apiUrl.replace('/api', '/notifications');
  private socket: Socket | null = null;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  connect() {
    if (this.socket?.connected) return;

    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(this.socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('newNotification', (notification: Notification) => {
      this.notifications.update((prev) => [notification, ...prev]);
      this.unreadCount.update((count) => count + 1);
    });

    this.loadNotifications();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  loadNotifications() {
    this.http.get<Notification[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.unreadCount.set(data.filter((n) => !n.is_read).length);
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
      },
    });
  }

  markAsRead(id: string) {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/read`, {}).subscribe(() => {
      this.notifications.update((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      this.unreadCount.update((count) => Math.max(0, count - 1));
    });
  }

  markAllAsRead() {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).subscribe(() => {
      this.notifications.update((prev) => prev.map((n) => ({ ...n, is_read: true })));
      this.unreadCount.set(0);
    });
  }
}
