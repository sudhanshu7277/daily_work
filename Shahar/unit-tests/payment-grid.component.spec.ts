import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentGridComponent } from './payment-grid.component';
import { AgGridModule } from 'ag-grid-angular';

describe('PaymentGridComponent', () => {
  let component: PaymentGridComponent;
  let fixture: ComponentFixture<PaymentGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone components must be in imports
      imports: [
        PaymentGridComponent,
        AgGridModule
      ]
    }).compileComponents(); // Resolves templateUrl and styleUrls

    fixture = TestBed.createComponent(PaymentGridComponent);
    component = fixture.componentInstance;
    
    // Set mandatory inputs before first change detection
    component.columnDefs = [
      { field: 'id', headerName: 'ID' },
      { field: 'amount', headerName: 'Amount' }
    ];
    component.rowData = [{ id: 1, amount: 100 }];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize grid api onGridReady', () => {
    const mockApi = { sizeColumnsToFit: jest.fn() };
    const params = { api: mockApi };
    
    component.onGridReady(params as any);
    
    expect(component.gridApi).toBeDefined();
    expect(mockApi.sizeColumnsToFit).toHaveBeenCalled();
  });

  it('should open modal when a cell is double clicked', () => {
    const mockEvent = {
      column: { getColId: () => 'id' },
      data: { id: 1, amount: 100 }
    };
    
    // Initial state
    expect(component.showModal).toBe(false);
    
    // Trigger double click logic
    component.onCellDoubleClicked(mockEvent as any);
    
    expect(component.showModal).toBe(true);
    expect(component.selectedRow).toEqual(mockEvent.data);
  });

  it('should close modal and reset selected row', () => {
    component.showModal = true;
    component.selectedRow = { id: 1 };
    
    component.closeModal();
    
    expect(component.showModal).toBe(false);
    expect(component.selectedRow).toBeNull();
  });
});