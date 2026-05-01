import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gab-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-empty">
      <div class="gab-empty__icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="9" y="11" width="30" height="26" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 18h30" stroke="currentColor" stroke-width="1.5"/>
          <path d="M16 26h16M16 31h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 class="gab-empty__title">{{ title }}</h3>
      @if (message) { <p class="gab-empty__message">{{ message }}</p> }
      <div class="gab-empty__actions">
        <ng-content />
      </div>
    </div>
  `,
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() message?: string;
}
