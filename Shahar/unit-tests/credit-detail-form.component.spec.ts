import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreditDetailFormComponent } from './credit-detail-form.component';

describe('CreditDetailFormComponent', () => {
  let component: CreditDetailFormComponent;
  let fixture: ComponentFixture<CreditDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreditDetailFormComponent],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form on init', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should validate on submit with valid data', () => {
    component.form.setValue({ creditAmount: 100, details: 'Test' });  // Mock fields
    spyOn(component.submitEvent, 'emit');

    component.onSubmit();
    expect(component.form.valid).toBeTrue();
    expect(component.submitEvent.emit).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    spyOn(component.submitEvent, 'emit');

    component.onSubmit();
    expect(component.submitEvent.emit).not.toHaveBeenCalled();
  });
});