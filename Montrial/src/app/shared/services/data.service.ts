import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

export interface LegalHoldRecord {
  legalName: string;
  ocifId: string;
  status: string;
  holdName: string;
  lifecycle: string;
  role: string;
  address: string;
  customerStatus: string;
  roleType: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private mockData: LegalHoldRecord[] = [
    { 
      legalName: 'Jane Doe', 
      ocifId: '1000-12345', 
      status: 'LEGAL HOLD', 
      holdName: 'Legal Hold Re Placeholder', 
      lifecycle: 'Active Customer', 
      role: 'Owner', 
      address: '33 Dundas St W, Toronto, ON M5G 2C3',
      customerStatus: 'Active',
      roleType: 'Primary'
    },
    ...Array(9).fill(null).map((_, i) => ({
      legalName: i % 2 === 0 ? 'Jane Doe' : 'John Smith',
      ocifId: `1000-5432${i}`,
      status: 'LEGAL HOLD',
      holdName: 'Legal Hold Re Placeholder',
      lifecycle: 'Active Customer',
      role: 'Owner',
      address: '33 Dundas St W, Toronto, ON M5G 2C3',
      customerStatus: 'Active',
      roleType: 'Primary'
    }))
  ];

  /**
   * Filter records based on criteria
   * Matches both First Name and Last Name inside the 'legalName' string
   */
  getLegalHoldRecords(criteria?: any): Observable<LegalHoldRecord[]> {
    return of(this.mockData).pipe(
      delay(500),
      map(data => {
        if (!criteria) return data;

        const firstName = (criteria.firstName || '').toLowerCase();
        const lastName = (criteria.lastName || '').toLowerCase();

        return data.filter(item => {
          const fullName = item.legalName.toLowerCase();
          // Logic: Full name must contain both the first name AND last name provided
          return fullName.includes(firstName) && fullName.includes(lastName);
        });
      })
    );
  }
}