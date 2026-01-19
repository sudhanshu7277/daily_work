import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'legal-hold', pathMatch: 'full' },
  {
    path: 'legal-hold',
    loadComponent: () => import('./features/legal-hold/legal-hold-shell.component').then(m => m.LegalHoldShellComponent)
  },
  // {
  //   path: 'bulk-upload',
  //   loadComponent: () => import('./features/bulk-upload/bulk-upload.component').then(m => m.BulkUploadComponent)
  // }
];