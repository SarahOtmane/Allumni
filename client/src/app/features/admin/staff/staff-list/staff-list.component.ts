import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { User } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Gestion de l'Équipe</h1>
        <p class="text-gray-600">Invitez et gérez les administrateurs et membres du staff</p>
      </header>

      <!-- Formulaire d'invitation rapide -->
      <section class="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">Inviter un nouveau membre</h2>
        <form [formGroup]="inviteForm" (ngSubmit)="onInvite()" class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              type="email"
              formControlName="email"
              placeholder="Adresse email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div class="w-full sm:w-48">
            <select
              formControlName="role"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white"
            >
              <option value="STAFF">Staff (Lecture)</option>
              <option value="ADMIN">Admin (Total)</option>
            </select>
          </div>
          <button
            type="submit"
            [disabled]="inviteForm.invalid || isSubmitting()"
            class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {{ isSubmitting() ? 'Envoi...' : "Envoyer l'invitation" }}
          </button>
        </form>
        @if (errorMsg()) {
          <p class="mt-2 text-sm text-red-600 font-medium">{{ errorMsg() }}</p>
        }
        @if (successMsg()) {
          <p class="mt-2 text-sm text-green-600 font-medium">{{ successMsg() }}</p>
        }
      </section>

      <!-- Liste des membres -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                Date d'invitation
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (member of team(); track member.id) {
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ member.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span [ngClass]="member.role === 'ADMIN' ? 'text-indigo-600 font-bold' : 'text-gray-600'">
                    {{ member.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    [ngClass]="member.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                    class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ member.is_active ? 'Actif' : 'En attente' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {{ member.created_at | date: 'dd/MM/yyyy' }}
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-gray-500 italic">
                  Aucun membre trouvé dans l'équipe.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class StaffListComponent implements OnInit {
  private userService = inject(UsersService);

  team = signal<Partial<User>[]>([]);
  isSubmitting = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  inviteForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl('STAFF', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit() {
    this.loadTeam();
  }

  loadTeam() {
    this.userService.getTeam().subscribe((data) => this.team.set(data));
  }

  onInvite() {
    if (this.inviteForm.invalid) return;

    this.isSubmitting.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const { email, role } = this.inviteForm.getRawValue();

    this.userService.invite(email, role).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMsg.set('Invitation envoyée avec succès.');
        this.inviteForm.get('email')?.reset();
        this.loadTeam();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMsg.set(err.error?.message || "Erreur lors de l'invitation.");
      },
    });
  }
}
