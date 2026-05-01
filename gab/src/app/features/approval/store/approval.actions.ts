import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaymentInstruction } from '@core/models';

export const ApprovalActions = createActionGroup({
  source: 'Approval',
  events: {
    'Load Queue': emptyProps(),
    'Load Queue Success': props<{ data: PaymentInstruction[] }>(),
    'Load Queue Failure': props<{ error: string }>(),

    'Advance': props<{ id: string }>(),
    'Advance Success': props<{ instruction: PaymentInstruction }>(),
    'Advance Failure': props<{ error: string }>(),
  },
});
