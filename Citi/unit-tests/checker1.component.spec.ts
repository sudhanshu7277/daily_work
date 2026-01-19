import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Checker1Component } from './Checker1.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { DataService } from './data.service';
import { of } from 'rxjs';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let dataService: DataService;

  // Mock Grid API
  const mockGridApi = {
    setGridOption: jest.fn(),
    setFilterModel: jest.fn(),
    showLoadingOverlay: jest.fn(),
    hideOverlay: jest.fn(),
    getSelectedRows: jest.fn().mockReturnValue([])
  };

  beforeEach(async () => {
    const dataServiceMock = {
      getData: jest.fn().mockReturnValue(of([])),
      getCurrencies: jest.fn().mockReturnValue(of(['USD', 'EUR'])),
      updateRow: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [Checker1Component, ReactiveFormsModule, AgGridModule],
      providers: [
        { provide: DataService, useValue: dataServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    
    // Manually assign mock gridApi
    component.gridApi = mockGridApi as any;
    
    fixture.detectChanges();
  });

  it('should create and load currencies on init', () => {
    expect(component).toBeTruthy();
    expect(dataService.getCurrencies).toHaveBeenCalled();
  });

  it('should trigger grid filter on search input change', fakeAsync(() => {
    component.filterForm.patchValue({ search: 'DDA-123' });
    tick(300); // match debounceTime
    expect(mockGridApi.setGridOption).toHaveBeenCalledWith('quickFilterText', 'DDA-123');
  }));

  it('should handle "Authorize" logic successfully', () => {
    component.selectedRow = { id: 1, issueName: 'Ref-101' } as any;
    component.onAuthorize();
    
    expect(component.isSaving).toBe(true);
    expect(dataService.updateRow).toHaveBeenCalledWith(
      expect.objectContaining({ authorized: true })
    );
  });

  it('should open the edit modal with row data', () => {
    const rowData = { id: 99, issueName: 'Ref-99' } as any;
    component.openEditModal(rowData);
    
    expect(component.isModalVisible).toBe(true);
    expect(component.editForm.get('issueName')?.value).toBe('Ref-99');
  });

  it('should close modal and refresh grid on saveEdit success', () => {
    component.editForm.patchValue({ id: 1, ddaAccount: 'A', accountNumber: 'B', paymentAmount: 1, issueName: 'C' });
    component.saveEdit();
    
    expect(dataService.updateRow).toHaveBeenCalled();
    expect(component.isModalVisible).toBe(false);
  });
});