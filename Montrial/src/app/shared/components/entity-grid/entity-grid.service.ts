import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { EntityGridResponse, EntityNode } from './entity-grid.model';

/**
 * EntityGridService
 *
 * In production this calls the real API endpoint.
 * During development / testing it returns rich mock data that mirrors
 * exactly what is visible in the Figma designs — including multi-level
 * nesting up to 5 levels deep.
 *
 * Switch between mock and real by setting useMock = false and providing
 * the correct apiUrl.
 */
@Injectable({ providedIn: 'root' })
export class EntityGridService {

  private readonly apiUrl = '/api/v1/entity-grid';

  /** Set to false to hit the real REST endpoint */
  private readonly useMock = true;

  constructor(private readonly http: HttpClient) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Fetches the entity tree for the grid.
   * Returns an Observable<EntityGridResponse> so the component can use
   * the async pipe or subscribe normally.
   */
  getEntityGrid(): Observable<EntityGridResponse> {
    if (this.useMock) {
      // Simulate network latency
      return of(this.buildMockResponse()).pipe(delay(200));
    }
    return this.http.get<EntityGridResponse>(this.apiUrl);
  }

  // ── Mock Data ──────────────────────────────────────────────────────────────

  private buildMockResponse(): EntityGridResponse {
    const data: EntityNode[] = [

      // ════════════════════════════════════════════════════════════════════════
      // CLUSTER 1 — Corp 2
      // Source: All images — Corp 2 expanded with 7 Role Player children
      // ════════════════════════════════════════════════════════════════════════
      {
        ocifId: '1000-12345',
        profileName: 'Corp 2',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: '1000-12345',
            profileName: 'Role Player F',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player G',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player D',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player E',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player A',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Owner of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player B',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player C',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ════════════════════════════════════════════════════════════════════════
      // CLUSTER 2 — Corp 3
      // Source: All images — LEGAL HOLD, expanded, no visible children
      // ════════════════════════════════════════════════════════════════════════
      {
        ocifId: '1000-12345',
        profileName: 'Corp 3',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: '1000-12345',
            profileName: 'Role Player H',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of Corp 3',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ════════════════════════════════════════════════════════════════════════
      // CLUSTER 3 — Corp 4
      // Source: Images 1, 2, 4 — LEGAL HOLD, collapsed/expanded showing
      // Role Player D, E, A, B, C as children
      // ════════════════════════════════════════════════════════════════════════
      {
        ocifId: '1000-12345',
        profileName: 'Corp 4',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: true,
        children: [
          {
            ocifId: '1000-12345',
            profileName: 'Role Player D',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player E',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player A',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Owner of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player B',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player C',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ════════════════════════════════════════════════════════════════════════
      // CLUSTER 4 — Corp 5
      // Source: Image with all corps — LEGAL HOLD, collapsed,
      // children are Role Player F and G (visible when expanded)
      // Extended with deeper nesting to demonstrate multi-level indentation
      // ════════════════════════════════════════════════════════════════════════
      {
        ocifId: '1000-12345',
        profileName: 'Corp 5',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: false,
        children: [
          {
            ocifId: '1000-12345',
            profileName: 'Role Player F',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: true,
            isExpanded: false,
            children: [
              {
                ocifId: '1000-12346',
                profileName: 'Sub Entity F-1',
                legalHoldStatus: 'LEGAL HOLD',
                holdName: 'legalhold_name_123',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory',
                address: '33 Dundas St W, Toronto, ON M5G 2C3',
                isParent: true,
                isExpanded: false,
                children: [
                  {
                    ocifId: '1000-12347',
                    profileName: 'Sub Sub Entity F-1-1',
                    legalHoldStatus: 'N/A',
                    holdName: '',
                    lifecycle: 'Active Customer',
                    role: 'Authorized Signatory',
                    address: '33 Dundas St W, Toronto, ON M5G 2C3',
                    isParent: true,
                    isExpanded: false,
                    children: [
                      {
                        ocifId: '1000-12348',
                        profileName: 'Deep Entity F-1-1-1',
                        legalHoldStatus: 'N/A',
                        holdName: '',
                        lifecycle: 'Active Customer',
                        role: 'Authorized Signatory',
                        address: '33 Dundas St W, Toronto, ON M5G 2C3',
                        isParent: true,
                        isExpanded: false,
                        children: [
                          {
                            ocifId: '1000-12349',
                            profileName: 'Deepest Entity F-1-1-1-1',
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
          },
          {
            ocifId: '1000-12345',
            profileName: 'Role Player G',
            legalHoldStatus: 'N/A',
            holdName: '',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: false,
            isExpanded: false,
            children: []
          }
        ]
      },

      // ════════════════════════════════════════════════════════════════════════
      // CLUSTER 5 — ABC Ltd.
      // Source: Images 1 & 4 — bottom cluster, collapsed, N/A, Owner
      // Extended with 3-level nesting
      // ════════════════════════════════════════════════════════════════════════
      {
        ocifId: '1000-12345',
        profileName: 'ABC Ltd.',
        legalHoldStatus: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: '33 Dundas St W, Toronto, ON M5G 2C3',
        isParent: true,
        isExpanded: false,
        children: [
          {
            ocifId: '1000-12350',
            profileName: 'ABC Sub Ltd.',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory',
            address: '33 Dundas St W, Toronto, ON M5G 2C3',
            isParent: true,
            isExpanded: false,
            children: [
              {
                ocifId: '1000-12351',
                profileName: 'ABC Sub-Sub Ltd.',
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
                ocifId: '1000-12352',
                profileName: 'ABC Sub-Sub 2 Ltd.',
                legalHoldStatus: 'LEGAL HOLD',
                holdName: 'legalhold_name_123',
                lifecycle: 'Active Customer',
                role: 'Owner',
                address: '33 Dundas St W, Toronto, ON M5G 2C3',
                isParent: false,
                isExpanded: false,
                children: []
              }
            ]
          },
          {
            ocifId: '1000-12353',
            profileName: 'ABC Partner Ltd.',
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

    ];

    return {
      data,
      totalCount: this.countAll(data)
    };
  }

  /** Recursively count all nodes */
  private countAll(nodes: EntityNode[]): number {
    return nodes.reduce((sum, n) => sum + 1 + this.countAll(n.children), 0);
  }
}
