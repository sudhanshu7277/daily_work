import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { APPROVAL_FEATURE_KEY } from './store/approval.state';
import { approvalReducer } from './store/approval.reducer';
import { ApprovalEffects } from './store/approval.effects';

export const APPROVAL_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(APPROVAL_FEATURE_KEY, approvalReducer),
      provideEffects(ApprovalEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./approval-list.component').then((m) => m.ApprovalListPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./approval-detail.component').then((m) => m.ApprovalDetailPageComponent),
      },
    ],
  },
];
