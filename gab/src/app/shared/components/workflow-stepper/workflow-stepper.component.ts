import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ALL_WORKFLOW_STEPS,
  APPROVAL_STEPS,
  InstructionStatus,
  PAYMENT_STEPS,
  StepState,
  WorkflowStep,
} from '@core/models';

@Component({
  selector: 'gab-workflow-stepper',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="gab-stepper" [attr.data-orientation]="orientation">
      @for (step of steps(); track step.key; let i = $index) {
        <li
          class="gab-stepper__step"
          [attr.data-state]="stateOf(step.key)"
          [attr.aria-current]="stateOf(step.key) === 'current' ? 'step' : null"
        >
          <span class="gab-stepper__connector" aria-hidden="true"></span>
          <span class="gab-stepper__marker" aria-hidden="true">
            @if (stateOf(step.key) === 'completed') {
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <path d="M1 5l4 4L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            } @else {
              <span class="gab-stepper__index">{{ i + 1 }}</span>
            }
          </span>
          <span class="gab-stepper__label">{{ step.label }}</span>
        </li>
      }
    </ol>
  `,
  styleUrls: ['./workflow-stepper.component.scss'],
})
export class WorkflowStepperComponent {
  private readonly _flow = signal<'approval' | 'payment' | 'all'>('approval');
  private readonly _currentStatus = signal<InstructionStatus | null>(null);

  @Input() set flow(value: 'approval' | 'payment' | 'all') {
    this._flow.set(value);
  }
  @Input() set currentStatus(value: InstructionStatus | null | undefined) {
    this._currentStatus.set(value ?? null);
  }
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  protected readonly steps = computed<WorkflowStep[]>(() => {
    switch (this._flow()) {
      case 'approval': return APPROVAL_STEPS;
      case 'payment':  return PAYMENT_STEPS;
      case 'all':      return ALL_WORKFLOW_STEPS;
    }
  });

  protected stateOf(key: InstructionStatus): StepState {
    const current = this._currentStatus();
    if (!current) return 'upcoming';
    if (current === 'rejected') return key === 'admin-maker' ? 'rejected' : 'upcoming';

    const all = this.steps();
    const ci = all.findIndex((s) => s.key === current);
    const ki = all.findIndex((s) => s.key === key);

    if (ci === -1) return 'upcoming';
    if (ki < ci) return 'completed';
    if (ki === ci) return 'current';
    return 'upcoming';
  }
}
