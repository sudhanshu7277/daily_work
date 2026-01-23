import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-customer',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search-customer.component.html',
  styleUrls: ['./search-customer.component.scss']
})
export class SearchCustomerComponent implements OnInit{
  @Output() searchTriggered = new EventEmitter<any>();
  @Output() clearTriggered = new EventEmitter<void>();
  searchForm!: FormGroup;

  constructor(private fb: FormBuilder) {}
  
  criteria = {
    type: 'individual',
    firstName: '',
    lastName: '',
    middleName: '',
    dob: '',
    phone: '',
    email: '',
    lawyerEmail: '',
    manager: ''
  };

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      type: ['individual'],
      // Individual fields
      lastName: ['', Validators.required],
      middleName: [''],
      firstName: ['', Validators.required],
      dob: [null],
      // Entity fields
      entityName: [''],
      // Shared fields
      phone: [''],
      email: ['', Validators.email],
      lawyerEmail: ['', Validators.email],
      manager: ['']
    });

    this.searchForm.get('type')?.valueChanges.subscribe(value => {
      this.updateValidators(value);
    });
  }

  private updateValidators(type: string): void {
    const last = this.searchForm.get('lastName');
    const first = this.searchForm.get('firstName');
    const entity = this.searchForm.get('entityName');

    if (type === 'individual') {
      last?.setValidators(Validators.required);
      first?.setValidators(Validators.required);
      entity?.clearValidators();
    } else {
      last?.clearValidators();
      first?.clearValidators();
      entity?.setValidators(Validators.required);
    }

    // Refresh validation state for all affected fields
    [last, first, entity].forEach(control => control?.updateValueAndValidity());
  }

  isFormValid(): boolean {
    return this.criteria.firstName.trim().length > 0 && 
           this.criteria.lastName.trim().length > 0;
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.searchTriggered.emit(this.searchForm.value);
    }
  }

  onClear(): void {
    this.searchForm.reset({ type: 'individual' });
    this.clearTriggered.emit();
  }
}