import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchLegalHoldComponent } from './search-legal-hold.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('SearchLegalHoldComponent', () => {
  let component: SearchLegalHoldComponent;
  let fixture: ComponentFixture<SearchLegalHoldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Component is standalone, so we import it directly
      imports: [
        SearchLegalHoldComponent,
        ReactiveFormsModule,
        NoopAnimationsModule // Prevents Material animation delays in tests
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchLegalHoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with status set to "Active"', () => {
    const statusValue = component.searchForm.get('status')?.value;
    expect(statusValue).toBe('Active');
  });

  it('should be invalid when Legal Hold Name is empty', () => {
    const holdNameControl = component.searchForm.get('holdName');
    holdNameControl?.setValue('');
    expect(component.searchForm.valid).toBeFalsy();
    expect(holdNameControl?.hasError('required')).toBeTruthy();
  });

  it('should be valid when Legal Hold Name is provided', () => {
    component.searchForm.get('holdName')?.setValue('Project Aurora');
    expect(component.searchForm.valid).toBeTruthy();
  });

  it('should emit searchTriggered with searchType "LEGAL_HOLD" on valid submission', () => {
    spyOn(component.searchTriggered, 'emit');
    
    const testCriteria = {
      holdName: 'Compliance Review 2024',
      holdId: 'LH-5542',
      status: 'Active',
      dateInitiated: ''
    };

    component.searchForm.setValue(testCriteria);
    component.onSearch();

    expect(component.searchTriggered.emit).toHaveBeenCalledWith({
      ...testCriteria,
      searchType: 'LEGAL_HOLD'
    });
  });

  it('should disable the SEARCH button when form is invalid', async () => {
    component.searchForm.get('holdName')?.setValue('');
    fixture.detectChanges();
    await fixture.whenStable();

    const searchBtn = fixture.debugElement.query(By.css('.search-pill-btn')).nativeElement;
    expect(searchBtn.disabled).toBeTruthy();
  });

  it('should reset the form and status to "Active" when onClear is called', () => {
    spyOn(component.clearTriggered, 'emit');
    
    // Set non-default values
    component.searchForm.patchValue({
      holdName: 'Temporary Hold',
      status: 'Released'
    });

    component.onClear();

    expect(component.searchForm.get('holdName')?.value).toBeNull();
    expect(component.searchForm.get('status')?.value).toBe('Active');
    expect(component.clearTriggered.emit).toHaveBeenCalled();
  });
});