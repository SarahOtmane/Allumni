import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface DashboardStats {
  promotionsCount: number;
  alumni: {
    total: number;
    active: number;
    inactive: number;
  };
  staffCount: number;
  adminCount: number;
  eventsCount: number;
  jobsCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  getStats() {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
