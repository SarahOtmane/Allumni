import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getTeam() {
    return this.http.get<Partial<User>[]>(`${this.apiUrl}/team`);
  }

  invite(email: string, role: string) {
    return this.http.post(`${this.apiUrl}/invite`, { email, role });
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
