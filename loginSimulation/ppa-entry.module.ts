import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PpaEntryRoutingModule } from './ppa-entry-routing.module';
import { AgGridModule } from 'ag-grid-angular';

// Standalone components (import them here to use in this module)
import { TabComponent } from './components/tab/tab.component';
import { PaymentGridComponent } from './components/payment-grid/payment-grid.component';
import { InputComponent } from './input/input.component';
import { Checker1Component } from './checker1/checker1.component';
import { Checker2Component } from './checker2/checker2.component';
import { Checker3Component } from './checker3/checker3.component';
import { PaymentDenominationGridComponent } from './components/payment-denomination-grid/payment-denomination-grid.component';
import { CreditorDetailsFormComponent } from './components/creditor-details-form/creditor-details-form.component';
import { PaymentDetailsFormComponent } from './components/payment-details-form/payment-details-form.component';
import { PaymentDetailsSummaryComponent } from './components/payment-details-summary/payment-details-summary.component';
import { TaxDetailsComponent } from './components/tax-details/tax-details.component';

// Non-standalone (module-declared) component
import { PpaEntryComponent } from './ppa-entry.component';

@NgModule({
  declarations: [
    PpaEntryComponent  // Only non-standalone components here
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PpaEntryRoutingModule,
    AgGridModule,
    
    // Standalone components imported here
    TabComponent,
    PaymentGridComponent,
    InputComponent,
    Checker1Component,
    Checker2Component,
    Checker3Component,
    PaymentDenominationGridComponent,
    CreditorDetailsFormComponent,
    PaymentDetailsFormComponent,
    PaymentDetailsSummaryComponent,
    TaxDetailsComponent
    
    // Add Angular Material modules or others as needed (e.g., MatTabsModule for tabs)
  ],
  exports: []  // Empty unless exporting for other modules
})
export class PpaEntryModule { }