import { createReducer, on } from '@ngrx/store';
import { PaymentActions } from './payment.actions';
import { initialPaymentState } from './payment.state';

export const paymentReducer = createReducer(
  initialPaymentState,
  on(PaymentActions.loadQueue, (state) => ({ ...state, loading: true, error: null })),
  on(PaymentActions.loadQueueSuccess, (state, { data }) => ({
    ...state,
    queue: data,
    loading: false,
  })),
  on(PaymentActions.loadQueueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
