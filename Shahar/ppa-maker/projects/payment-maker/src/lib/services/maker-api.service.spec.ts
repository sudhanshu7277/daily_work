// maker-api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MakerApiService } from './maker-api.service';
import { createEmptyPain001, PaymentComponentInput } from '../models/pain001.model';

const mockInput: PaymentComponentInput = {
  applicationName:   'ADR',
  applicationModule: 'ADR',
  region:            'US',
  makerSubmitUrl:    '/api/v1/pain001/maker/submit',
  hardcapCheckUrl:   '/api/v1/pain001/maker/hardcap-check'
};

describe('MakerApiService (Mock Mode)', () => {
  let service: MakerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MakerApiService]
    });
    service = TestBed.inject(MakerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('submitMakerForm should return a mock response with transactionId', (done) => {
    const payload = createEmptyPain001();
    payload.debtorName = 'Test Debtor';
    payload.debtorAccountNumber = 'ACC-001';
    payload.debtorAgentBIC = 'TESTBIC1';
    payload.instructedAmount = 1000;
    payload.instructedAmountCurrencyCode = 'USD';
    payload.creditorName = 'Test Creditor';
    payload.creditorAccount = 'CRED-001';
    payload.creditorAgentFinancialInstitutionBIC = 'CREDBIC1';
    payload.creditorAgentFinancialInstitutionName = 'Test Bank';
    payload.painPaymentMethodType = 'CBT';

    service.submitMakerForm(payload, mockInput).subscribe(res => {
      expect(res.success).toBe(true);
      expect(res.transactionId).toMatch(/^TXN-/);
      expect(res.status).toBe('PENDING_CHECKER');
      expect(res.message).toBeTruthy();
      done();
    });
  });
});
