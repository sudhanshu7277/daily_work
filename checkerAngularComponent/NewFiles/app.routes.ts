import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'ppa-entry',
    loadChildren: () => import('./features/ppa-entry/ppa-entry.routes').then(r => r.ppaEntryRoutes)
  }
];