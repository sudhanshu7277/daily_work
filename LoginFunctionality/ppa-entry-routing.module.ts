import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PpaEntryComponent } from './ppa-entry.component';
import { InputComponent } from './components/input/input.component';
import { Checker1Component } from './components/checker1/checker1.component';
import { Checker2Component } from './components/checker2/checker2.component';
import { Checker3Component } from './components/checker3/checker3.component'; // Assuming checker3 component exists
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
    {
      path: '',
      component: PpaEntryComponent,
      children: [
        { path: '', redirectTo: 'input', pathMatch: 'full' },
  
        { 
          path: 'input', 
          component: InputComponent,
          canActivate: [AuthGuard],
          data: { role: 'Maker' }
        },
  
        { 
          path: 'checker1', 
          component: Checker1Component,
          canActivate: [AuthGuard],
          data: { role: 'Checker1' }
        },
  
        { 
          path: 'checker2', 
          component: Checker2Component,
          canActivate: [AuthGuard],
          data: { role: 'Checker2' }
        },
  
        // Uncomment if you create checker3 component
        // { 
        //   path: 'checker3', 
        //   component: Checker3Component,
        //   canActivate: [AuthGuard],
        //   data: { role: 'Checker3' }
        // },
      ]
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpaEntryRoutingModule {}