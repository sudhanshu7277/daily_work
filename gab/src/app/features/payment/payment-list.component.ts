import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { CardComponent } from '@shared/components/card/card.component';
import { WorkflowStepperComponent } from '@shared/components/workflow-stepper/workflow-stepper.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaymentActions } from './store/payment.actions';
import { selectPaymentQueue } from './store/payment.selectors';

@Component({
  selector: 'gab-payment-list-page',
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
        title="Payments"
        subtitle="3-step payment workflow queue"
        [breadcrumbs]="[{ label: 'Home', path: '/' }, { label: 'Payments' }]"
      />

      <gab-card title="Workflow preview">
        <gab-workflow-stepper flow="payment" currentStatus="payment-in-progress" />
      </gab-card>

      <div class="gab-mt-6">
        <gab-card>
          <gab-empty-state
            title="Payment workflow comes in phase 4"
            message="Currently a 3-step read-only mirror of a manual Citi Direct payment, per the requirements doc. To be replaced once the Shared Service Team's payment screens are built and integrated via APIs."
          />
        </gab-card>
      </div>
    </div>
  `,
})
export class PaymentListPageComponent implements OnInit {
  private readonly store = inject(Store);
  protected readonly queue$ = this.store.select(selectPaymentQueue);

  ngOnInit(): void {
    this.store.dispatch(PaymentActions.loadQueue());
  }
}
