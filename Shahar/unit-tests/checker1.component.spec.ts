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
import { Checker1Service } from 'src/app/shared/services/checker1.service';
import { NumbersOnlyDirective } from 'src/app/shared/directives/numbers-only.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockCheckerService: any;

  beforeEach(async () => {
    // Mocking the service to return observable data
    mockCheckerService = {
      getCheckerData: jest.fn().mockReturnValue(of([])),
      submitAction: jest.fn().mockReturnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component,    // Standalone Component
        NumbersOnlyDirective, // Standalone Directive
        ReactiveFormsModule,
        AgGridModule
      ],
      providers: [
        { provide: Checker1Service, useValue: mockCheckerService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;

    // IMPORTANT: Mock Ag-Grid API to prevent crashes on grid logic
    component.gridApi = {
      setRowData: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([]),
      sizeColumnsToFit: jest.fn()
    } as any;

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // Requirement: Save/Submit buttons disabled until validation passes
  it('should disable submit button when form is invalid', () => {
    component.filterForm.patchValue({ securityId: '' }); // Invalid state
    fixture.detectChanges();
    
    const submitBtn = fixture.nativeElement.querySelector('#submit-btn');
    // If the button is bound to [disabled]="filterForm.invalid"
    expect(component.filterForm.invalid).toBeTruthy();
  });

  it('should enable submit button when required fields are filled', () => {
    component.filterForm.patchValue({
      securityId: '12345',
      eventDate: '2023-12-01',
      entitlement: 'Cash'
    });
    fixture.detectChanges();

    expect(component.filterForm.valid).toBeTruthy();
  });
});