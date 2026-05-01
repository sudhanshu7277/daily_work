import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'gab-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel || null"
      [attr.aria-busy]="loading || null"
      class="gab-btn"
      [class]="classes"
      (click)="handleClick($event)"
    >
      @if (loading) {
        <span class="gab-btn__spinner" aria-hidden="true"></span>
      }
      <span class="gab-btn__content" [class.gab-btn__content--hidden]="loading">
        <ng-content />
      </span>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() block = false;
  @Input() ariaLabel?: string;

  @Output() readonly clicked = new EventEmitter<MouseEvent>();

  protected get classes(): string {
    return [
      `gab-btn--${this.variant}`,
      `gab-btn--${this.size}`,
      this.block ? 'gab-btn--block' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) return;
    this.clicked.emit(event);
  }
}
