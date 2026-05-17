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
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerSearchService {
  constructor(private http: HttpClient) {}

  // Legacy GET lookup channel
  getCustomerSearchResults(urlPath: string, formData: any): Observable<any> {
    return this.http.get<any>(`${environment.endpointUrl.getCustomerSearchResult}${urlPath}`, { params: formData });
  }

  // BR006 targeted exact match POST lookup channel
  getCaseAdvanceFilters(payload: { cases: string }): Observable<any> {
    return this.http.post<any>(environment.endpointUrl.getCaseAdvanceFilters, payload);
  }
}

// customer-search.effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { CustomerSearchActions } from './customer-search.actions';
import { CustomerSearchService } from '@ece-services/customer-search.service';

@Injectable()
export class CustomerSearchEffects {
  constructor(
    private actions$: Actions,
    private customerSearchService: CustomerSearchService
  ) {}

  getCustomerSearchResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerSearchActions.getResult),
      mergeMap((action) => {
        const formData = action.customerSearchFormData;
        const isCaseSearch = formData?.caseId && formData.caseId.trim() !== '';

        // Intercept action payload to route stream to correct endpoint system
        const apiCall$ = isCaseSearch
          ? this.customerSearchService.getCaseAdvanceFilters({ cases: formData.caseId.trim() })
          : this.customerSearchService.getCustomerSearchResults('/customer', formData);

        return apiCall$.pipe(
          map((response: any) => {
            const rawData = response?.data || [];

            // Preserves sorting and mapping parameters to cleanly bind to existing customer result grids
            const sortedAndMappedResults = rawData
              .sort((a: any, b: any) => {
                if (a.caseId === b.caseId) return 0;
                if (a.caseId === null) return 1;
                if (b.caseId === null) return -1;
                return a.caseId < b.caseId ? 1 : -1;
              })
              .map((r: any, i: number) => ({
                ...r,
                index: i,
                legalName: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
                city: r.address?.city || null,
                province: r.address?.province || null
              }));

            return CustomerSearchActions.getResultSuccess({
              customerSearchResult: sortedAndMappedResults,
              availableResults: Number(response?.availableResultsCount || sortedAndMappedResults.length)
            });
          }),
          catchError((error) =>
            of(CustomerSearchActions.getResultFail({ error }))
          )
        );
      })
    )
  );
}