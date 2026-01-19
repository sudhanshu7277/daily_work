import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from 'src/app/shared/services/checker1.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeEach(async () => {
    // 1. Setup Mock Service with methods found in your .ts file
    mockService = {
      getCheckerData: jest.fn().mockReturnValue(of([
        { id: 1, status: 'Pending', amount: 100 } // Sample mock data
      ])),
      submitApproval: jest.fn().mockReturnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      // For Standalone components, the component goes in IMPORTS
      imports: [
        Checker1Component, 
        ReactiveFormsModule, 
        AgGridModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: Checker1Service, useValue: mockService }
      ],
      // NO_ERRORS_SCHEMA helps ignore Citi-specific custom elements if they aren't imported
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;

    // 2. Mock Ag-Grid API to prevent crashes on grid initialization
    component.gridApi = {
      sizeColumnsToFit: jest.fn(),
      setRowData: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([])
    } as any;

    fixture.detectChanges(); // Triggers ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filterForm with default values', () => {
    expect(component.filterForm).toBeDefined();
    expect(component.filterForm.get('status')).toBeTruthy();
  });

  it('should load data onSearch', () => {
    component.onSearch();
    expect(mockService.getCheckerData).toHaveBeenCalled();
    expect(component.rowData.length).toBeGreaterThan(0);
  });

  it('should handle grid ready event', () => {
    const mockParams = { api: component.gridApi };
    component.onGridReady(mockParams as any);
    expect(component.gridApi).toBeDefined();
  });
});