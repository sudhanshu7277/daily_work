import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { CardComponent } from '@shared/components/card/card.component';
import { WorkflowStepperComponent } from '@shared/components/workflow-stepper/workflow-stepper.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ApprovalActions } from './store/approval.actions';
import { selectApprovalQueue } from './store/approval.selectors';

@Component({
  selector: 'gab-approval-list-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CardComponent,
    WorkflowStepperComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-page">
      <gab-page-header
        title="Approvals"
        subtitle="4-step approval workflow queue"
        [breadcrumbs]="[{ label: 'Home', path: '/' }, { label: 'Approvals' }]"
      />

      <gab-card title="Workflow preview">
        <gab-workflow-stepper flow="approval" currentStatus="signature-validation" />
      </gab-card>

      <div class="gab-mt-6">
        <gab-card>
          <gab-empty-state
            title="Approval list & detail screens come in phase 3"
            message="The Maker / Checker / Signature / Callback screens (Figs 3, 4, 5) will be wired up against the queue we already load below."
          />
          <pre class="gab-text-xs gab-text-muted">{{ (queue$ | async) | json }}</pre>
        </gab-card>
      </div>
    </div>
  `,
})
export class ApprovalListPageComponent implements OnInit {
  private readonly store = inject(Store);
  protected readonly queue$ = this.store.select(selectApprovalQueue);

  ngOnInit(): void {
    this.store.dispatch(ApprovalActions.loadQueue());
  }
}
