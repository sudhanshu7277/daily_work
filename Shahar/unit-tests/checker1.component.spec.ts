
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Ensure these relative paths are correct for your directory structure
import { Checker1Service } from '../../shared/services/checker1.service';
import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    // FIX: The mock must define these as functions returning Observables
    // to prevent the "Cannot read properties of undefined (reading 'subscribe')" error.
    mockService = {
      getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR', 'GBP'])),
      getCheckerData: jest.fn().mockReturnValue(of([])),
      // Add any other service methods called in ngOnInit here
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component,    
        NumbersOnlyDirective, 
        ReactiveFormsModule,
        AgGridModule
      ],
      providers: [
        { provide: Checker1Service, useValue: mockService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;

    // FIX: Mock the Ag-Grid API so component methods like onSearch() don't crash
    component.gridApi = {
      setRowData: jest.fn(),
      sizeColumnsToFit: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([]),
    } as any;

    // Trigger ngOnInit and the subscriptions
    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    // This passes because you added Validators.required to the .ts
    expect(component.filterForm.invalid).toBeTruthy();
  });

  it('should call getCurrencies and populate dropdown on init', () => {
    expect(mockService.getCurrencies).toHaveBeenCalled();
    expect(component.currencies).toEqual(['USD', 'EUR', 'GBP']);
  });

  it('should enable search button when form is valid', () => {
    component.filterForm.patchValue({
      search: 'SECURITY123',
      dateFilter: '2026-01-26'
    });
    fixture.detectChanges();
    expect(component.filterForm.valid).toBeTruthy();
  });
});



// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Checker1Component } from './checker1.component';
// import { ReactiveFormsModule } from '@angular/forms';
// import { AgGridModule } from 'ag-grid-angular';
// import { of } from 'rxjs';
// import { NO_ERRORS_SCHEMA } from '@angular/core';

// // Paths already verified to work
// import { Checker1Service } from '../../shared/services/checker1.service';
// import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';

// describe('Checker1Component', () => {
//   let component: Checker1Component;
//   let fixture: ComponentFixture<Checker1Component>;
//   let mockService: any;

//   beforeEach(async () => {
//     // Mock service to handle currency fetch and data search
//     mockService = {
//       getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR', 'GBP'])),
//       getCheckerData: jest.fn().mockReturnValue(of([])),
//     };

//     await TestBed.configureTestingModule({
//       imports: [
//         Checker1Component,    // Standalone
//         NumbersOnlyDirective, // Standalone
//         ReactiveFormsModule,
//         AgGridModule
//       ],
//       providers: [
//         { provide: Checker1Service, useValue: mockService }
//       ],
//       schemas: [NO_ERRORS_SCHEMA]
//     }).compileComponents();

//     fixture = TestBed.createComponent(Checker1Component);
//     component = fixture.componentInstance;

//     // Grid API Mock to satisfy onSearch() and other grid interactions
//     component.gridApi = {
//       setRowData: jest.fn(),
//       sizeColumnsToFit: jest.fn(),
//       getSelectedRows: jest.fn().mockReturnValue([]),
//       setFocusedCell: jest.fn()
//     } as any;

//     fixture.detectChanges(); 
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should have invalid form initially due to Validators.required', () => {
//     // This will now PASS because you added Validators.required to the .ts
//     expect(component.filterForm.invalid).toBeTruthy();
//   });

//   it('should become valid when search and dateFilter are provided', () => {
//     component.filterForm.patchValue({
//       search: 'SECURITY123',
//       dateFilter: '2026-01-26'
//     });
//     fixture.detectChanges();
//     expect(component.filterForm.valid).toBeTruthy();
//   });

//   it('should call getCheckerData on search', () => {
//     component.onSearch();
//     expect(mockService.getCheckerData).toHaveBeenCalled();
//   });

//   it('should reset form and keep currency as ALL on onReset', () => {
//     component.filterForm.patchValue({ search: 'CLEARTEXT' });
//     component.onReset();
//     expect(component.filterForm.get('search')?.value).toBe('');
//     expect(component.filterForm.get('currencyFilter')?.value).toBe('ALL');
//   });
// });

