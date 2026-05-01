import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gab-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="gab-modal" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId">
        <div class="gab-modal__backdrop" (click)="onBackdropClick()"></div>
        <div class="gab-modal__panel" [attr.data-size]="size">
          <header class="gab-modal__header">
            <h2 [id]="titleId" class="gab-modal__title">{{ title }}</h2>
            <button
              type="button"
              class="gab-modal__close"
              aria-label="Close dialog"
              (click)="closed.emit()"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </header>
          <div class="gab-modal__body">
            <ng-content />
          </div>
          <footer class="gab-modal__footer">
            <ng-content select="[modal-footer]" />
          </footer>
        </div>
      </div>
    }
  `,
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input({ required: true }) title!: string;
  @Input() open = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closeOnBackdrop = true;
  @Input() titleId = `gab-modal-title-${Math.random().toString(36).slice(2, 8)}`;

  @Output() readonly closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open) this.closed.emit();
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop) this.closed.emit();
  }
}
