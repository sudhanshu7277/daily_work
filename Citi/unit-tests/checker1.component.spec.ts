import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from 'src/app/shared/services/checker1.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AgGridModule } from 'ag-grid-angular';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockCheckerService: any;

  beforeEach(async () => {
    // Jest mock object replaces jasmine.createSpyObj
    mockCheckerService = {
      getData: jest.fn().mockReturnValue(of([{ id: 1, name: 'Test Record' }])),
      updateRow: jest.fn().mockReturnValue(of({ success: true })),
      getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR']))
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component, // Standalone component goes in imports
        AgGridModule
      ],
      providers: [
        { provide: Checker1Service, useValue: mockCheckerService },
        provideHttpClient(),        // Functional provider for standalone
        provideHttpClientTesting()  // Functional provider for testing
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial data', () => {
    expect(component).toBeTruthy();
    expect(mockCheckerService.getData).toHaveBeenCalled();
  });

  it('should cover onGridReady and set row data', () => {
    const mockGridApi = { setRowData: jest.fn() };
    const mockParams = { api: mockGridApi };
    
    component.onGridReady(mockParams as any);
    
    expect(mockCheckerService.getData).toHaveBeenCalled();
    // Ensures the data from service is passed to the grid
    expect(mockGridApi.setRowData).toHaveBeenCalled();
  });

  it('should handle error when getData fails', () => {
    // This covers the error branch in your component logic
    mockCheckerService.getData.mockReturnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.rowData).toEqual([]); // Assuming you reset on error
  });

  it('should call updateRow when a cell value changes', () => {
    const mockEvent = { data: { id: 1 }, newValue: 'New Val' };
    
    component.onCellValueChanged(mockEvent as any);
    
    expect(mockCheckerService.updateRow).toHaveBeenCalledWith(mockEvent.data);
  });
});