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

  export const MOCK_RECURSIVE_DATA = [
  {
    ocifId: "P-100",
    profileName: "Corporation 2 (Level 0)",
    legalHoldStatus: "N/A",
    isParent: true,
    isExpanded: false,
    level: 0,
    children: [
      {
        ocifId: "C-200",
        profileName: "Role Player A (Level 1)",
        legalHoldStatus: "LEGAL HOLD",
        isParent: true,
        isExpanded: false,
        level: 1,
        children: [
          {
            ocifId: "GC-300",
            profileName: "Sub-Signatory Alpha (Level 2)",
            legalHoldStatus: "RELEASED",
            isParent: true,
            isExpanded: false,
            level: 2,
            children: [
              {
                ocifId: "GGC-400",
                profileName: "Deep Nested Actor (Level 3)",
                legalHoldStatus: "N/A",
                isParent: false,
                level: 3
              }
            ]
          }
        ]
      }
    ]
  }
];
}