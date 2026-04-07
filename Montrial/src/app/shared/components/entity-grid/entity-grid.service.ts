import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EntityGridResponse, EntityNode } from './entity-grid.model';

/**
 * EntityGridService
 *
 * Toggle useMock to switch between mock data and a real API.
 * The mock is returned SYNCHRONOUSLY (no delay) to eliminate any
 * timing / change-detection issues during development.
 *
 * Data mirrors the Figma designs exactly:
 *
 *   Corp 2  (L0) ─ expanded
 *     └─ Role Player X1  (L1)
 *   Corp 3  (L0) ─ expanded, LEGAL HOLD
 *     └─ Role Player Y1  (L1)
 *   Corp 4  (L0) ─ expanded, LEGAL HOLD
 *     └─ Corp 5          (L1) ─ expanded, LEGAL HOLD
 *          ├─ Corp 6          (L2) ─ expanded, LEGAL HOLD
 *          │    ├─ Role Player H  (L3)
 *          │    └─ Role Player I  (L3)
 *          ├─ Role Player F   (L2)
 *          ├─ Role Player G   (L2)
 *          ├─ Role Player D   (L2)
 *          ├─ Role Player E   (L2)
 *          └─ Role Player A   (L2)
 *   ABC Ltd. (L0) ─ expanded
 *     └─ ABC Sub Ltd.    (L1) ─ expanded, LEGAL HOLD
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
      // Synchronous — no delay, no timing issues
      return of(this.buildMockResponse());
    }
    return this.http.get<EntityGridResponse>(this.apiUrl);
  }

  private buildMockResponse(): EntityGridResponse {
    const addr = '33 Dundas St W, Toronto, ON M5G 2C3';

    const leaf = (id: string, name: string, status: 'LEGAL HOLD' | 'N/A', holdName: string, role: string): EntityNode => ({
      ocifId: id, profileName: name, legalHoldStatus: status, holdName,
      lifecycle: 'Active Customer', role, address: addr,
      isParent: false, isExpanded: false, children: [],
    });

    const data: EntityNode[] = [

      // ── Corp 2 ─────────────────────────────────────────────────────────────
      {
        ocifId: 'C2-001', profileName: 'Corp 2', legalHoldStatus: 'N/A',
        holdName: '', lifecycle: 'Active Customer', role: 'Owner', address: addr,
        isParent: true, isExpanded: true,
        children: [
          leaf('C2-002', 'Role Player X1', 'N/A', '', 'Authorized Signatory'),
        ],
      },

      // ── Corp 3 ─────────────────────────────────────────────────────────────
      {
        ocifId: 'C3-001', profileName: 'Corp 3', legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: addr,
        isParent: true, isExpanded: true,
        children: [
          leaf('C3-002', 'Role Player Y1', 'N/A', '', 'Authorized Signatory'),
        ],
      },

      // ── Corp 4  →  Corp 5  →  Corp 6  →  Role Players ─────────────────────
      {
        ocifId: 'C4-001', profileName: 'Corp 4', legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: addr,
        isParent: true, isExpanded: true,
        children: [
          {
            ocifId: 'C5-001', profileName: 'Corp 5', legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: addr,
            isParent: true, isExpanded: true,
            children: [
              {
                ocifId: 'C6-001', profileName: 'Corp 6', legalHoldStatus: 'LEGAL HOLD',
                holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: addr,
                isParent: true, isExpanded: true,
                children: [
                  leaf('C6-002', 'Role Player H', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
                  leaf('C6-003', 'Role Player I', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
                ],
              },
              leaf('C5-002', 'Role Player F', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C5-003', 'Role Player G', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C5-004', 'Role Player D', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C5-005', 'Role Player E', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C5-006', 'Role Player A', 'N/A', '', 'Owner of ABC Ltd.'),
            ],
          },
        ],
      },

      // ── ABC Ltd. ─────────────────────────────────────────────────────────
      {
        ocifId: 'ABC-001', profileName: 'ABC Ltd.', legalHoldStatus: 'N/A',
        holdName: '', lifecycle: 'Active Customer', role: 'Owner', address: addr,
        isParent: true, isExpanded: true,
        children: [
          {
            ocifId: 'ABC-002', profileName: 'ABC Sub Ltd.', legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Authorized Signatory', address: addr,
            isParent: true, isExpanded: true,
            children: [
              leaf('ABC-003', 'ABC Sub-Sub 1', 'N/A', '', 'Authorized Signatory'),
              {
                ocifId: 'ABC-004', profileName: 'ABC Sub-Sub 2', legalHoldStatus: 'LEGAL HOLD',
                holdName: 'legalhold_name_123', lifecycle: 'Active Customer', role: 'Owner', address: addr,
                isParent: true, isExpanded: true,
                children: [
                  {
                    ocifId: 'ABC-005', profileName: 'Deep Entity L3', legalHoldStatus: 'N/A',
                    holdName: '', lifecycle: 'Active Customer', role: 'Authorized Signatory', address: addr,
                    isParent: true, isExpanded: true,
                    children: [
                      leaf('ABC-006', 'Deepest Entity L4', 'N/A', '', 'Authorized Signatory'),
                    ],
                  },
                ],
              },
            ],
          },
          leaf('ABC-007', 'ABC Partner Ltd.', 'N/A', '', 'Owner'),
        ],
      },

    ];

    return { data, totalCount: this.countAll(data) };
  }

  private countAll(nodes: EntityNode[]): number {
    return nodes.reduce((sum, n) => sum + 1 + this.countAll(n.children), 0);
  }
}
