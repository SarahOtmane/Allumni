# Services Métier & Intégrations

Ce document recense les services principaux de l'application Alumni.

## 1. Backend Services (NestJS)

| Service | Module | Description |
|:--------|:-------|:------------|
| **AuthService** | `auth` | Gestion JWT, Login, Register, Activation (Argon2) |
| **AlumniService** | `alumni` | Logique métier profils, Promos, Import CSV |
| **UsersService** | `users` | Gestion des comptes, Invitations Team |
| **JobsService** | `jobs` | CRUD Offres d'emploi, Filtres |
| **EventsService** | `events` | CRUD Événements, Inscriptions |
| **ChatService** | `chat` | Gestion conversations & messages, WebSockets |
| **NotificationService** | `notifications` | Système d'alertes en temps réel |
| **MailService** | `mail` | Envoi d'emails (Nodemailer/Handlebars) |
| **AdminService** | `admin` | Agrégation des KPIs pour le dashboard |
| **ScrapingService** | `scraping` | (Phase 5) Orchestration du scraping LinkedIn |

### Focus : Messagerie & Notifications (WebSockets)

L'application utilise Socket.io pour les fonctionnalités temps réel.

**A. ChatGateway (Namespace: `default`)**
- Gère le broadcast des messages dans les rooms de conversation.
- Sécurisé par JWT lors du handshake.

**B. NotificationsGateway (Namespace: `notifications`)**
- Notifie les utilisateurs des nouveaux messages, jobs ou events.
- Utilise une room par utilisateur (`user_{userId}`).

---

## 2. Frontend Services (Angular)

Les services Angular sont des Singletons (`providedIn: 'root'`) qui communiquent avec l'API NestJS via `HttpClient` ou WebSockets.

| Service | Usage | Endpoint Base |
|---------|-------|---------------|
| **AuthService** | Login, Logout, état utilisateur (Signal) | `/api/auth` |
| **AlumniService** | Récupération annuaire, Profil | `/api/alumni` |
| **ChatService** | Messagerie, connexion WebSocket | `/api/chat` |
| **NotificationService** | Gestion des alertes, WebSocket | `/api/notifications` |
| **AdminService** | Upload CSV, Stats | `/api/admin` |

### Pattern Service Angular (Signal + HttpClient)

```typescript
// client/src/app/core/services/alumni.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Alumni } from '../../shared/models/alumni.model';

@Injectable({ providedIn: 'root' })
export class AlumniService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/alumni`;

  // État réactif local (cache simple)
  alumniList = signal<Alumni[]>([]);

  search(filters: Partial<Alumni>) {
    return this.http.get<Alumni[]>(this.apiUrl, { params: { ...filters } }).pipe(
      tap((data) => this.alumniList.set(data)),
    );
  }

  findById(id: string) {
    return this.http.get<Alumni>(`${this.apiUrl}/${id}`);
  }
}
```

### AuthService (Gestion du Token JWT)

```typescript
// client/src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ access_token: string; user: User }>(
      `${environment.apiUrl}/auth/login`,
      credentials,
    ).pipe(
      tap(({ access_token, user }) => {
        localStorage.setItem('token', access_token);
        this.currentUser.set(user);
      }),
    );
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
}
```

## 3. Variables d'Environnement

### Backend (`server/.env`)

```env
# Database
DB_HOST=mysql_db
DB_PORT=3306
DB_USER=alumni_user
DB_PASS=secret
DB_NAME=alumni_db

# Redis (Queue)
REDIS_HOST=redis_cache
REDIS_PORT=6379

# JWT
JWT_SECRET=super_secret_key_change_me
JWT_EXPIRATION=1d

# App
PORT=3000
NODE_ENV=development
```

### Frontend — Développement (`client/src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

### Frontend — Production (`client/src/environments/environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.alumni-school.com/api',
};
```