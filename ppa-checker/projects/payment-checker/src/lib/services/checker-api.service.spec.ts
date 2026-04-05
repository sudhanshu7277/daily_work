// checker-api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CheckerApiService } from './checker-api.service';
import { CheckerComponentInput } from '../models/pain001.model';

const mockInput: CheckerComponentInput = {
  applicationName:   'ADR',
  applicationModule: 'ADR',
  region:            'US',
  checkerGetUrl:     '/api/v1/pain001/checker/get',
  checkerActionUrl:  '/api/v1/pain001/checker/action'
};

describe('CheckerApiService (Mock Mode)', () => {
  let service: CheckerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CheckerApiService]
    });
    service = TestBed.inject(CheckerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCheckerData should return mock response with transactionId and formData', (done) => {
    service.getCheckerData(mockInput).subscribe(res => {
      expect(res.transactionId).toMatch(/^TXN-/);
      expect(res.formData).toBeDefined();
      expect(res.formData.debtorName).toBeTruthy();
      expect(res.formData.creditorName).toBeTruthy();
      expect(res.status).toBe('PENDING_CHECKER');
      done();
    });
  });

  it('submitCheckerAction APPROVED should return approved response', (done) => {
    service.getCheckerData(mockInput).subscribe(data => {
      service.submitCheckerAction(
        { transactionId: data.transactionId, action: 'APPROVED', formData: data.formData },
        mockInput
      ).subscribe(res => {
        expect(res.success).toBe(true);
        expect(res.action).toBe('APPROVED');
        expect(res.transactionId).toBe(data.transactionId);
        expect(res.message).toContain('approved');
        done();
      });
    });
  });

  it('submitCheckerAction REJECTED should return rejected response', (done) => {
    service.getCheckerData(mockInput).subscribe(data => {
      service.submitCheckerAction(
        { transactionId: data.transactionId, action: 'REJECTED', formData: data.formData },
        mockInput
      ).subscribe(res => {
        expect(res.success).toBe(true);
        expect(res.action).toBe('REJECTED');
        expect(res.message).toContain('rejected');
        done();
      });
    });
  });
});
