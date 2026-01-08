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
    const currencies = ['USD', 'CAD', 'EUR', 'GBP'];
    const data: GridRowData[] = Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      ddaAccount: `DDA-7700${i}`,
      accountNumber: `4455-00${i}`,
      eventValueDate: new Date(2026, 0, i + 1),
      paymentDate: new Date(),
      paymentAmountCurrency: currencies[i % currencies.length],
      paymentAmount: 1500 * (i + 1),
      statusChoice1: i % 2 === 0,
      statusChoice2: i % 3 === 0,
      dolNo: `DOL-X-${i}`,
      eventBalance: 50000,
      netPaymentAmount: 1450 * (i + 1),
      realTimeBalance: 60000,
      usdAmount: 1500 * (i + 1),
      issueName: `Standard Settlement ${i}`,
      authorized: false
    }));
    return of(data).pipe(delay(600));
  }

  getCurrencies(): Observable<string[]> {
    return of(['USD', 'CAD', 'EUR', 'GBP', 'JPY']).pipe(delay(300));
  }
}






// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { delay } from 'rxjs/operators';

// export interface GridRowData {
//   id: number;
//   ddaAccount: string;
//   accountNumber: string;
//   eventValueDate: Date;
//   paymentDate: Date;
//   paymentAmountCurrency: string;
//   paymentAmount: number;
//   statusChoice1: boolean;
//   statusChoice2: boolean;
//   dolNo: string;
//   eventBalance: number;
//   netPaymentAmount: number;
//   realTimeBalance: number;
//   usdAmount: number;
//   issueName: string;
//   authorized?: boolean;
// }

// @Injectable({ providedIn: 'root' })
// export class Checker2Service {
//   getCheckerData(): Observable<GridRowData[]> {
//     const data: GridRowData[] = Array.from({ length: 10 }).map((_, i) => ({
//       id: i + 1,
//       ddaAccount: `DDA-00${i}`,
//       accountNumber: `ACC-7788${i}`,
//       eventValueDate: new Date(),
//       paymentDate: new Date(),
//       paymentAmountCurrency: 'USD',
//       paymentAmount: 5000 + (i * 100),
//       statusChoice1: i % 2 === 0,
//       statusChoice2: i % 3 === 0,
//       dolNo: `DOL-99${i}`,
//       eventBalance: 20000,
//       netPaymentAmount: 4800,
//       realTimeBalance: 15000,
//       usdAmount: 5000,
//       issueName: `Corporate Action ${i}`,
//       authorized: false
//     }));
//     return of(data).pipe(delay(500));
//   }
// }