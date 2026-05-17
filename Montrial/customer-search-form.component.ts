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


// LATEST CODE

// update environment.ts

export const environment = {
    production: false,
    xApiKey: 'b15cafde05469e95d57aea65dd5e0447',
    dEChecklist: 'https://www.qa2.bmogc.net/',
    endpointUrl: {
      party: '/api/customer-cases/users/customer',
      employee: '/api/customer-cases/users/employee',
      getCustomerSearchResult: '/api/customer-cases/users/customer',
      getCustomer: '/api/customer-cases/users/customer',
      getDashboard: '/api/customer-cases/cases',
      case: '/api/customer-cases/cases',
      users: '/api/customer-cases/users/employee',
      cases: '/api/customer-cases/cases',
      // New Advanced Filters Endpoint for BR006
      getCaseAdvanceFilters: '/api/customer-cases/cases/advance-filters'
    }
  };

  // customer-search.model.ts

  export interface CustomerSearchFormData {
    firstName?: string;
    lastName?: string;
    city?: string;
    province?: string;
    dob?: string;
    phone?: string;
    caseId?: string; // Added optional case ID tracking key
  }

  // customer-search-form.component.html

  <form [formGroup]="customerSearchForm" class="mb-2u">
  <fdc-row class="mt-4u">
    <div class="col-12">
      <h3 class="body-1-bold mb-2u">Case Search</h3>
      <p class="body-2-regular mb-2u text-muted">Enter the existing case number.</p>
    </div>
  </fdc-row>

  <fdc-row>
    <fdc-grid width="50" class="mt-2u">
      <fdc-input
        [type]="'text'"
        [maxLength]="20"
        formControlName="caseId"
        [label]="'Case Search'"
        [errorMessages]="fnErrorMessages">
      </fdc-input>
    </fdc-grid>
  </fdc-row>

  <fdc-row class="mt-4u">
    <div class="col-12 d-flex justify-content-end gap-2u">
      <button fdc-button type="button" variant="secondary" (click)="clearSearch()">
        Clear Search
      </button>
      <button fdc-button type="button" variant="primary" (click)="searchCustomer()">
        Search
      </button>
    </div>
  </fdc-row>
</form>

// customer-search-form.component.ts

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerSearchFormData } from '../models/customer-search.model';

@Component({
  selector: 'app-customer-search-form',
  templateUrl: './customer-search-form.component.html',
  styleUrls: ['./customer-search-form.component.scss']
})
export class CustomerSearchFormComponent implements OnInit {
  customerSearchForm!: FormGroup;

  @Output() customerSearchSubmit = new EventEmitter<CustomerSearchFormData>();

  constructor(private fb: FormBuilder) {
    this.customerSearchForm = this.fb.group({
      firstName: ['', [Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]],
      lastName: ['', [Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]],
      city: ['', [Validators.pattern(RegEx.ALPHANUMERIC_WITH_FRENCH)]],
      province: [''],
      dob: [''],
      phone: ['', [ValidatorUtils.phoneValidator]],
      caseId: ['', [Validators.pattern(/^\d+$/)]] // Enforces numerical entry pattern rules
    });
  }

  ngOnInit(): void {
    this.setupPrecedenceListener();
  }

  // BR006 Criterion #4: Precedence rule automatically resets demographics when typing case number
  private setupPrecedenceListener(): void {
    this.customerSearchForm.get('caseId')?.valueChanges.subscribe((value: string) => {
      if (value && value.trim() !== '') {
        this.customerSearchForm.patchValue({
          firstName: '',
          lastName: '',
          city: '',
          province: '',
          dob: '',
          phone: ''
        }, { emitEvent: false }); // Prevents circular triggers
      }
    });
  }

  searchCustomer(): void {
    if (this.customerSearchForm.valid) {
      this.customerSearchSubmit.emit(this.customerSearchForm.value);
    }
  }

  clearSearch(): void {
    this.customerSearchForm.reset();
  }
}

// parent component (e.g., customer-search.component.ts)

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { CustomerSearchFormData } from './models/customer-search.model';
import { CustomerSearchActions } from './store/customer-search.actions';

@Component({
  selector: 'app-customer-search',
  templateUrl: './customer-search.component.html',
  styleUrls: ['./customer-search.component.scss']
})
export class CustomerSearchComponent {
  showError = false;
  customerSearchFormData!: CustomerSearchFormData;

  constructor(private store: Store<any>) {}

  // Streamlined to maintain robust architectural state synchronization via NgRx store dispatches
  customerSearchSubmit(formData: CustomerSearchFormData): void {
    this.showError = false; 
    this.customerSearchFormData = formData;

    this.store.dispatch(
      CustomerSearchActions.getResult({ customerSearchFormData: formData })
    );
  }
}

// customer-search.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerSearchFormData, CustomerSearchResultResponse } from '@ece-models/customer-search';

@Injectable({
  providedIn: 'root'
})
export class CustomerSearchService {
  constructor(private http: HttpClient) {}

  getCustomerSearchResults(
    api: string,
    customerSearchFormData: CustomerSearchFormData,
    offset?: number
  ): Observable<CustomerSearchResultResponse> {
    
    // Safety check for uninitialized forms
    if (!customerSearchFormData) {
      const emptyResult: CustomerSearchResultResponse = {
        data: [],
        availableResultsCount: "0"
      };
      return of(emptyResult);
    }

    // 1. ADVANCED SEARCH BRANCH: Executed when caseId is defined
    if (customerSearchFormData.caseId && customerSearchFormData.caseId.trim() !== '') {
      const advancedSearchPayload = {
        caseId: customerSearchFormData.caseId.trim()
      };

      // Executes a POST request to the new advance-filters gateway route with the exact required payload
      return this.http.post<CustomerSearchResultResponse>(
        environment.endpointUrl.advancedSearch,
        advancedSearchPayload
      );
    }

    // 2. REGULAR CUSTOMER SEARCH BRANCH: Fallback legacy demographic parameter mapping
    let params = new HttpParams();
    params = params
      .set('first_name', customerSearchFormData.firstName || null)
      .set('last_name', customerSearchFormData.lastName || null)
      .set('city', customerSearchFormData.city || null)
      .set('province', customerSearchFormData.province || null)
      .set('date_of_birth', customerSearchFormData.dob || null)
      .set('phone_number', customerSearchFormData.phone || null);

    if (offset) {
      params = params
        .set('start_offset', offset.toString())
        .set('end_offset', (offset + 99).toString());
    }

    return this.http.get<CustomerSearchResultResponse>(
      environment.endpointUrl.getCustomer,
      { params: params }
    );
  }
}