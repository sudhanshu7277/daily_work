import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PpaEntryComponent } from './ppa-entry.component';
import { InputComponent } from './components/input/input.component';
import { Checker1Component } from './components/checker1/checker1.component';
import { Checker2Component } from './components/checker2/checker2.component';
// ... other components

const routes: Routes = [
  {
    path: '',
    component: PpaEntryComponent,
    children: [
      { path: '', redirectTo: 'input', pathMatch: 'full' },
      {
        path: 'input',
        component: InputComponent,
        data: { screen: 'Input' }
      },
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
      },
      // Add more with data: { screen: 'Checker3' }, etc.
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpaEntryRoutingModule {}











// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { PpaEntryComponent } from './ppa-entry.component';
// import { InputComponent } from './components/input/input.component';
// import { Checker1Component } from './components/checker1/checker1.component';
// import { Checker2Component } from './components/checker2/checker2.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: PpaEntryComponent,
//     children: [
//       { path: '', redirectTo: 'input', pathMatch: 'full' },
//       { path: 'input', component: InputComponent },
//       { path: 'checker1', component: Checker1Component },
//       { path: 'checker2', component: Checker2Component },
//     ]
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class PpaEntryRoutingModule { }