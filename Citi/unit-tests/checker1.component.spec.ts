import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from 'src/app/shared/services/checker1.service';
import { PaymentRecord } from 'src/app/shared/models/payment-record.model';
import { GridReadyEvent, CellDoubleClickedEvent, ValueFormatterParams, ICellRendererParams, RowSelectedEvent } from 'ag-grid-community';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let dataServiceSpy: jasmine.SpyObj<Checker1Service>;

  beforeEach(async(() => {
    dataServiceSpy = jasmine.createSpyObj('Checker1Service', ['getData', 'updateRow', 'getCurrencies']);

    TestBed.configureTestingModule({
      declarations: [Checker1Component],
      imports: [
        AgGridModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [{ provide: Checker1Service, useValue: dataServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms and load currencies in ngOnInit', () => {
    const mockCurrencies = ['USD', 'EUR'];
    dataServiceSpy.getCurrencies.and.returnValue(of(mockCurrencies));

    component.ngOnInit();

    expect(component.filterForm).toBeDefined();
    expect(component.editForm).toBeDefined();
    expect(component.currencies).toEqual(mockCurrencies);
    expect(dataServiceSpy.getCurrencies).toHaveBeenCalled();
  });

  it('should set gridApi and load data in onGridReady', () => {
    spyOn(component, 'loadData');
    const mockParams = { api: { setGridOption: jasmine.createSpy() } } as GridReadyEvent;

    component.onGridReady(mockParams);

    expect(component.gridApi).toBe(mockParams.api);
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should load data and set grid options', fakeAsync(() => {
    const mockData: PaymentRecord[] = [{ id: 1, issueName: 'Test' } as PaymentRecord];
    dataServiceSpy.getData.and.returnValue(of(mockData));
    spyOn(component.gridApi, 'setGridOption');

    component.loadData();
    tick();

    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('loading', true);
    expect(component.totalRecords).toBe(1);
    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('rowData', mockData);
    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  }));

  it('should handle loadData error', fakeAsync(() => {
    dataServiceSpy.getData.and.returnValue(throwError('Error'));
    spyOn(component.gridApi, 'setGridOption');

    component.loadData();
    tick();

    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('loading', false);
  }));

  it('should apply quick filter in applyFilters', () => {
    component.gridApi = { setGridOption: jasmine.createSpy() } as any;
    const mockValues = { search: 'test' };

    component.applyFilters(mockValues);

    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('quickFilterText', 'test');
  });

  it('should apply currency filter model in applyFilters', () => {
    component.gridApi = { setFilterModel: jasmine.createSpy() } as any;
    const mockValues = { currencyFilter: 'USD' };

    component.applyFilters(mockValues);

    expect(component.gridApi.setFilterModel).toHaveBeenCalledWith(jasmine.objectContaining({
      paymentAmountCurrency: jasmine.objectContaining({ values: 'USD' })
    }));
  });

  it('should apply date filter model in applyFilters', () => {
    component.gridApi = { setFilterModel: jasmine.createSpy() } as any;
    const mockValues = { dateFilter: '2024-01-01' };

    component.applyFilters(mockValues);

    expect(component.gridApi.setFilterModel).toHaveBeenCalledWith(jasmine.objectContaining({
      eventValueDate: jasmine.objectContaining({ dateFrom: '2024-01-01' })
    }));
  });

  it('should create edit button in actionCellRenderer', () => {
    const mockParams = { data: { id: 1 } };
    spyOn(component, 'openEditModal');

    const button = component.actionCellRenderer(mockParams);

    expect(button.tagName).toBe('BUTTON');
    expect(button.innerText).toBe('Edit');
    button.click();
    expect(component.openEditModal).toHaveBeenCalledWith(mockParams.data);
  });

  it('should return colored circle in circleRenderer', () => {
    const redSpan = component.circleRenderer('#28a745');
    expect(redSpan.style.backgroundColor).toBe('#28a745');

    const blueSpan = component.circleRenderer('#dc3545');
    expect(blueSpan.style.backgroundColor).toBe('#dc3545');

    const emptySpan = component.circleRenderer(null);
    expect(emptySpan).toBeUndefined();
  });

  it('should set selectedRow on selection changed', () => {
    const mockSelected = [{ id: 1 }];
    component.gridApi = { getSelectedRows: () => mockSelected } as any;

    component.onSelectionChanged();

    expect(component.selectedRow).toEqual(mockSelected[0]);
  });

  it('should patch editForm and show modal in openEditModal', () => {
    const mockData: PaymentRecord = { id: 1, ddaAccount: '123', accountNumber: '456', paymentAmount: 100, statusChoice1: true, statusChoice2: false } as PaymentRecord;

    component.openEditModal(mockData);

    expect(component.editForm.value).toEqual(jasmine.objectContaining({ id: 1, ddaAccount: '123' }));
    expect(component.isModalVisible).toBeTrue();
  });

  it('should save edit and show success notification', fakeAsync(() => {
    component.editForm.setValue({ id: 1, ddaAccount: '123' });
    dataServiceSpy.updateRow.and.returnValue(of({}));
    spyOn(component, 'showNotification');
    spyOn(component, 'loadData');

    component.saveEdit();
    tick();

    expect(dataServiceSpy.updateRow).toHaveBeenCalled();
    expect(component.showNotification).toHaveBeenCalledWith('Record Updated Successfully!', 'success');
    expect(component.loadData).toHaveBeenCalled();
    expect(component.isSaving).toBeFalse();
  }));

  it('should handle saveEdit error and show error notification', fakeAsync(() => {
    component.editForm.setValue({ id: 1, ddaAccount: '123' });
    dataServiceSpy.updateRow.and.returnValue(throwError('Error'));
    spyOn(component, 'showNotification');

    component.saveEdit();
    tick();

    expect(component.showNotification).toHaveBeenCalledWith('Save Failed', 'error');
    expect(component.isSaving).toBeFalse();
  }));

  it('should not save if form invalid or saving', () => {
    component.editForm.markAsInvalid();  // Simulate invalid
    component.isSaving = true;

    component.saveEdit();

    expect(dataServiceSpy.updateRow).not.toHaveBeenCalled();
  });

  it('should show notification and hide after timeout', fakeAsync(() => {
    component.showNotification('Test Msg', 'success');

    expect(component.notificationMessage).toBe('Test Msg');
    expect(component.toastType).toBe('success');
    expect(component.isNotificationVisible).toBeTrue();

    tick(3000);
    expect(component.isNotificationVisible).toBeFalse();
  }));

  it('should reset filters', () => {
    spyOn(component.filterForm, 'reset');

    component.resetFilters();

    expect(component.filterForm.reset).toHaveBeenCalledWith({
      currencyFilter: 'ALL',
      dateFilter: null,
      search: '',
    });
  });

  it('should complete destroy$ in ngOnDestroy', () => {
    spyOn(component.destroy$, 'next');
    spyOn(component.destroy$, 'complete');

    component.ngOnDestroy();

    expect(component.destroy$.next).toHaveBeenCalled();
    expect(component.destroy$.complete).toHaveBeenCalled();
  });
});