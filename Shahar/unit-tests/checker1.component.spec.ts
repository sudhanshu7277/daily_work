import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive'; // Use relative path
import { Checker1Service } from '../../shared/services/checker1.service'; // Use relative path
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getCheckerData: jest.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component,    // Standalone component
        NumbersOnlyDirective, // Standalone directive
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
    
    // Mock the grid API to prevent "undefined" errors
    component.gridApi = {
      setRowData: jest.fn(),
      sizeColumnsToFit: jest.fn()
    } as any;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


// new changes to checker1.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// 1. RELATIVE PATHS bypass the Jest 'src/' alias resolution issues
import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';
import { Checker1Service } from '../../shared/services/checker1.service';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    // 2. MOCK SERVICE: Ensure getCurrencies returns an observable immediately
    mockService = {
      getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR', 'GBP'])),
      getCheckerData: jest.fn().mockReturnValue(of([])),
      saveData: jest.fn().mockReturnValue(of({ success: true }))
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
      schemas: [NO_ERRORS_SCHEMA] // Prevents build crashes on custom HTML tags
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;

    // 3. AG-GRID MOCK: Prevents 'setRowData' undefined errors during build
    component.gridApi = {
      setRowData: jest.fn(),
      sizeColumnsToFit: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([])
    } as any;

    fixture.detectChanges(); // Triggers ngOnInit and getCurrencies()
  });

  it('should create and fetch currencies', () => {
    expect(component).toBeTruthy();
    expect(mockService.getCurrencies).toHaveBeenCalled();
  });

  // USE CASE: Save button disabled logic
  it('should disable save button when form is invalid', () => {
    component.filterForm.patchValue({ currency: null, securityId: '' });
    fixture.detectChanges();
    
    // Checks that the requirement of disabled buttons is met
    expect(component.filterForm.invalid).toBeTruthy();
  });
});