import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { CardComponent } from '@shared/components/card/card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'gab-payment-detail-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-page">
      <gab-page-header
        [title]="id || 'Payment'"
        subtitle="Payment workflow detail (read-only)"
        [breadcrumbs]="[
          { label: 'Home', path: '/' },
          { label: 'Payments', path: '/payments' },
          { label: id || 'Detail' }
        ]"
      />

      <gab-card>
        <gab-empty-state
          title="Payment detail comes in phase 4"
          message="Read-only mirror of the manual Citi Direct payment process."
        />
      </gab-card>
    </div>
  `,
})
export class PaymentDetailPageComponent {
  @Input() id?: string;
}
