import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DASHBOARD_FEATURE_KEY, DashboardState } from './dashboard.state';

const selectDashboardState = createFeatureSelector<DashboardState>(DASHBOARD_FEATURE_KEY);

export const selectDashboardSummary = createSelector(selectDashboardState, (s) => s.summary);
export const selectDashboardLoading = createSelector(selectDashboardState, (s) => s.loading);
export const selectDashboardError = createSelector(selectDashboardState, (s) => s.error);
