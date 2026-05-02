import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // Assuming login is a standalone component we build next
  // { path: 'login', loadComponent: () => import('./core/auth/login.component').then(m => m.LoginComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
  },
  { 
    path: 'instruction/new', 
    loadComponent: () => import('./features/instruction-setup/instruction-setup.component').then(m => m.InstructionSetupComponent) 
  },
  { 
    path: 'instruction/maker-queue', 
    loadComponent: () => import('./features/instruction-workflow/maker-queue/maker-queue.component').then(m => m.MakerQueueComponent) 
  },
  { 
    path: 'instruction/checker/:id', 
    loadComponent: () => import('./features/instruction-workflow/checker-view/checker-view.component').then(m => m.CheckerViewComponent) 
  },
  { 
    path: 'instruction/queue', 
    loadComponent: () => import('./features/instruction-workflow/checker-queue/checker-queue.component').then(m => m.CheckerQueueComponent) 
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }