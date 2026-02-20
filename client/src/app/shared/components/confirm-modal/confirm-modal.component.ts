import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [title]="title" (closed)="onCancel()">
      <div class="space-y-4">
        <p class="text-gray-600">{{ message }}</p>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            class="px-4 py-2 text-white rounded-md transition-colors shadow-sm"
            [ngClass]="confirmColorClass"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </app-modal>
  `,
})
export class ConfirmModalComponent {
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr de vouloir effectuer cette action ?';
  @Input() confirmText: string = 'Confirmer';
  @Input() confirmColorClass: string = 'bg-red-600 hover:bg-red-700';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
