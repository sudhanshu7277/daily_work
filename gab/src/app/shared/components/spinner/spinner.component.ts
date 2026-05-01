import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gab-spinner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="gab-spinner-cmp"
      [class]="'gab-spinner-cmp--' + size"
      [attr.aria-label]="label || 'Loading'"
      role="status"
    >
      <span class="gab-spinner-cmp__circle" aria-hidden="true"></span>
      @if (showLabel && label) { <span class="gab-spinner-cmp__label">{{ label }}</span> }
    </span>
  `,
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() label = 'Loading';
  @Input() showLabel = false;
}
