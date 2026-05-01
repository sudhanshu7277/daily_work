import { createReducer, on } from '@ngrx/store';
import { ApprovalActions } from './approval.actions';
import { initialApprovalState } from './approval.state';

export const approvalReducer = createReducer(
  initialApprovalState,
  on(ApprovalActions.loadQueue, (state) => ({ ...state, loading: true, error: null })),
  on(ApprovalActions.loadQueueSuccess, (state, { data }) => ({
    ...state,
    queue: data,
    loading: false,
  })),
  on(ApprovalActions.loadQueueFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(ApprovalActions.advanceSuccess, (state, { instruction }) => ({
    ...state,
    queue: state.queue.map((i) => (i.id === instruction.id ? instruction : i)),
  }))
);
