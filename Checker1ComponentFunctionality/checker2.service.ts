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
  // Generate 1000 records for testing pagination
  private masterData: GridRowData[] = Array.from({ length: 1000 }).map((_, i) => ({
    id: i + 1,
    ddaAccount: `DDA-7700${i}`,
    accountNumber: `4455-00${i}`,
    eventValueDate: new Date(2026, 0, (i % 28) + 1),
    paymentDate: new Date(),
    paymentAmountCurrency: ['USD', 'CAD', 'EUR', 'GBP'][i % 4],
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

  // Server-side call simulation
  getRowsServerSide(startRow: number, endRow: number, filters: any): Observable<{rows: GridRowData[], total: number}> {
    let data = [...this.masterData];

    // 1. Search Logic (SwitchMap target)
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(r => 
        r.issueName.toLowerCase().includes(s) || 
        r.ddaAccount.toLowerCase().includes(s) ||
        r.accountNumber.toLowerCase().includes(s)
      );
    }

    // 2. Filter Logic
    if (filters.dateFilter) {
      const targetDate = new Date(filters.dateFilter).toDateString();
      data = data.filter(r => new Date(r.eventValueDate).toDateString() === targetDate);
    }
    if (filters.currencyFilter && filters.currencyFilter !== 'ALL') {
      data = data.filter(r => r.paymentAmountCurrency === filters.currencyFilter);
    }

    // 3. Slice for Pagination
    const rows = data.slice(startRow, endRow);
    return of({ rows, total: data.length }).pipe(delay(400));
  }

  getCurrencies(): Observable<string[]> {
    return of(['USD', 'CAD', 'EUR', 'GBP', 'JPY']).pipe(delay(300));
  }
}
