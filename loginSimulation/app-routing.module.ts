import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MakerComponent } from './maker/maker.component';
import { Checker1Component } from './checker1/checker1.component';
import { Checker2Component } from './checker2/checker2.component';
import { Checker3Component } from './checker3/checker3.component';
import { RoleGuard } from './role.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'maker',
    component: MakerComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Maker'] }
  },
  {
    path: 'checker1',
    component: Checker1Component,
    canActivate: [RoleGuard],
    data: { roles: ['Checker1'] }
  },
  {
    path: 'checker2',
    component: Checker2Component,
    canActivate: [RoleGuard],
    data: { roles: ['Checker2'] }
  },
  {
    path: 'checker3',
    component: Checker3Component,
    canActivate: [RoleGuard],
    data: { roles: ['Checker3'] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }