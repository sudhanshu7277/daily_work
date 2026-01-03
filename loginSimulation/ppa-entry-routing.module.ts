import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PpaEntryComponent } from './ppa-entry.component';
import { InputComponent } from './components/input/input.component';
import { Checker1Component } from './components/checker1/checker1.component';
import { Checker2Component } from './components/checker2/checker2.component';
import { Checker3Component } from './components/checker3/checker3.component';

import { RoleGuard } from '../auth/role.guard';
import { AuthRedirectGuard } from '../auth/auth-redirect.guard';

const routes: Routes = [
  {
    path: '',
    component: PpaEntryComponent,
    canActivateChild: [RoleGuard],
    children: [
      {
        path: '',
        canActivate: [AuthRedirectGuard] // This runs once on /ppa-entry
      },
      {
        path: 'input',
        component: InputComponent,
        data: { roles: ['Maker'] }
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
      },
      {
        path: '**',
        redirectTo: 'input' // Fallback
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpaEntryRoutingModule { }