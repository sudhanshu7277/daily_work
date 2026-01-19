import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchProductComponent } from './search-product.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchProductComponent', () => {
  let component: SearchProductComponent;
  let fixture: ComponentFixture<SearchProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SearchProductComponent, 
        ReactiveFormsModule, 
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an invalid form', () => {
    expect(component.searchForm.valid).toBeFalsy();
  });

  it('should require accountNumber and productName', () => {
    const accountCtrl = component.searchForm.get('accountNumber');
    const nameCtrl = component.searchForm.get('productName');

    accountCtrl?.setValue('');
    nameCtrl?.setValue('');

    expect(accountCtrl?.hasError('required')).toBeTruthy();
    expect(nameCtrl?.hasError('required')).toBeTruthy();
  });

  it('should validate that accountNumber is numeric only', () => {
    const accountCtrl = component.searchForm.get('accountNumber');
    
    accountCtrl?.setValue('ABC123'); // Invalid alphanumeric
    expect(accountCtrl?.hasError('pattern')).toBeTruthy();

    accountCtrl?.setValue('123456789'); // Valid numeric
    expect(accountCtrl?.hasError('pattern')).toBeFalsy();
  });

  it('should emit searchTriggered with PRODUCT type when form is valid', () => {
    spyOn(component.searchTriggered, 'emit');
    
    const validData = {
      accountNumber: '987654321',
      productName: 'Saving Account',
      productType: 'All',
      branchCode: '001'
    };

    component.searchForm.setValue(validData);
    component.onSearch();

    expect(component.searchTriggered.emit).toHaveBeenCalledWith({
      ...validData,
      searchType: 'PRODUCT'
    });
  });

  it('should reset form values to defaults on onClear', () => {
    spyOn(component.clearTriggered, 'emit');
    
    component.searchForm.patchValue({
      accountNumber: '111',
      productName: 'Test Product'
    });

    component.onClear();

    expect(component.searchForm.get('accountNumber')?.value).toBeNull();
    expect(component.searchForm.get('productType')?.value).toBe('All');
    expect(component.clearTriggered.emit).toHaveBeenCalled();
  });
});