import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Promotion {
  year: number;
}

export interface Alumni {
  id: string;
  first_name: string;
  last_name: string;
  diploma: string;
  promo_year: number;
  linkedin_url?: string;
  current_position?: string;
  company?: string;
  status: string;
  data_enriched: boolean;
  user: {
    email: string;
    is_active: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AlumniService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/alumni`;

  getPromos() {
    return this.http.get<Promotion[]>(`${this.apiUrl}/promos`);
  }

  createPromo(year: number) {
    return this.http.post<Promotion>(`${this.apiUrl}/promos`, { year });
  }

  getAlumniByYear(year: number) {
    return this.http.get<Alumni[]>(`${this.apiUrl}/promos/${year}`);
  }

  importCsv(year: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<unknown>(`${this.apiUrl}/import/${year}`, formData);
  }
}
