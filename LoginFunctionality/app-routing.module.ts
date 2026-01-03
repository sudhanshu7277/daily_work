import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component'; // Import standalone login component

const routes: Routes = [
  { path: 'login', component: LoginComponent },  // Add login route here
  {
    path: 'ppa-entry',
    loadChildren: () =>
      import('./features/ppa-entry/ppa-entry.module').then(m => m.PpaEntryModule)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Redirect root to login instead of /ppa-entry
  { path: '**', redirectTo: '/login' }  // Redirect unknown paths to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }