const routes: Routes = [
    { path: '', redirectTo: '/ppa-entry', pathMatch: 'full' },
    {
      path: 'ppa-entry',
      loadChildren: () => import('./features/ppa-entry/ppa-entry.module').then(m => m.PpaEntryModule)
    }
  ];