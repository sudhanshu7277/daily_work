import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LegalHoldState } from './legal-hold.reducer';

export const selectLegalHoldState = createFeatureSelector<LegalHoldState>('legalHold');

export const selectAllProfiles = createSelector(selectLegalHoldState, s => s.profiles);
export const selectSelectedProfiles = createSelector(selectLegalHoldState, s => s.selectedProfiles);
export const selectSelectedCount = createSelector(selectSelectedProfiles, s => s.length);
export const selectIsLoading = createSelector(selectLegalHoldState, s => s.loading);