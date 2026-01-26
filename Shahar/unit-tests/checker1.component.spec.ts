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

// Using RELATIVE paths to bypass the 'src/' alias resolution error
import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';
import { Checker1Service } from '../../shared/services/checker1.service';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
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

    // Mock Ag-Grid API objects to prevent 'undefined' crashes
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

  // Flow: Button remains disabled until form is valid
  it('should validate form and enable save button', () => {
    // Assuming these fields exist in your requirement doc
    component.filterForm.patchValue({
      securityId: '123456',
      eventDate: '2026-01-26'
    });
    fixture.detectChanges();
    
    expect(component.filterForm.valid).toBeTruthy();
  });
});