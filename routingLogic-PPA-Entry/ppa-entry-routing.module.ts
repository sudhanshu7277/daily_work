import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PpaEntryComponent } from './ppa-entry.component';

// Import or create your tab-specific components
import { InputComponent } from './input/input.component';           // Default "Input" tab
import { Checker1Component } from './checker1/checker1.component';
import { Checker2Component } from './checker2/checker2.component';
// ... add Checker3Component, Checker4Component, ResubmitComponent, etc.

const routes: Routes = [
  {
    path: '',
    component: PpaEntryComponent,  // This component has the tabs + outlet
    children: [
      { path: '', redirectTo: 'input', pathMatch: 'full' },
      { path: 'input', component: InputComponent },
      { path: 'checker-1', component: Checker1Component },
      { path: 'checker-2', component: Checker2Component },
      // { path: 'checker-3', component: Checker3Component },
      // { path: 'checker-4', component: Checker4Component },
      // { path: 'resubmit', component: ResubmitComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpaEntryRoutingModule { }