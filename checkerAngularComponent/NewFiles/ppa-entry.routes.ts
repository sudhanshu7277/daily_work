import { Routes } from '@angular/router';
import { PpaEntryComponent } from './ppa-entry.component';
import { InputComponent } from './components/input/input.component';
import { Checker1Component } from './components/checker1/checker1.component';
import { Checker2Component } from './components/checker2/checker2.component';
import { RoleGuard } from '../shared/guards/role.guard';

export const ppaEntryRoutes: Routes = [
  {
    path: '',
    component: PpaEntryComponent,
    children: [
      { path: '', redirectTo: 'input', pathMatch: 'full' },
      { path: 'input', component: InputComponent, data: { screen: 'Input' } },
      {
        path: 'checker1',
        component: Checker1Component,
        data: { screen: 'Checker1' },
        canActivate: [RoleGuard]
      },
      {
        path: 'checker2',
        component: Checker2Component,
        data: { screen: 'Checker2' },
        canActivate: [RoleGuard]
      }
      // Add more...
    ]
  }
];