import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';  // If dataService uses Http
import { Checker1Component } from './checker1.component';
import { DataService } from 'your-data-service-path';  // Import your service

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Checker1Component],
      imports: [AgGridModule, HttpClientTestingModule],
      providers: [DataService],
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data and set rowData on gridApi', () => {
    const mockData = [{ id: 1, issueName: 'Test' }];  // Mock your data shape
    spyOn(dataService, 'getData').and.returnValue(of(mockData));  // Use RxJS of for observable

    component.loadData();
    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('rowData', mockData);
    expect(component.totalRecords).toBe(1);
    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  });

  it('should open modal on double click for data columns', () => {
    const mockEvent = {
      column: { getColId: () => component.columnDefs[1].field },  // Simulate data col
      data: { id: 1 },
    };
    component.onCellDoubleClicked(mockEvent);
    expect(component.selectedRow).toEqual({ id: 1 });
    expect(component.showModal).toBeTrue();
  });

  it('should not open modal on double click for non-data columns', () => {
    const mockEvent = {
      column: { getColId: () => 'id' },  // Checkbox col
      data: { id: 1 },
    };
    component.onCellDoubleClicked(mockEvent);
    expect(component.showModal).toBeFalse();
  });

  it('should close modal and reset selectedRow', () => {
    component.showModal = true;
    component.selectedRow = { id: 1 };
    component.closeModal();
    expect(component.showModal).toBeFalse();
    expect(component.selectedRow).toBeNull();
  });

  // Add more for renderers/formatters if needed, e.g., spy on circleRenderer
});