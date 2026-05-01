import { createFeatureSelector, createSelector } from '@ngrx/store';
import { APPROVAL_FEATURE_KEY, ApprovalState } from './approval.state';

const selectState = createFeatureSelector<ApprovalState>(APPROVAL_FEATURE_KEY);

export const selectApprovalQueue = createSelector(selectState, (s) => s.queue);
export const selectApprovalLoading = createSelector(selectState, (s) => s.loading);
export const selectApprovalError = createSelector(selectState, (s) => s.error);
