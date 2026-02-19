import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface JobOffer {
  id: string;
  title: string;
  type: 'CDI' | 'CDD' | 'PRESTATAIRE';
  company: string;
  location?: string;
  description: string;
  company_description?: string;
  profile_description?: string;
  missions?: string;
  start_date: string;
  link?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jobs`;

  getJobs() {
    return this.http.get<JobOffer[]>(this.apiUrl);
  }

  getJob(id: string) {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`);
  }

  createJob(job: Partial<JobOffer>) {
    return this.http.post<JobOffer>(this.apiUrl, job);
  }

  updateJob(id: string, job: Partial<JobOffer>) {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
