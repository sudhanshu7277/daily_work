import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PAYMENT_FEATURE_KEY, PaymentState } from './payment.state';

const selectState = createFeatureSelector<PaymentState>(PAYMENT_FEATURE_KEY);

export const selectPaymentQueue = createSelector(selectState, (s) => s.queue);
export const selectPaymentLoading = createSelector(selectState, (s) => s.loading);
export const selectPaymentError = createSelector(selectState, (s) => s.error);
