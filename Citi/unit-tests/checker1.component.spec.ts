import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from 'src/app/shared/services/checker1.service';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockChecker1Service: any;

  beforeEach(async () => {
    // 1. Create a detailed mock of your service
    mockChecker1Service = {
      getCheckerData: jest.fn().mockReturnValue(of([])),
      saveCheckerData: jest.fn().mockReturnValue(of({ status: 'success' })),
      // Add other service methods used in your TS here
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component,       // Standalone components go in imports
        ReactiveFormsModule,
        AgGridModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: Checker1Service, useValue: mockChecker1Service }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Prevents crashes from custom CSS/UI tags
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    
    // 2. Mocking the Ag-Grid API objects to prevent undefined errors
    component.gridApi = {
      setRowData: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([])
    } as any;

    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filterForm and editForm on load', () => {
    expect(component.filterForm).toBeDefined();
    expect(component.editForm).toBeDefined();
    expect(component.filterForm.contains('status')).toBeTruthy();
  });

  it('should call getCheckerData on search', () => {
    component.onSearch();
    expect(mockChecker1Service.getCheckerData).toHaveBeenCalled();
  });

  it('should update grid when search returns data', () => {
    const mockData = [{ id: 1, name: 'Test Item' }];
    mockChecker1Service.getCheckerData.mockReturnValue(of(mockData));
    
    component.onSearch();
    
    expect(component.rowData).toEqual(mockData);
  });
});