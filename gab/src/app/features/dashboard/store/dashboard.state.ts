import { DashboardSummary } from '@core/services/dashboard.service';

export const DASHBOARD_FEATURE_KEY = 'dashboard';

export interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export const initialDashboardState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
};
