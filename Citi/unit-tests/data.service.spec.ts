import { TestBed } from '@angular/core/testing';
import { DataService, GridRowData } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mock data', (done) => {
    service.getData().subscribe(data => {
      expect(data.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should update a row successfully', (done) => {
    const updatedRecord: GridRowData = {
      id: 1,
      ddaAccount: 'NEW-DDA',
      accountNumber: '123',
      eventValueDate: new Date(),
      paymentAmountCurrency: 'USD',
      paymentAmount: 500,
      statusChoice1: true,
      statusChoice2: true,
      issueName: 'Updated'
    };

    service.updateRow(updatedRecord).subscribe(result => {
      expect(result.ddaAccount).toBe('NEW-DDA');
      done();
    });
  });
});