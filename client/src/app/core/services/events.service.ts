import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AlumniEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants?: number;
  created_at: string;
  isRegistered?: boolean; // Added for the alumni view
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/event-management`;

  getEvents() {
    return this.http.get<AlumniEvent[]>(this.apiUrl);
  }

  register(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/register`, {});
  }

  unregister(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}/unregister`);
  }

  getEvent(id: string) {
    return this.http.get<AlumniEvent>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<AlumniEvent>) {
    return this.http.post<AlumniEvent>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Partial<AlumniEvent>) {
    return this.http.patch<AlumniEvent>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
