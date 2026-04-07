import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EntityGridResponse, EntityNode } from './entity-grid.model';

/**
 * EntityGridService
 *
 * In production set useMock = false — the service will call GET /api/v1/entity-grid.
 * In development useMock = true returns data matching the Figma designs exactly.
 *
 * Tree structure (from Figma image 3 — clearest indentation view):
 *
 *   Corp 2       (L0)  ← root cluster, 1 child
 *   Corp 3       (L0)  ← root cluster, LEGAL HOLD, 1 child
 *   Corp 4       (L0)  ← root cluster, LEGAL HOLD
 *     └─ Corp 5        (L1)  ← child of Corp 4
 *          ├─ Role Player F  (L2)
 *          ├─ Role Player G  (L2)
 *          ├─ Role Player D  (L2)
 *          ├─ Role Player E  (L2)
 *          ├─ Role Player A  (L2)
 *          ├─ Role Player B  (L2)
 *          └─ Role Player C  (L2)
 *   ABC Ltd.     (L0)  ← root cluster, deep nesting demo
 *     └─ ABC Sub Ltd.  (L1)
 *          ├─ ABC Sub-Sub 1  (L2)
 *          └─ ABC Sub-Sub 2  (L2)
 *               └─ Deep L3   (L3)
 *                    └─ Deepest L4  (L4)
 */
@Injectable({ providedIn: 'root' })
export class EntityGridService {

  private readonly apiUrl = '/api/v1/entity-grid';
  private readonly useMock = true;

  constructor(private readonly http: HttpClient) {}

  getEntityGrid(): Observable<EntityGridResponse> {
    if (this.useMock) {
      return of(this.buildMockResponse()).pipe(delay(150));
    }
    return this.http.get<EntityGridResponse>(this.apiUrl);
  }

  // ── Mock data ──────────────────────────────────────────────────────────────

  private buildMockResponse(): EntityGridResponse {
    const addr = '33 Dundas St W, Toronto, ON M5G 2C3';

    // Helper to build a leaf node quickly
    const leaf = (
      id: string,
      name: string,
      status: 'LEGAL HOLD' | 'N/A',
      holdName: string,
      role: string
    ): EntityNode => ({
      ocifId: id,
      profileName: name,
      legalHoldStatus: status,
      holdName,
      lifecycle: 'Active Customer',
      role,
      address: addr,
      isParent: false,
      isExpanded: false,
      children: [],
    });

    const data: EntityNode[] = [

      // ── Corp 2 ─────────────────────────────────────────────────────────────
      {
        ocifId: 'C2-0001',
        profileName: 'Corp 2',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: true,
        children: [
          leaf('C2-0002', 'Role Player X1', 'N/A', '', 'Authorized Signatory'),
        ],
      },

      // ── Corp 3 ─────────────────────────────────────────────────────────────
      {
        ocifId: 'C3-0001',
        profileName: 'Corp 3',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: true,
        children: [
          leaf('C3-0002', 'Role Player Y1', 'N/A', '', 'Authorized Signatory'),
        ],
      },

      // ── Corp 4 → Corp 5 → Role Players ────────────────────────────────────
      {
        ocifId: 'C4-0001',
        profileName: 'Corp 4',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: true,       // Corp 5 visible immediately
        children: [
          {
            ocifId: 'C4-0002',
            profileName: 'Corp 5',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Owner',
            address: addr,
            isParent: true,
            isExpanded: true,   // Role Players visible immediately
            children: [
              leaf('C4-0003', 'Role Player F', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C4-0004', 'Role Player G', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C4-0005', 'Role Player D', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C4-0006', 'Role Player E', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C4-0007', 'Role Player A', 'N/A', '', 'Owner of ABC Ltd.'),
              leaf('C4-0008', 'Role Player B', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C4-0009', 'Role Player C', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
            ],
          },
        ],
      },

      // ── ABC Ltd. (deep nesting demo — L0 → L4) ────────────────────────────
      {
        ocifId: 'ABC-0001',
        profileName: 'ABC Ltd.',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        isParent: true,
        isExpanded: true,       // visible on load — was false before (caused search miss)
        children: [
          {
            ocifId: 'ABC-0002',
            profileName: 'ABC Sub Ltd.',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: addr,
            isParent: true,
            isExpanded: true,
            children: [
              leaf('ABC-0003', 'ABC Sub-Sub 1', 'N/A', '', 'Authorized Signatory'),
              {
                ocifId: 'ABC-0004',
                profileName: 'ABC Sub-Sub 2',
                legalHoldStatus: 'LEGAL HOLD',
                holdName: 'legalhold_name_123',
                lifecycle: 'Active Customer',
                role: 'Owner',
                address: addr,
                isParent: true,
                isExpanded: true,
                children: [
                  {
                    ocifId: 'ABC-0005',
                    profileName: 'Deep Entity L3',
                    legalHoldStatus: 'N/A',
                    holdName: '',
                    lifecycle: 'Active Customer',
                    role: 'Authorized Signatory',
                    address: addr,
                    isParent: true,
                    isExpanded: true,
                    children: [
                      leaf('ABC-0006', 'Deepest Entity L4', 'N/A', '', 'Authorized Signatory'),
                    ],
                  },
                ],
              },
            ],
          },
          leaf('ABC-0007', 'ABC Partner Ltd.', 'N/A', '', 'Owner'),
        ],
      },
    ];

    return { data, totalCount: this.countAll(data) };
  }

  private countAll(nodes: EntityNode[]): number {
    return nodes.reduce((sum, n) => sum + 1 + this.countAll(n.children), 0);
  }
}
