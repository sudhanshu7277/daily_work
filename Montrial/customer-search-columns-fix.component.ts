import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

export class SearchCustomerComponent implements OnInit, OnDestroy {
  @Output() customerTypeChange = new EventEmitter<string>();
  private customerTypeSub!: Subscription;

  ngOnInit(): void {
    // 🟢 Subscribe to radio group value flips
    this.customerTypeSub = this.searchForm.get('customerType')?.valueChanges.subscribe((value: string) => {
      console.log('Radio button flipped to:', value);
      
      // Emit to parent shell or trigger internal state logic
      this.onCustomerTypeChange(value);
    })!;
  }

  onCustomerTypeChange(selectedType: string): void {
    // Perform any state reset, grid clearing, or parent notification
    this.customerTypeChange.emit(selectedType);
  }

  ngOnDestroy(): void {
    if (this.customerTypeSub) {
      this.customerTypeSub.unsubscribe();
    }
  }
}


<mat-radio-group 
  formControlName="customerType" 
  class="radio-group"
  (change)="onCustomerTypeChange($event.value)">
  
  <mat-radio-button value="Individual">
    {{ searchCustomerVerbiage.Individual | translate }}
  </mat-radio-button>

  <mat-radio-button value="Entity">
    {{ searchCustomerVerbiage.Entity | translate }}
  </mat-radio-button>

</mat-radio-group>


onCustomerTypeChange(value: string): void {
    console.log('Customer type changed:', value);
    // Handle the new value ('Individual' or 'Entity')
  }