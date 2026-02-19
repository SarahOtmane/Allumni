import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <app-header [user]="authService.currentUser()" (logout)="onLogout()" />

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-gray-50">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
  }
}
