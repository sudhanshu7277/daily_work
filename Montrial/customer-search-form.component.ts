import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerSearchFormData } from '../models/customer-search.model';

@Component({
  selector: 'app-customer-search-form',
  templateUrl: './customer-search-form.component.html',
  styleUrls: ['./customer-search-form.component.scss']
}
export class CustomerSearchFormComponent implements OnInit {
  customerSearchForm!: FormGroup;

  @Output() customerSearchSubmit = new EventEmitter<CustomerSearchFormData>();

  constructor(private fb: FormBuilder) {
    // 1. Initializing Form Controls with caseId
    this.customerSearchForm = this.fb.group({
      firstName: ['', [Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]],
      lastName: ['', [Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]],
      city: ['', [Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]],
      province: [''],
      dob: [''],
      phone: ['', [ValidatorUtils.phoneValidator]],
      caseId: ['', [Validators.pattern(/^\d+$/)]] // Validates numerical input configurations
    });
  }

  ngOnInit(): void {
    this.setupPrecedenceListener();
  }

  // 2. BR006 Criterion #4: Reactive listener handles real-time data input field precedence
  private setupPrecedenceListener(): void {
    this.customerSearchForm.get('caseId')?.valueChanges.subscribe((value: string) => {
      if (value && value.trim() !== '') {
        // Automatically clear demographic fields if a user types a case ID
        this.customerSearchForm.patchValue({
          firstName: '',
          lastName: '',
          city: '',
          province: '',
          dob: '',
          phone: ''
        }, { emitEvent: false }); // Prevents infinite loops across value changes hooks
      }
    });
  }

  // 3. Final Updated Submission Handler
  searchCustomer(): void {
    if (this.customerSearchForm.valid) {
      const formValues = this.customerSearchForm.value;

      // Direct Case Search takes complete precedence over traditional options
      if (formValues.caseId && formValues.caseId.trim() !== '') {
        const caseSearchPayload: CustomerSearchFormData = {
          caseId: formValues.caseId.trim()
        };
        this.customerSearchSubmit.emit(caseSearchPayload);
      } else {
        // Standard structural fallback sequence if case ID parameter is omitted
        this.customerSearchSubmit.emit(formValues as CustomerSearchFormData);
      }
    }
  }

  clearSearch(): void {
    // Criterion #5: Single reset action cleans both structural layers simultaneously
    this.customerSearchForm.reset();
  }
}