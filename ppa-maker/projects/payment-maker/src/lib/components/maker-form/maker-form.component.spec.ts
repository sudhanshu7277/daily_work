// maker-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MakerFormComponent } from './maker-form.component';
import { PaymentComponentInput } from '../../models/pain001.model';

const mockInput: PaymentComponentInput = {
  applicationName:   'ADR',
  applicationModule: 'ADR',
  region:            'US',
  makerSubmitUrl:    '/api/v1/pain001/maker/submit'
};

describe('MakerFormComponent', () => {
  let component: MakerFormComponent;
  let fixture: ComponentFixture<MakerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakerFormComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MakerFormComponent);
    component = fixture.componentInstance;
    component.paymentInput = mockInput;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('submit button should be disabled when form is invalid', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.pm-btn-submit');
    expect(btn.disabled).toBe(true);
  });

  it('isFormValid should be false with empty required fields', () => {
    expect(component.isFormValid).toBe(false);
  });

  it('isFormValid should be true after all required fields filled', () => {
    component.form.patchValue({
      requestedExecutionDate:              '2025-04-15',
      debtorName:                          'Test Debtor',
      debtorAccountNumber:                 'ACC-001',
      debtorAgentBIC:                      'CITIUS33XXX',
      instructedAmount:                    5000,
      instructedAmountCurrencyCode:        'USD',
      creditorName:                        'Test Creditor',
      creditorAccount:                     'CRED-ACC-001',
      creditorAgentFinancialInstitutionBIC:  'CHASUS33XXX',
      creditorAgentFinancialInstitutionName: 'JPMorgan Chase',
      creditorAgentAccountNumber:           'CRED-AGT-001',
      painPaymentMethodType:               'CBT'
    });
    expect(component.isFormValid).toBe(true);
  });

  it('isInvalid should return true for touched invalid field', () => {
    component.form.get('debtorName')?.markAsTouched();
    expect(component.isInvalid('debtorName')).toBe(true);
  });

  it('getError should return required message', () => {
    expect(component.getError('debtorName')).toBe('This field is required');
  });
});
