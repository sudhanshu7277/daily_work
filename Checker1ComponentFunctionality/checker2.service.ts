import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface GridRowData {
  id: number;
  ddaAccount: string;
  accountNumber: string;
  eventValueDate: Date;
  paymentAmountCurrency: string;
  paymentAmount: number;
  statusChoice1: boolean;
  statusChoice2: boolean;
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
    paymentAmountCurrency: ['USD', 'CAD', 'EUR', 'GBP'][i % 4],
    paymentAmount: 1500 * (i + 1),
    statusChoice1: i % 2 === 0,
    statusChoice2: i % 3 === 0,
    issueName: `Settlement Ref #${1000 + i}`,
    authorized: false
  }));

  getData(): Observable<GridRowData[]> {
    return of([...this.masterData]).pipe(delay(400));
  }

  updateRow(updatedRecord: GridRowData): Observable<GridRowData> {
    const index = this.masterData.findIndex(r => r.id === updatedRecord.id);
    if (index !== -1) {
      this.masterData[index] = { ...this.masterData[index], ...updatedRecord };
      return of(this.masterData[index]).pipe(delay(600)); // Simulate network lag
    }
    return throwError(() => new Error('Record not found'));
  }

  getCurrencies(): Observable<string[]> {
    return of(['USD', 'CAD', 'EUR', 'GBP', 'JPY']);
  }
}
