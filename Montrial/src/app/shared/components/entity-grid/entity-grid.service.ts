import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EntityGridResponse, EntityNode } from './entity-grid.model';

/**
 * EntityGridService
 *
 * Calls GET /api/v1/entity-grid in production.
 * In development, useMock = true returns data that exactly mirrors
 * the Figma designs including multi-level indentation.
 *
 * Data structure read from Figma image 3 (clearest view):
 *   Level 0: Corp 2, Corp 3, Corp 4, ABC Ltd.  (root clusters)
 *   Level 1: Corp 5  (child of Corp 4)
 *   Level 2: Role Player F, G, D, E, A, B, C  (children of Corp 5)
 *   Level 3+: further nesting shown in Corp 5 / ABC Ltd sub-trees
 */
@Injectable({ providedIn: 'root' })
export class EntityGridService {

  private readonly apiUrl = '/api/v1/entity-grid';

  /** Flip to false to hit the real REST endpoint */
  private readonly useMock = true;

  constructor(private readonly http: HttpClient) {}

  getEntityGrid(): Observable<EntityGridResponse> {
    if (this.useMock) {
      return of(this.buildMockResponse()).pipe(delay(200));
    }
    return this.http.get<EntityGridResponse>(this.apiUrl);
  }

  // ── Mock Data ──────────────────────────────────────────────────────────────
  // Structure is taken directly from Figma image 3:
  //   Corp 2  (L0, expanded, no children shown → leaf cluster)
  //   Corp 3  (L0, expanded, no children shown → leaf cluster)
  //   Corp 4  (L0, expanded)
  //     └─ Corp 5           (L1, expanded)
  //          ├─ Role Player F  (L2)
  //          ├─ Role Player G  (L2)
  //          ├─ Role Player D  (L2)
  //          ├─ Role Player E  (L2)
  //          ├─ Role Player A  (L2)
  //          ├─ Role Player B  (L2)
  //          └─ Role Player C  (L2)
  //   ABC Ltd. (L0, collapsed)
  //     └─ ABC Sub Ltd.     (L1)
  //          ├─ ABC Sub-Sub 1  (L2)
  //          └─ ABC Sub-Sub 2  (L2)
  //                └─ Deep Entity  (L3)
  //                      └─ Deepest Entity (L4)

  private buildMockResponse(): EntityGridResponse {
    const addr = '33 Dundas St W, Toronto, ON M5G 2C3';

    const data: EntityNode[] = [

      // ── Corp 2 ────────────────────────────────────────────────────────────
      {
        ocifId: '1000-12345',
        profileName: 'Corp 2',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: '1000-12345',
            profileName: 'Role Player X1',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: addr,
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ── Corp 3 ────────────────────────────────────────────────────────────
      {
        ocifId: '1000-12345',
        profileName: 'Corp 3',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: '1000-12345',
            profileName: 'Role Player Y1',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: addr,
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ── Corp 4 (multi-level cluster from Figma image 3) ───────────────────
      {
        ocifId: '1000-12345',
        profileName: 'Corp 4',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: true,      // expanded — Corp 5 visible
        children: [
          {
            ocifId: '1000-12345',
            profileName: 'Corp 5',               // Level 1 — child of Corp 4
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Owner',
            address: addr,
            isParent: true,
            isExpanded: true,   // expanded — Role Players visible
            children: [
              {
                ocifId: '1000-12345',
                profileName: 'Role Player F',    // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory of ABC Ltd.',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              },
              {
                ocifId: '1000-12345',
                profileName: 'Role Player G',    // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory of ABC Ltd.',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              },
              {
                ocifId: '1000-12345',
                profileName: 'Role Player D',    // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory of ABC Ltd.',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              },
              {
                ocifId: '1000-12345',
                profileName: 'Role Player E',    // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory of ABC Ltd.',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              },
              {
                ocifId: '1000-12345',
                profileName: 'Role Player A',    // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Owner of ABC Ltd.',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              },
              {
                ocifId: '1000-12345',
                profileName: 'Role Player B',    // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory of ABC Ltd.',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              },
              {
                ocifId: '1000-12345',
                profileName: 'Role Player C',    // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory of ABC Ltd.',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              }
            ]
          }
        ]
      },

      // ── ABC Ltd. (deep nesting demo — up to L4) ───────────────────────────
      {
        ocifId: '1000-12345',
        profileName: 'ABC Ltd.',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: false,     // collapsed by default
        children: [
          {
            ocifId: '1000-12350',
            profileName: 'ABC Sub Ltd.',          // Level 1
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: addr,
            isParent: true,
            isExpanded: false,
            children: [
              {
                ocifId: '1000-12351',
                profileName: 'ABC Sub-Sub 1',     // Level 2
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory',
                address: addr,
                isParent: false,
                isExpanded: false,
                children: []
              },
              {
                ocifId: '1000-12352',
                profileName: 'ABC Sub-Sub 2',     // Level 2
                legalHoldStatus: 'LEGAL HOLD',
                holdName: 'legalhold_name_123',
                lifecycle: 'Active Customer',
                role: 'Owner',
                address: addr,
                isParent: true,
                isExpanded: false,
                children: [
                  {
                    ocifId: '1000-12353',
                    profileName: 'Deep Entity L3',  // Level 3
                    legalHoldStatus: 'N/A',
                    holdName: '',
                    lifecycle: 'Active Customer',
                    role: 'Authorized Signatory',
                    address: addr,
                    isParent: true,
                    isExpanded: false,
                    children: [
                      {
                        ocifId: '1000-12354',
                        profileName: 'Deepest Entity L4',  // Level 4
                        legalHoldStatus: 'N/A',
                        holdName: '',
                        lifecycle: 'Active Customer',
                        role: 'Authorized Signatory',
                        address: addr,
                        isParent: false,
                        isExpanded: false,
                        children: []
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            ocifId: '1000-12355',
            profileName: 'ABC Partner Ltd.',      // Level 1
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Owner',
            address: addr,
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      }

    ];

    return { data, totalCount: this.countAll(data) };
  }

  private countAll(nodes: EntityNode[]): number {
    return nodes.reduce((sum, n) => sum + 1 + this.countAll(n.children), 0);
  }
}
