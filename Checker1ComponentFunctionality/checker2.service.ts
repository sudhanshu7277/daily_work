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
export class DataService {
  private masterData: GridRowData[] = Array.from({ length: 1000 }).map((_, i) => ({
    id: i + 1,
    ddaAccount: `DDA-7700${i}`,
    accountNumber: `4455-00${i}`,
    eventValueDate: new Date(2026, 0, (i % 28) + 1),
    paymentDate: new Date(),
    paymentAmountCurrency: ['USD', 'CAD', 'EUR', 'GBP'][i % 4],
    paymentAmount: 5000 + (i * 100),
    statusChoice1: i % 2 === 0,
    statusChoice2: i % 5 !== 0,
    dolNo: `DOL-XN-${1000 + i}`,
    eventBalance: 250000,
    netPaymentAmount: 4800 + i,
    realTimeBalance: 300000,
    usdAmount: 5000 + i,
    issueName: `Corporate Action ${i}`,
    authorized: false
  }));

  getRows(startRow: number, endRow: number, filters: any, sortModel: any): Observable<{rows: GridRowData[], total: number}> {
    let data = [...this.masterData];

    // Server-side Filtering
    if (filters.currency && filters.currency !== 'ALL') {
      data = data.filter(r => r.paymentAmountCurrency === filters.currency);
    }
    if (filters.date) {
      const targetDate = new Date(filters.date).toDateString();
      data = data.filter(r => new Date(r.eventValueDate).toDateString() === targetDate);
    }

    // Server-side Sorting
    if (sortModel.length > 0) {
      const { colId, sort } = sortModel[0];
      data.sort((a: any, b: any) => {
        const valA = a[colId];
        const valB = b[colId];
        if (valA === valB) return 0;
        const result = valA > valB ? 1 : -1;
        return sort === 'asc' ? result : -result;
      });
    }

    return of({ rows: data.slice(startRow, endRow), total: data.length }).pipe(delay(400));
  }

  getCurrencies(): Observable<string[]> {
    return of(['USD', 'CAD', 'EUR', 'GBP', 'JPY']);
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
//     const currencies = ['USD', 'CAD', 'EUR', 'GBP'];
//     const data: GridRowData[] = Array.from({ length: 10 }).map((_, i) => ({
//       id: i + 1,
//       ddaAccount: `DDA-7700${i}`,
//       accountNumber: `4455-00${i}`,
//       eventValueDate: new Date(2026, 0, i + 1),
//       paymentDate: new Date(),
//       paymentAmountCurrency: currencies[i % currencies.length],
//       paymentAmount: 1500 * (i + 1),
//       statusChoice1: i % 2 === 0,
//       statusChoice2: i % 3 === 0,
//       dolNo: `DOL-X-${i}`,
//       eventBalance: 50000,
//       netPaymentAmount: 1450 * (i + 1),
//       realTimeBalance: 60000,
//       usdAmount: 1500 * (i + 1),
//       issueName: `Standard Settlement ${i}`,
//       authorized: false
//     }));
//     return of(data).pipe(delay(600));
//   }

//   getCurrencies(): Observable<string[]> {
//     return of(['USD', 'CAD', 'EUR', 'GBP', 'JPY']).pipe(delay(300));
//   }
// }
