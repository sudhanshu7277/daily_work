import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { DASHBOARD_FEATURE_KEY } from './store/dashboard.state';
import { dashboardReducer } from './store/dashboard.reducer';
import { DashboardEffects } from './store/dashboard.effects';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(DASHBOARD_FEATURE_KEY, dashboardReducer),
      provideEffects(DashboardEffects),
    ],
    loadComponent: () =>
      import('./dashboard-page.component').then((m) => m.DashboardPageComponent),
  },
];
