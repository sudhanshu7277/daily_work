import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; // Required for formGroup and formControlName
import { MatFormFieldModule } from '@angular/material/form-field'; // For mat-form-field
import { MatInputModule } from '@angular/material/input'; // For matInput
import { MatCheckboxModule } from '@angular/material/checkbox'; // For mat-checkbox
import { MatButtonModule } from '@angular/material/button'; // For mat-raised-button
import { MatDatepickerModule } from '@angular/material/datepicker'; // For mat-datepicker
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter (or use MatMomentDateModule for dayjs-like behavior)

import { AppComponent } from './app.component';
import { PaymentDetailsFormComponent } from './payment-details-form/payment-details-form.component'; // Adjust path as needed

@NgModule({
  declarations: [
    AppComponent,
    PaymentDetailsFormComponent, // Declare the component here
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule, // Enable reactive forms
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule, // Or MatMomentDateModule if using dayjs
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
