import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { CardComponent } from '@shared/components/card/card.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'gab-approval-detail-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-page">
      <gab-page-header
        [title]="id || 'Approval'"
        subtitle="Approval workflow detail"
        [breadcrumbs]="[
          { label: 'Home', path: '/' },
          { label: 'Approvals', path: '/approvals' },
          { label: id || 'Detail' }
        ]"
      />

      <gab-card>
        <gab-empty-state
          title="Approval detail comes in phase 3"
          message="Maker, Checker, Signature Validation, and Operations Callback views (Figs 3, 4, 5) will live here."
        />
      </gab-card>
    </div>
  `,
})
export class ApprovalDetailPageComponent {
  @Input() id?: string;
}
