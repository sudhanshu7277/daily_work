import { createReducer, on } from '@ngrx/store';
import { DashboardActions } from './dashboard.actions';
import { initialDashboardState } from './dashboard.state';

export const dashboardReducer = createReducer(
  initialDashboardState,
  on(DashboardActions.loadSummary, (state) => ({ ...state, loading: true, error: null })),
  on(DashboardActions.loadSummarySuccess, (state, { summary }) => ({
    ...state,
    summary,
    loading: false,
  })),
  on(DashboardActions.loadSummaryFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);
