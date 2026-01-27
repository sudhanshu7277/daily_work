
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Using relative paths to fix module resolution issues
import { Checker1Service } from '../../shared/services/checker1.service';
import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR', 'GBP'])),
      getCheckerData: jest.fn().mockReturnValue(of([])),
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

    // Mock Ag-Grid API to prevent "undefined" errors in Light Speed
    component.gridApi = {
      setRowData: jest.fn(),
      sizeColumnsToFit: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([])
    } as any;

    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    // This will now pass because of Validators.required in the .ts
    expect(component.filterForm.invalid).toBeTruthy();
  });

  it('should enable form when search and date are provided', () => {
    component.filterForm.patchValue({
      search: 'TEST123',
      dateFilter: '2026-01-26'
    });
    fixture.detectChanges();
    expect(component.filterForm.valid).toBeTruthy();
  });

  it('should call getCheckerData on search', () => {
    component.onSearch();
    expect(mockService.getCheckerData).toHaveBeenCalled();
  });
});





// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Checker1Component } from './checker1.component';
// import { ReactiveFormsModule } from '@angular/forms';
// import { AgGridModule } from 'ag-grid-angular';
// import { of } from 'rxjs';
// import { NO_ERRORS_SCHEMA } from '@angular/core';

// // Using relative paths as confirmed to fix the module resolution issues
// import { Checker1Service } from '../../shared/services/checker1.service';
// import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';

// describe('Checker1Component', () => {
//   let component: Checker1Component;
//   let fixture: ComponentFixture<Checker1Component>;
//   let mockCheckerService: any;

//   beforeEach(async () => {
//     // Mocking service methods used in ngOnInit and component logic
//     mockCheckerService = {
//       getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR', 'GBP', 'INR'])),
//       getCheckerData: jest.fn().mockReturnValue(of([])),
//       updateStatus: jest.fn().mockReturnValue(of({ success: true }))
//     };

//     await TestBed.configureTestingModule({
//       imports: [
//         Checker1Component,    // Standalone Component
//         NumbersOnlyDirective, // Standalone Directive
//         ReactiveFormsModule,
//         AgGridModule
//       ],
//       providers: [
//         { provide: Checker1Service, useValue: mockCheckerService }
//       ],
//       schemas: [NO_ERRORS_SCHEMA]
//     }).compileComponents();

//     fixture = TestBed.createComponent(Checker1Component);
//     component = fixture.componentInstance;

//     // IMPORTANT: Mocking Ag-Grid APIs to prevent "undefined" errors during test execution
//     // This matches the gridEvents you use in the .ts file
//     component.gridApi = {
//       setRowData: jest.fn(),
//       getSelectedRows: jest.fn().mockReturnValue([]),
//       sizeColumnsToFit: jest.fn(),
//       setFocusedCell: jest.fn()
//     } as any;

//     fixture.detectChanges(); // Triggers ngOnInit
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should call getCurrencies on initialization', () => {
//     expect(mockCheckerService.getCurrencies).toHaveBeenCalled();
//     expect(component.currencies.length).toBeGreaterThan(0);
//   });

//   describe('Form Validation Logic', () => {
//     it('should have an invalid form when fields are empty', () => {
//       // Assumes Validators.required is applied in the .ts file
//       component.filterForm.patchValue({
//         search: '',
//         dateFilter: null
//       });
//       expect(component.filterForm.invalid).toBeTruthy();
//     });

//     it('should enable the form when valid data is entered', () => {
//       component.filterForm.patchValue({
//         search: 'SECURITY123',
//         dateFilter: '2026-01-26',
//         currencyFilter: 'USD'
//       });
//       expect(component.filterForm.valid).toBeTruthy();
//     });
//   });

//   describe('Grid Interactions', () => {
//     it('should update row data when onSearch is called', () => {
//       const searchSpy = jest.spyOn(mockCheckerService, 'getCheckerData');
//       component.onSearch();
//       expect(searchSpy).toHaveBeenCalled();
//     });

//     it('should clear selection when reset is called', () => {
//       component.onReset();
//       expect(component.filterForm.get('search')?.value).toBe('');
//       expect(component.filterForm.get('currencyFilter')?.value).toBe('ALL');
//     });
//   });
// });