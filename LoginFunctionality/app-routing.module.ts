// app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent }, // Create this component for access denied
  {
    path: 'ppa-entry',
    loadChildren: () => import('./features/ppa-entry/ppa-entry.module').then(m => m.PpaEntryModule),
    canLoad: [AuthGuard] // Optional: add a guard to check if logged in
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }