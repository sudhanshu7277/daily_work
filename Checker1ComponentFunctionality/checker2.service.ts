import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface GridRowData {
  id: number;
  ddaAccount: string;
  accountNumber: string;
  eventValueDate: Date;
  paymentDate: Date;
  paymentAmountCurrency: string;
  paymentAmount: number;
  statusChoice1: boolean;
  statusChoice2: boolean;
  dolNo: string;
  eventBalance: number;
  netPaymentAmount: number;
  realTimeBalance: number;
  usdAmount: number;
  issueName: string;
  authorized?: boolean;
}

@Injectable({ providedIn: 'root' })
export class Checker2Service {
  getCheckerData(): Observable<GridRowData[]> {
    const data: GridRowData[] = Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      ddaAccount: `DDA-00${i}`,
      accountNumber: `ACC-7788${i}`,
      eventValueDate: new Date(),
      paymentDate: new Date(),
      paymentAmountCurrency: 'USD',
      paymentAmount: 5000 + (i * 100),
      statusChoice1: i % 2 === 0,
      statusChoice2: i % 3 === 0,
      dolNo: `DOL-99${i}`,
      eventBalance: 20000,
      netPaymentAmount: 4800,
      realTimeBalance: 15000,
      usdAmount: 5000,
      issueName: `Corporate Action ${i}`,
      authorized: false
    }));
    return of(data).pipe(delay(500));
  }
}