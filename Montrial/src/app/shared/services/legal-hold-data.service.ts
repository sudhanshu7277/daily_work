// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';

// export interface LegalHoldRecord {
//   legalName: string;
//   ocifId: string;
//   status: string;
//   holdName: string;
//   customerStatus: string;
//   roleType: string;
//   address: string;
// }

// @Injectable({ providedIn: 'root' })
// export class LegalHoldDataService {
//   getSearchResults(): Observable<LegalHoldRecord[]> {
//     const mockData: LegalHoldRecord[] = Array(10).fill(null).map((_, i) => ({
//       legalName: 'Jane Doe',
//       ocifId: '1000-12345',
//       status: 'LEGAL HOLD',
//       holdName: 'Legal Hold Re Placeholder',
//       customerStatus: 'Active Customer',
//       roleType: 'Owner',
//       address: '33 Dundas St W, Toronto, ON M5G 2C3'
//     }));
//     return of(mockData);
//   }

//   export const MOCK_RECURSIVE_DATA = [
//   {
//     "ocifId": "P-100",
//     "profileName": "Global Corp (L0)",
//     "legalHoldStatus": "N/A",
//     "isParent": true,
//     "isExpanded": true,
//     "isChild": false,
//     "level": 0,
//     "children": [
//       {
//         "ocifId": "C-200",
//         "profileName": "Regional HQ (L1)",
//         "legalHoldStatus": "LEGAL HOLD",
//         "isParent": true,
//         "isExpanded": true,
//         "isChild": true,
//         "level": 1,
//         "children": [
//           {
//             "ocifId": "GC-300",
//             "profileName": "Ontario Branch (L2)",
//             "legalHoldStatus": "N/A",
//             "isParent": true,
//             "isExpanded": true,
//             "isChild": true,
//             "level": 2,
//             "children": [
//               {
//                 "ocifId": "GGC-400",
//                 "profileName": "Milton Unit (L3)",
//                 "legalHoldStatus": "RELEASED",
//                 "isParent": false,
//                 "isChild": true,
//                 "level": 3
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   }
// ]
// }



import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LegalHoldDataService {

  getMockData(): any[] {
    return [
      // ── Cluster 1: Corp Alpha (3 levels deep) ────────────────────────────
      {
        ocifId: 'C2001',
        profileName: 'Corp Alpha',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'Project Omega',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: 'RP-A1',
            profileName: 'Role Player A1',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: true,
            isExpanded: true,
            children: [
              {
                ocifId: 'SUB-X1',
                profileName: 'Sub Entity X1',
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Owner',
                address: '33 Dundas St W, Toronto, ON M5G 2C3',
                isParent: false,
                isExpanded: false,
                children: []
              }
            ]
          }
        ]
      },

      // ── Cluster 2: Corp Beta (2 levels deep) ─────────────────────────────
      {
        ocifId: 'C2002',
        profileName: 'Corp Beta',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: 'RP-B1',
            profileName: 'Role Player B1',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: 'RP-B2',
            profileName: 'Role Player B2',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'Project Omega',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ── Standalone row (no children) ──────────────────────────────────────
      {
        ocifId: 'C1001',
        profileName: 'Corp A',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: false,
        isExpanded: false,
        children: []
      },

      // ── Standalone row with legal hold ────────────────────────────────────
      {
        ocifId: 'C1002',
        profileName: 'Corp B',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'Project Omega',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: false,
        isExpanded: false,
        children: []
      },

      // ── Cluster 3: Corp Deep Root (5 levels deep) ─────────────────────────
      {
        ocifId: 'C3001',
        profileName: 'Corp Deep Root',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'Project Omega',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: 'L1-001',
            profileName: 'Level 1 Entity',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: true,
            isExpanded: true,
            children: [
              {
                ocifId: 'L2-001',
                profileName: 'Level 2 Sub',
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Owner',
                address: '33 Dundas St W, Toronto, ON M5G 2C3',
                isParent: true,
                isExpanded: true,
                children: [
                  {
                    ocifId: 'L3-001',
                    profileName: 'Level 3 Deep',
                    legalHoldStatus: 'LEGAL HOLD',
                    holdName: 'Project Alpha',
                    lifecycle: 'Active Customer',
                    role: 'Authorized Signatory',
                    address: '33 Dundas St W, Toronto, ON M5G 2C3',
                    isParent: true,
                    isExpanded: true,
                    children: [
                      {
                        ocifId: 'L4-001',
                        profileName: 'Level 4 Sub',
                        legalHoldStatus: 'N/A',
                        holdName: '',
                        lifecycle: 'Active Customer',
                        role: 'Owner',
                        address: '33 Dundas St W, Toronto, ON M5G 2C3',
                        isParent: true,
                        isExpanded: true,
                        children: [
                          {
                            ocifId: 'L5-001',
                            profileName: 'Level 5 Deepest',
                            legalHoldStatus: 'N/A',
                            holdName: '',
                            lifecycle: 'Active Customer',
                            role: 'Authorized Signatory',
                            address: '33 Dundas St W, Toronto, ON M5G 2C3',
                            isParent: false,
                            isExpanded: false,
                            children: []
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── Cluster 4: Corp Gamma (multiple children, mixed hold status) ──────
      {
        ocifId: 'C4001',
        profileName: 'Corp Gamma',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'Project Delta',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: 'RP-G1',
            profileName: 'Role Player G1',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: 'RP-G2',
            profileName: 'Role Player G2',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: 'RP-G3',
            profileName: 'Role Player G3',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'Project Delta',
            lifecycle: 'Active Customer',
            role: 'Owner',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ── Another standalone ────────────────────────────────────────────────
      {
        ocifId: 'C1003',
        profileName: 'Corp C',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: false,
        isExpanded: false,
        children: []
      }
    ];
  }
}