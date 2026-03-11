import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { User, AuthService } from '../../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ChatService } from '../../../../core/services/chat.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  template: `
    <div class="p-10 bg-gray-50/30 min-h-screen">
      <header class="mb-10">
        <div class="flex items-center text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2">
          <span class="opacity-50">Gestion</span>
          <span class="mx-2 text-gray-300">/</span>
          <span>Équipe</span>
        </div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestion de l'Équipe</h1>
        <p class="text-gray-500 font-medium mt-1">Invitez et gérez les administrateurs et membres du staff.</p>
      </header>

      <!-- Formulaire d'invitation rapide -->
      @if (authService.currentUser()?.role === 'ADMIN' || authService.currentUser()?.role === 'STAFF') {
        <section class="mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 class="text-xl font-black text-gray-900 italic tracking-tight">Inviter un nouveau membre</h2>
          </div>

          <form [formGroup]="inviteForm" (ngSubmit)="onInvite()" class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <input
                type="email"
                formControlName="email"
                placeholder="Adresse email professionnelle"
                class="w-full px-6 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div class="w-full lg:w-64 relative">
              <select
                formControlName="role"
                class="w-full px-6 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white text-sm font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="STAFF">Staff</option>
                @if (authService.currentUser()?.role === 'ADMIN') {
                  <option value="ADMIN">Administrateur</option>
                }
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              [disabled]="inviteForm.invalid || isSubmitting()"
              class="px-8 py-3.5 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              {{ isSubmitting() ? 'Envoi...' : "Envoyer l'invitation" }}
            </button>
          </form>

          @if (errorMsg()) {
            <div class="mt-4 p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ errorMsg() }}
            </div>
          }
          @if (successMsg()) {
            <div class="mt-4 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ successMsg() }}
            </div>
          }
        </section>
      }

      <!-- Liste des membres -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Membre
              </th>
              <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rôle</th>
              <th class="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Statut
              </th>
              <th class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Invitation
              </th>
              <th class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            @for (member of team(); track member.id) {
              <tr class="hover:bg-indigo-50/20 transition-all group">
                <td class="px-8 py-6 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 mr-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"
                    >
                      {{ member.email?.substring(0, 2)?.toUpperCase() }}
                    </div>
                    <span class="text-sm font-bold text-gray-900">{{ member.email }}</span>
                  </div>
                </td>
                <td class="px-8 py-6 whitespace-nowrap">
                  <span
                    [class]="member.role === 'ADMIN' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 bg-slate-50'"
                    class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-black/5"
                  >
                    {{ member.role }}
                  </span>
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-center">
                  @if (member.is_active) {
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest border border-emerald-100"
                      >Actif</span
                    >
                  } @else {
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest border border-amber-100"
                      >En attente</span
                    >
                  }
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-right text-xs font-bold text-gray-400 tabular-nums">
                  {{ member.created_at | date: 'dd MMM yyyy' }}
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-right">
                  <div class="flex justify-end space-x-2">
                    @if (member.id !== authService.currentUser()?.id) {
                      <button
                        (click)="onContactMember(member.id!)"
                        class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Contacter"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                    }
                    @if (member.role === 'STAFF') {
                      <button
                        (click)="onDeleteClick(member.id!)"
                        class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Supprimer"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14"
                          />
                        </svg>
                      </button>
                    } @else {
                      <div class="p-2 text-gray-200" title="Les administrateurs sont protégés">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-8 py-20 text-center">
                  <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-400 font-bold italic">Aucun membre dans l'équipe.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (staffIdToDelete()) {
      <app-confirm-modal
        title="Supprimer le membre"
        message="Êtes-vous sûr de vouloir supprimer ce membre de l'équipe ? Cette action est irréversible."
        confirmText="Supprimer"
        (confirmed)="handleDelete()"
        (cancelled)="staffIdToDelete.set(null)"
      />
    }
  `,
})
export class StaffListComponent implements OnInit {
  private userService = inject(UsersService);
  private chatService = inject(ChatService);
  private router = inject(Router);
  authService = inject(AuthService);

  team = signal<Partial<User>[]>([]);
  isSubmitting = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  staffIdToDelete = signal<string | null>(null);

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

  onDeleteClick(id: string) {
    this.staffIdToDelete.set(id);
  }

  onContactMember(userId: string) {
    this.chatService.createConversation(userId).subscribe((conv) => {
      this.router.navigate(['/admin/messages'], { queryParams: { id: conv.id } });
    });
  }

  handleDelete() {
    if (!this.staffIdToDelete()) return;

    this.userService.deleteUser(this.staffIdToDelete()!).subscribe({
      next: () => {
        this.staffIdToDelete.set(null);
        this.loadTeam();
      },
      error: (err) => {
        this.staffIdToDelete.set(null);
        alert(err.error?.message || 'Erreur lors de la suppression.');
      },
    });
  }
}
