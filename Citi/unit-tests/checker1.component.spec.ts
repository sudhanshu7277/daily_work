import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { checker1Component } from './checker1.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { DataService } from './data.service';
import { of } from 'rxjs';

describe('checker1Component', () => {
  let component: checker1Component;
  let fixture: ComponentFixture<checker1Component>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DataService', ['getData', 'getCurrencies', 'updateRow']);
    spy.getData.and.returnValue(of([]));
    spy.getCurrencies.and.returnValue(of(['USD', 'EUR']));

    await TestBed.configureTestingModule({
      imports: [checker1Component, ReactiveFormsModule, AgGridModule],
      providers: [{ provide: DataService, useValue: spy }]
    }).compileComponents();

    dataServiceSpy = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    fixture = TestBed.createComponent(checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial data', () => {
    expect(component).toBeTruthy();
    expect(dataServiceSpy.getData).toHaveBeenCalled();
  });

  it('should filter grid when search value changes', fakeAsync(() => {
    // Setup grid API mock if not already present
    component.gridApi = jasmine.createSpyObj('GridApi', ['setGridOption', 'setFilterModel', 'showLoadingOverlay', 'hideOverlay']);
    
    component.filterForm.patchValue({ search: 'test' });
    tick(300); // Wait for debounceTime
    
    expect(component.gridApi.setGridOption).toHaveBeenCalledWith('quickFilterText', 'test');
  }));

  it('should open edit modal and patch form values', () => {
    const mockRow = { id: 1, issueName: 'Test Issue' } as any;
    component.openEditModal(mockRow);
    
    expect(component.isModalVisible).toBeTrue();
    expect(component.editForm.value.issueName).toBe('Test Issue');
  });

  it('should call updateRow when saveEdit is triggered', () => {
    dataServiceSpy.updateRow.and.returnValue(of({} as any));
    component.editForm.patchValue({ id: 1, ddaAccount: 'abc', accountNumber: '123', paymentAmount: 100, issueName: 'test' });
    
    component.saveEdit();
    
    expect(dataServiceSpy.updateRow).toHaveBeenCalled();
    expect(component.isSaving).toBeFalse();
  });
});