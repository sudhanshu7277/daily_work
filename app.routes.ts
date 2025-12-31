import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { RoleGuard } from './shared/guards/role.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'ppa-entry',
    loadComponent: () => import('./features/ppa-entry/ppa-entry.component').then(c => c.PpaEntryComponent),
    children: [
      { path: '', redirectTo: 'input', pathMatch: 'full' },
      { path: 'input', loadComponent: () => import('./features/ppa-entry/components/input/input.component').then(c => c.InputComponent) },
      {
        path: 'checker1',
        loadComponent: () => import('./features/ppa-entry/components/checker1/checker1.component').then(c => c.Checker1Component),
        canActivate: [RoleGuard],
        data: { screen: 'Checker1' }
      },
      {
        path: 'checker2',
        loadComponent: () => import('./features/ppa-entry/components/checker2/checker2.component').then(c => c.Checker2Component),
        canActivate: [RoleGuard],
        data: { screen: 'Checker2' }
      }
      // Add more child routes...
    ]
  }
];