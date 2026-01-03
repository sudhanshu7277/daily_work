import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PpaEntryComponent } from '../ppa-entry.component'; // Adjust path if needed
import { InputComponent } from '../input/input.component';
import { Checker1Component } from '../checker1/checker1.component';
import { Checker2Component } from '../checker2/checker2.component';
import { Checker3Component } from '../checker3/checker3.component'; // Add this import

import { RoleGuard } from '../../auth/role.guard';
import { AuthRedirectGuard } from '../../auth/auth-redirect.guard';

const routes: Routes = [
  {
    path: '',
    component: PpaEntryComponent, // Parent with tabs
    canActivateChild: [RoleGuard], // Optional: extra protection on children
    children: [
      {
        path: '',
        canActivate: [AuthRedirectGuard], // Redirects to role-specific tab
        redirectTo: 'input',
        pathMatch: 'full'
      },
      {
        path: 'input',
        component: InputComponent,
        data: { roles: ['Maker'] } // Only Maker can access input tab
      },
      {
        path: 'checker1',
        component: Checker1Component,
        data: { roles: ['Checker1'] }
      },
      {
        path: 'checker2',
        component: Checker2Component,
        data: { roles: ['Checker2'] }
      },
      {
        path: 'checker3',
        component: Checker3Component,
        data: { roles: ['Checker3'] }
      }
      // Add more tab routes as needed
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpaEntryRoutingModule { }