import { PaymentInstruction } from '@core/models';

export const APPROVAL_FEATURE_KEY = 'approval';

export interface ApprovalState {
  queue: PaymentInstruction[];
  loading: boolean;
  error: string | null;
}

export const initialApprovalState: ApprovalState = {
  queue: [],
  loading: false,
  error: null,
};
