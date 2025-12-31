import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

import { PpaEntryRoutingModule } from './ppa-entry-routing.module';
import { PpaEntryComponent } from './ppa-entry.component';

// Standalone imports
import { TabComponent } from '../shared/components/tab/tab.component';
import { InputComponent } from './components/input/input.component';
import { Checker1Component } from './components/checker1/checker1.component';
import { Checker2Component } from './components/checker2/checker2.component';
import { PaymentDenominationGridComponent } from './components/payment-denomination-grid/payment-denomination-grid.component';
import { CreditorDetailsFormComponent } from './components/creditor-details-form/creditor-details-form.component';
import { PaymentDetailsFormComponent } from './components/payment-details-form/payment-details-form.component';
import { PaymentDetailsSummaryComponent } from './components/payment-details-summary/payment-details-summary.component';
import { TaxDetailsComponent } from './components/tax-details/tax-details.component';
import { PaymentGridComponent } from '../shared/components/payment-grid/payment-grid.component';
import { TitlecasePipe } from '../shared/pipes/titlecase.pipe';

@NgModule({
  declarations: [
    PpaEntryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PpaEntryRoutingModule,
    AgGridModule,
    TabComponent,
    InputComponent,
    Checker1Component,
    Checker2Component,
    PaymentDenominationGridComponent,
    CreditorDetailsFormComponent,
    PaymentDetailsFormComponent,
    PaymentDetailsSummaryComponent,
    TaxDetailsComponent,
    PaymentGridComponent,
    TitlecasePipe
  ]
})
export class PpaEntryModule { }











// // NEW FOR PPA MODULE

// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { AgGridModule } from 'ag-grid-angular';
// import { PpaEntryRoutingModule } from './ppa-entry-routing.module';

// import { PpaEntryComponent } from './ppa-entry.component'; // Non-standalone

// // Standalone imports
// import { PaymentGridComponent } from '../shared/components/payment-grid/payment-grid.component'; // Standalone
// import { TabComponent } from '../shared/components/tab/tab.component'; // Standalone

// @NgModule({
//   declarations: [
//     PpaEntryComponent // Non-standalone here
//   ],
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     PpaEntryRoutingModule,
//     AgGridModule,

//     // Standalone components/modules
//     PaymentGridComponent,
//     TabComponent
//   ]
// })
// export class PpaEntryModule { }
