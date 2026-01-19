import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';
import { PaymentDetailsFormComponent } from '../payment-details-form/payment-details-form.component';
import { CreditDetailsFormComponent } from '../credit-details-form/credit-details-form.component';
import { PaymentSummary } from '../payment-summary/payment-summary.component';  // Adjust if needed
import { PaymentDenominationGridComponent } from '../payment-denomination-grid/payment-denomination-grid.component';
import { TaxDetailsRow } from '../tax-details/tax-details.component';
import { TabComponent } from 'src/app/shared/components/tab/tab.component';  // Adjust path

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputComponent, PaymentDetailsFormComponent, CreditDetailsFormComponent, PaymentSummary, PaymentDenominationGridComponent, TaxDetailsRow, TabComponent],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs and activeTabKey', () => {
    expect(component.tabs).toBeDefined();
    expect(component.tabs.length).toBeGreaterThan(0);
    expect(component.activeTabKey).toBe('input');
  });

  it('should change tab on onTabChange', () => {
    component.onTabChange('authorize');
    expect(component.activeTabKey).toBe('authorize');
  });

  it('should add new denomination row on onAddDenominationRow', () => {
    const initialLength = component.denominationData.length;
    component.onAddDenominationRow();
    expect(component.denominationData.length).toBe(initialLength + 1);
    expect(component.denominationData[initialLength].currentDenom).toBe('');
  });

  it('should remove denomination row on onRemoveDenominationRow if index valid', () => {
    component.denominationData = [{ currentDenom: '100', noOfPieces: 1, ratePerPiece: 1, subTotalExclCcy: 100 }];
    const initialLength = component.denominationData.length;
    component.onRemoveDenominationRow(0);
    expect(component.denominationData.length).toBe(initialLength - 1);
  });

  it('should not remove if index invalid or last row', () => {
    component.denominationData = [{ currentDenom: '100' }];
    component.onRemoveDenominationRow(-1);  // Invalid
    expect(component.denominationData.length).toBe(1);
    component.onRemoveDenominationRow(0);  // Last row
    expect(component.denominationData.length).toBe(1);
  });

  it('should update validity on onPaymentFormValidityChange', () => {
    component.onPaymentFormValidityChange(true);
    expect(component.isPaymentFormValid).toBeTrue();

    component.onPaymentFormValidityChange(false);
    expect(component.isPaymentFormValid).toBeFalse();
  });

  it('should update validity on onCreditDetailsFormValidityChange', () => {
    component.onCreditDetailsFormValidityChange(true);
    expect(component.isCreditDetailsFormValid).toBeTrue();

    component.onCreditDetailsFormValidityChange(false);
    expect(component.isCreditDetailsFormValid).toBeFalse();
  });

  it('should log on onSavePayment', () => {
    spyOn(console, 'log');
    component.onSavePayment();
    expect(console.log).toHaveBeenCalledWith('Saving payment data...');
  });

  it('should submit if both forms valid on onSubmitPayment', () => {
    component.isPaymentFormValid = true;
    component.isCreditDetailsFormValid = true;
    spyOn(console, 'log');
    spyOn(window, 'alert');

    const result = component.onSubmitPayment();
    expect(result).toBeTrue();
    expect(console.log).toHaveBeenCalledWith('Payment and credit details forms ready to be submitted...');
    expect(window.alert).toHaveBeenCalledWith('Payment and credit details forms ready to be submitted...');
  });

  it('should not submit if forms invalid on onSubmitPayment', () => {
    component.isPaymentFormValid = false;
    component.isCreditDetailsFormValid = false;
    spyOn(console, 'log');

    const result = component.onSubmitPayment();
    expect(result).toBeFalse();
    expect(console.log).toHaveBeenCalledWith('Form is invalid. Please fill all mandatory fields.');
  });
});