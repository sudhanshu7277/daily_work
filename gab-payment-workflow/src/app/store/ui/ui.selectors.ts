import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.reducer';

export const selectUiFeature = createFeatureSelector<UiState>('ui');
export const selectActiveNotifications = createSelector(selectUiFeature, state => state.activeNotifications);