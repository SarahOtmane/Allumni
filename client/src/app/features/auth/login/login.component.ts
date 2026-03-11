import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LoginLoadingComponent } from './login.loading';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoginLoadingComponent],
  template: `
    <div class="min-h-screen flex flex-col lg:flex-row bg-white">
      <!-- Decorative Section (Hidden on mobile) -->
      <div
        class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-900 flex-col justify-between p-12 text-white relative overflow-hidden"
      >
        <!-- Background shapes -->
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center space-x-3 mb-12">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <span class="text-2xl font-bold tracking-tight">Alumni Network</span>
          </div>

          <h1 class="text-5xl font-extrabold mb-6 leading-tight">Connectez-vous à votre futur professionnel.</h1>
          <p class="text-xl text-indigo-100 max-w-lg font-light leading-relaxed">
            La plateforme d'excellence pour rester en contact avec vos promotions, découvrir des opportunités et
            dynamiser votre carrière.
          </p>
        </div>

        <div class="relative z-10 flex items-center space-x-6 text-sm text-indigo-100">
          <span>&copy; 2024 Alumni Platform</span>
          <span class="w-1 h-1 bg-indigo-300 rounded-full"></span>
          <span>Tous droits réservés</span>
        </div>
      </div>

      <!-- Form Section -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 lg:bg-white">
        <div class="max-w-md w-full">
          <!-- Mobile Logo -->
          <div class="lg:hidden flex justify-center mb-8">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
              </div>
              <span class="text-2xl font-bold text-gray-900 tracking-tight">Alumni Network</span>
            </div>
          </div>

          <div class="text-center lg:text-left mb-10">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Bon retour parmi nous !</h2>
            <p class="text-gray-500">Veuillez entrer vos identifiants pour accéder à votre espace.</p>
          </div>

          @if (errorMsg()) {
            <div class="mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3 animate-pulse">
              <svg class="h-5 w-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-sm text-red-800 font-medium">{{ errorMsg() }}</p>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Adresse email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="name@example.com"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label for="password" class="block text-sm font-semibold text-gray-700">Mot de passe</label>
                <a href="#" class="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                  >Mot de passe oublié ?</a
                >
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
                />
              </div>
            </div>

            <div class="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember_me" class="ml-2 block text-sm text-gray-700"> Se souvenir de moi </label>
            </div>

            @if (isLoading()) {
              <app-login-loading />
            } @else {
              <button
                type="submit"
                [disabled]="loginForm.invalid"
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Se connecter
              </button>
            }
          </form>

          <p class="mt-8 text-center text-sm text-gray-500">
            Vous n'avez pas de compte ?
            <span class="font-semibold text-indigo-600">Contactez l'administration</span>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMsg = signal<string | null>(null);

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Redirection based on role
        const role = response.user.role;
        if (role === 'ADMIN' || role === 'STAFF') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/portal']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.message || 'Identifiants invalides');
      },
    });
  }
}
