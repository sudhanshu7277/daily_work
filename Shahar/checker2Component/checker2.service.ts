import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface IssueRecord {
  id: number;
  issueName: string;
  amount: number;
  currency: string; // USD, CAD, JPY, GBP
  createdDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Open';
}

@Injectable({ providedIn: 'root' })
export class Checker2Service {
  private dummyData: IssueRecord[] = [
    { id: 101, issueName: 'Equity Settlement', amount: 55000.50, currency: 'USD', createdDate: new Date(2025, 5, 12), status: 'Pending' },
    { id: 102, issueName: 'Fixed Income Audit', amount: 1200.00, currency: 'GBP', createdDate: new Date(2025, 7, 22), status: 'Open' },
    { id: 103, issueName: 'Oversight Reporting', amount: 89000.00, currency: 'EUR', createdDate: new Date(2026, 1, 5), status: 'Approved' }
  ];

  getIssueRecords(): Observable<IssueRecord[]> {
    return of(this.dummyData).pipe(delay(500));
  }

  updateRecord(record: IssueRecord): Observable<boolean> {
    console.log('API Call: Updating record', record);
    return of(true).pipe(delay(300));
  }
}