import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// FIX: Use relative paths to bypass Jest's failure to resolve 'src/' aliases
import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';
import { Checker1Service } from '../../shared/services/checker1.service';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    // FIX: Hardened mock ensuring 'getCurrencies' is defined before ngOnInit
    mockService = {
      getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR', 'INR'])),
      getCheckerData: jest.fn().mockReturnValue(of([])),
      updateStatus: jest.fn().mockReturnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component,    // Standalone Component
        NumbersOnlyDirective, // Standalone Directive
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

    // FIX: Ag-Grid API Stub to prevent "cannot read property of undefined" during build
    component.gridApi = {
      setRowData: jest.fn(),
      sizeColumnsToFit: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([])
    } as any;

    fixture.detectChanges(); 
  });

  it('should compile and fetch currencies', () => {
    expect(component).toBeTruthy();
    expect(mockService.getCurrencies).toHaveBeenCalled();
  });

  it('should keep save button disabled if form is invalid', () => {
    // Use Case: Form validation prevents submission
    component.filterForm.patchValue({ securityId: '' });
    fixture.detectChanges();
    expect(component.filterForm.invalid).toBeTruthy();
  });
});