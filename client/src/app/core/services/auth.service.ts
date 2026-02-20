import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'ALUMNI';
  is_active: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ access_token: string; user: User }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(({ access_token, user }) => {
        localStorage.setItem('token', access_token);
        this.currentUser.set(user);
      }),
    );
  }

  activateAccount(token: string, password: string) {
    return this.http.post(`${this.apiUrl}/activate`, { token, password });
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  checkAuth(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);

    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      map((user) => {
        this.currentUser.set(user);
        return true;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      }),
    );
  }
}
