import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Promotion {
  year: number;
}

export interface AlumniExperience {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

export interface Alumni {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  diploma: string;
  promo_year: number;
  linkedin_url?: string;
  current_position?: string;
  company?: string;
  status: string;
  data_enriched: boolean;
  scraping_status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scraping_error?: string;
  user?: {
    email: string;
    is_active: boolean;
  };
  experiences?: AlumniExperience[];
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

  getAlumniByYear(year: number, search?: string) {
    let params = {};
    if (search) {
      params = { search };
    }
    return this.http.get<Alumni[]>(`${this.apiUrl}/promos/${year}`, { params });
  }

  updateAlumni(id: string, alumni: Partial<Alumni> & { email?: string }) {
    return this.http.patch<Alumni>(`${this.apiUrl}/${id}`, alumni);
  }

  deleteAlumni(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  triggerScraping(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/scrape`, {});
  }

  importCsv(year: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<unknown>(`${this.apiUrl}/import/${year}`, formData);
  }
}
