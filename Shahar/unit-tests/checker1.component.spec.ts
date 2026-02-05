import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from '@ag-grid-community/angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// AG Grid Module Imports
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Service and Directive Imports (Update paths based on your structure)
import { Checker1Service } from '../../shared/services/checker1.service';
import { NumbersOnlyDirective } from '../../shared/directives/numbers-only.directive';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeAll(() => {
    // 1. Mandatory Module Registration for tests
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  });

  beforeEach(async () => {
    mockService = {
      getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR'])),
      getCheckerData: jest.fn().mockReturnValue(of([
        { id: 101, issueName: 'Test Issue', status: 'Pending' }
      ]))
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

    // 2. Comprehensive Grid API Mock for v32.3
    component.gridApi = {
      setGridOption: jest.fn(),
      getSelectedRows: jest.fn().mockReturnValue([{ id: 101 }]),
      deselectAll: jest.fn(),
      refreshCells: jest.fn()
    } as any;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should be configured for singleRow selection mode', () => {
    // Asserting the selection object exists and is typed correctly
    expect(typeof component.rowSelection).toBe('object');
    const selection = component.rowSelection as any;
    expect(selection.mode).toBe('singleRow');
    expect(selection.checkboxes).toBe(true);
    // headerCheckbox should not exist for singleRow
    expect(selection.headerCheckbox).toBeUndefined();
  });

  it('should load data on initialization', () => {
    component.onSearch();
    expect(mockService.getCheckerData).toHaveBeenCalled();
    expect(component.rowData.length).toBeGreaterThan(0);
  });

  it('should have pagination enabled', () => {
    // This checks your TS property used in HTML [pagination]="true"
    expect(component.paginationPageSize).toBe(20);
  });

  it('should utilize the Quartz theme class in the template', () => {
    const compiled = fixture.nativeElement;
    const gridElement = compiled.querySelector('ag-grid-angular');
    expect(gridElement.classList).toContain('ag-theme-quartz');
  });
});