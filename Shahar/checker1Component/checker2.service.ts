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
export class Checker2Service {
  getIssueRecords(): Observable<IssueRecord[]> {
    const mockData: IssueRecord[] = [
      { id: 101, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 102, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 103, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 104, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 105, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 106, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 107, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 108, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 109, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 110, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 111, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 112, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 113, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 114, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 115, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 116, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 117, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 118, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 119, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 120, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 121, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 122, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 123, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 124, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 125, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 126, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 127, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 128, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 129, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 130, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 131, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 132, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 133, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 134, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 135, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 136, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' },
      { id: 137, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 550987979.00, status: 'Pending' },
      { id: 138, issueName: 'Fixed Income Audit', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 7, 22), currency: 'GBP', amount: 1200.00, status: 'Open' },
      { id: 139, issueName: 'Oversight Reporting', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2026, 1, 5), currency: 'EUR', amount: 89000.00, status: 'Approved' },
      { id: 140, issueName: 'Equity Settlement', dda: 'DDA-77000', account: '4455-000', createdDate: new Date(2025, 5, 12), currency: 'USD', amount: 55000.50, status: 'Open' }
    ];
    return of(mockData);
  }
}