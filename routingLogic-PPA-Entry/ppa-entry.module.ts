import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import your components
import { PpaEntryComponent } from './ppa-entry.component';
// Import child components (Input, Checker1, etc.)
// import { InputComponent } from './components/input/input.component';
// import { Checker1Component } from './components/checker1/checker1.component';
// ...

// Import routing
import { PpaEntryRoutingModule } from './ppa-entry-routing.module';
import { AgGridModule } from 'ag-grid-angular';

// Import shared components (e.g., your tab component)
import { TabComponent } from '../shared/components/tab/tab.component'; // Adjust path if needed
import { PaymentGridComponent } from '../PaymentGridComponent/payment-grid.component';

@NgModule({
  declarations: [
    PpaEntryComponent,
    // InputComponent,
    // Checker1Component,
    // Checker2Component,
    // ... declare all child components here
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PpaEntryRoutingModule,
    AgGridModule,
    PaymentGridComponent
    // If TabComponent is standalone, import it here:
    // TabComponent
  ]
})
export class PpaEntryModule { }