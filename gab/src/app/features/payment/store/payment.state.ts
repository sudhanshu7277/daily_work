import { PaymentInstruction } from '@core/models';

export const PAYMENT_FEATURE_KEY = 'payment';

export interface PaymentState {
  queue: PaymentInstruction[];
  loading: boolean;
  error: string | null;
}

export const initialPaymentState: PaymentState = {
  queue: [],
  loading: false,
  error: null,
};
