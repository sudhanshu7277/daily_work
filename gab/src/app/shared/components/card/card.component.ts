import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gab-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="gab-card" [class.gab-card--flush]="flush" [class.gab-card--tight]="tight">
      @if (title || subtitle) {
        <header class="gab-card__header">
          @if (title) { <h3 class="gab-card__title">{{ title }}</h3> }
          @if (subtitle) { <p class="gab-card__subtitle">{{ subtitle }}</p> }
        </header>
      }
      <div class="gab-card__body">
        <ng-content />
      </div>
      <ng-content select="[card-footer]" />
    </section>
  `,
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() flush = false;
  @Input() tight = false;
}
