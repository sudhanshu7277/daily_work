import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchCustomerComponent } from './search-customer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchCustomerComponent', () => {
  let component: SearchCustomerComponent;
  let fixture: ComponentFixture<SearchCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCustomerComponent, ReactiveFormsModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when required fields are empty', () => {
    expect(component.searchForm.valid).toBeFalsy();
  });

  it('should emit searchTriggered when form is valid and onSearch is called', () => {
    spyOn(component.searchTriggered, 'emit');
    component.searchForm.patchValue({
      firstName: 'Jane',
      lastName: 'Doe',
      type: 'individual'
    });
    
    component.onSearch();
    expect(component.searchTriggered.emit).toHaveBeenCalledWith(component.searchForm.value);
  });

  it('should reset form and emit clearTriggered on onClear', () => {
    spyOn(component.clearTriggered, 'emit');
    component.searchForm.patchValue({ firstName: 'Jane' });
    
    component.onClear();
    expect(component.searchForm.get('firstName')?.value).toBeNull();
    expect(component.clearTriggered.emit).toHaveBeenCalled();
  });
});