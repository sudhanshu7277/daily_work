import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PaymentInstruction } from '@core/models';

export const PaymentActions = createActionGroup({
  source: 'Payment',
  events: {
    'Load Queue': emptyProps(),
    'Load Queue Success': props<{ data: PaymentInstruction[] }>(),
    'Load Queue Failure': props<{ error: string }>(),
  },
});
