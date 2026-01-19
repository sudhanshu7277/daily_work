import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface LegalHoldRecord {
  legalName: string;
  ocifId: string;
  status: string;
  holdName: string;
  customerStatus: string;
  roleType: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class LegalHoldDataService {
  getSearchResults(): Observable<LegalHoldRecord[]> {
    const mockData: LegalHoldRecord[] = Array(10).fill(null).map((_, i) => ({
      legalName: 'Jane Doe',
      ocifId: '1000-12345',
      status: 'LEGAL HOLD',
      holdName: 'Legal Hold Re Placeholder',
      customerStatus: 'Active Customer',
      roleType: 'Owner',
      address: '33 Dundas St W, Toronto, ON M5G 2C3'
    }));
    return of(mockData);
  }
}