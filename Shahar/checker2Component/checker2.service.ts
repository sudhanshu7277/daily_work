import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface IssueRecord {
  id: number;
  issueName: string;
  dda: string;
  account: string;
  createdDate: Date;
  currency: string;
  amount: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class Checker1Service {
  getIssueRecords(): Observable<IssueRecord[]> {
    const mockData: IssueRecord[] = [
      { id: 1, issueName: 'Settlement Ref #1001', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 0, 1), currency: 'USD', amount: 1500, status: 'Open' },
      { id: 2, issueName: 'Settlement Ref #1001', dda: 'DDA-77001', account: '4455-001', createdDate: new Date(2026, 0, 6), currency: 'CAD', amount: 3000, status: 'Open' },
      { id: 3, issueName: 'Settlement Ref #1002', dda: 'DDA-77002', account: '4455-002', createdDate: new Date(2026, 0, 6), currency: 'EUR', amount: 4500, status: 'Open' }
    ];
    return of(mockData);
  }
}