import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { PAYMENT_FEATURE_KEY } from './store/payment.state';
import { paymentReducer } from './store/payment.reducer';
import { PaymentEffects } from './store/payment.effects';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(PAYMENT_FEATURE_KEY, paymentReducer),
      provideEffects(PaymentEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./payment-list.component').then((m) => m.PaymentListPageComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./payment-detail.component').then((m) => m.PaymentDetailPageComponent),
      },
    ],
  },
];
