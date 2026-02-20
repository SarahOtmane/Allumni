import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ActivateLoadingComponent } from './activate.loading';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActivateLoadingComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        @if (isProcessing()) {
          <app-activate-loading />
        } @else {
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Activez votre compte</h2>
            <p class="mt-2 text-center text-sm text-gray-600">
              Choisissez votre mot de passe pour finaliser votre inscription
            </p>
          </div>

          @if (errorMsg()) {
            <div class="bg-red-50 border-l-4 border-red-400 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-700">{{ errorMsg() }}</p>
                </div>
              </div>
            </div>
          }

          @if (success()) {
            <div class="bg-green-50 border-l-4 border-green-400 p-4">
              <p class="text-sm text-green-700">
                Votre compte a été activé ! Vous allez être redirigé vers la page de connexion.
              </p>
            </div>
          } @else {
            <form class="mt-8 space-y-6" [formGroup]="activateForm" (ngSubmit)="onSubmit()">
              <div class="rounded-md shadow-sm -space-y-px">
                <div>
                  <label for="password" class="sr-only">Mot de passe</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    formControlName="password"
                    required
                    class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Nouveau mot de passe"
                  />
                </div>
                <div>
                  <label for="confirmPassword" class="sr-only">Confirmer le mot de passe</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    formControlName="confirmPassword"
                    required
                    class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Confirmez le mot de passe"
                  />
                </div>
              </div>

              @if (activateForm.errors?.['mismatch'] && activateForm.get('confirmPassword')?.touched) {
                <p class="text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
              }

              <div>
                <button
                  type="submit"
                  [disabled]="activateForm.invalid || isProcessing()"
                  class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Activer mon compte
                </button>
              </div>
            </form>
          }
        }
      </div>
    </div>
  `,
})
export class ActivateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = signal<string | null>(null);
  isProcessing = signal(false);
  success = signal(false);
  errorMsg = signal<string | null>(null);

  activateForm = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit() {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
    if (!this.token()) {
      this.errorMsg.set("Token d'activation manquant dans l'URL.");
    }
  }

  passwordMatchValidator(g: AbstractControl) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.activateForm.invalid || !this.token()) return;

    this.isProcessing.set(true);
    this.errorMsg.set(null);

    const { password } = this.activateForm.getRawValue();

    this.authService.activateAccount(this.token()!, password).subscribe({
      next: () => {
        this.success.set(true);
        this.isProcessing.set(false);
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMsg.set(err.error?.message || "Une erreur est survenue lors de l'activation.");
      },
    });
  }
}
