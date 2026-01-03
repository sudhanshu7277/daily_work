import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './shared/components/login/login.component';
import { RoleGuard } from './auth/role.guard';
import { AuthRedirectGuard } from './auth/auth-redirect.guard'; // Add this import

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'ppa-entry',
    loadChildren: () => import('./features/ppa-entry/ppa-entry.module').then(m => m.PpaEntryModule),
    canActivate: [RoleGuard, AuthRedirectGuard], // RoleGuard first (auth check), then AuthRedirectGuard (role redirect)
    data: { 
      roles: ['Maker', 'Checker1', 'Checker2', 'Checker3'] 
    }
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }