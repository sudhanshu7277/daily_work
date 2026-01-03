import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PpaEntryRoutingModule } from './ppa-entry-routing.module';
import { AgGridModule } from 'ag-grid-angular';

// Standalone or other components
import { TabComponent } from './components/tab/tab.component'; // Example path
import { PaymentGridComponent } from './components/payment-grid/payment-grid.component';
import { InputComponent } from './input/input.component';
import { Checker1Component } from './checker1/checker1.component';
import { Checker2Component } from './checker2/checker2.component';
import { Checker3Component } from './checker3/checker3.component'; // Ensure this is declared
import { PaymentDenominationGridComponent } from './components/payment-denomination-grid/payment-denomination-grid.component';
import { CreditorDetailsFormComponent } from './components/creditor-details-form/creditor-details-form.component';
import { PaymentDetailsFormComponent } from './components/payment-details-form/payment-details-form.component';
import { PaymentDetailsSummaryComponent } from './components/payment-details-summary/payment-details-summary.component';
import { TaxDetailsComponent } from './components/tax-details/tax-details.component';

import { PpaEntryComponent } from './ppa-entry.component';
import { PaymentDetailsSummaryComponent } from './components/payment-details-summary/payment-details-summary.component'; // Already there

@NgModule({
  declarations: [
    PpaEntryComponent,
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
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PpaEntryRoutingModule,
    AgGridModule
    // Add Material modules, etc.
  ],
  exports: [] // Usually empty for feature modules
})
export class PpaEntryModule { }