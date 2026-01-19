import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentDetailsFormComponent } from './payment-details-form.component';

describe('PaymentDetailsFormComponent', () => {
  let component: PaymentDetailsFormComponent;
  let fixture: ComponentFixture<PaymentDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentDetailsFormComponent],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.paymentForm.value).toEqual(jasmine.objectContaining({ amount: null }));  // Adjust fields
  });

  it('should submit valid form', () => {
    component.paymentForm.setValue({ amount: 50, currency: 'USD' });
    spyOn(component.save, 'emit');

    component.submitForm();
    expect(component.save.emit).toHaveBeenCalled();
  });
});