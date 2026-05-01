import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
        title: 'Dashboard — GAB',
      },
      {
        path: 'instructions',
        loadChildren: () =>
          import('./features/instruction-setup/instruction-setup.routes').then(
            (m) => m.INSTRUCTION_SETUP_ROUTES
          ),
        title: 'Instructions — GAB',
      },
      {
        path: 'approvals',
        loadChildren: () =>
          import('./features/approval/approval.routes').then((m) => m.APPROVAL_ROUTES),
        title: 'Approvals — GAB',
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payment/payment.routes').then((m) => m.PAYMENT_ROUTES),
        title: 'Payments — GAB',
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
