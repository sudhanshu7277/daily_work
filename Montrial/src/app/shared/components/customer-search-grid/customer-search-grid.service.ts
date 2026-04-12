import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  CustomerNode,
  CustomerSearchRequest,
  CustomerSearchResponse,
} from './customer-search.model';

/**
 * CustomerSearchGridService
 *
 * Provides two operations:
 *   getCustomers()             — initial load (GET), returns all records
 *   searchCustomers(request)   — filtered search (POST), accepts firstName & lastName
 *
 * Set useMock = false to switch to live API calls.
 */
@Injectable({ providedIn: 'root' })
export class CustomerSearchGridService {

  private readonly apiUrl    = '/api/v1/customer-search';
  private readonly useMock   = true;

  constructor(private readonly http: HttpClient) {}

  // ── Initial load ───────────────────────────────────────────────────────────
  getCustomers(): Observable<CustomerSearchResponse> {
    if (this.useMock) {
      return of(this.buildMockResponse());
    }
    return this.http.get<CustomerSearchResponse>(this.apiUrl);
  }

  // ── POST search by firstName + lastName ────────────────────────────────────
  searchCustomers(request: CustomerSearchRequest): Observable<CustomerSearchResponse> {
    if (this.useMock) {
      return of(this.buildMockResponse(request));
    }
    return this.http.post<CustomerSearchResponse>(this.apiUrl, request);
  }

  // ── Mock data ──────────────────────────────────────────────────────────────
  private buildMockResponse(request?: CustomerSearchRequest): CustomerSearchResponse {
    const addr = '33 Dundas St W, Toronto, ON M5G 2C3';

    // Helper to build a child node
    const mkChild = (
      firstName:  string,
      lastName:   string,
      ocifId:     string,
      status:     'LEGAL HOLD' | 'N/A',
      holdName:   string,
      roleType:   string,
    ): CustomerNode => ({
      firstName,
      lastName,
      legalName:      `${firstName} ${lastName}`.trim(),
      ocifId,
      status,
      holdName,
      lifecycle:      'Active Customer',
      role:           'Owner',
      address:        addr,
      customerStatus: 'Active',
      roleType,
      isParent:       false,
      isExpanded:     false,
      children:       [],
    });

    const data: CustomerNode[] = [

      // ── Jane Doe — 1 child ─────────────────────────────────────────────────
      {
        firstName:      'Jane',
        lastName:       'Doe',
        legalName:      'Jane Doe',
        ocifId:         'CS-0001',
        status:         'LEGAL HOLD',
        holdName:       'Legal Hold Re Placeholder',
        lifecycle:      'Active Customer',
        role:           'Owner',
        address:        addr,
        customerStatus: 'Active',
        roleType:       'Primary',
        isParent:       true,
        isExpanded:     true,
        children: [
          mkChild('Jane', 'Doe', 'CS-0002', 'LEGAL HOLD', 'Legal Hold Re Placeholder', 'Primary'),
        ],
      },

      // ── John Smith — 2 children ────────────────────────────────────────────
      {
        firstName:      'John',
        lastName:       'Smith',
        legalName:      'John Smith',
        ocifId:         'CS-0003',
        status:         'N/A',
        holdName:       '',
        lifecycle:      'Active Customer',
        role:           'Owner',
        address:        addr,
        customerStatus: 'Active',
        roleType:       'Secondary',
        isParent:       true,
        isExpanded:     true,
        children: [
          mkChild('John', 'Smith',  'CS-0004', 'N/A', '', 'Secondary'),
          mkChild('John', 'Smith',  'CS-0005', 'N/A', '', 'Secondary'),
        ],
      },

      // ── Alice Brown — 2 children, LEGAL HOLD ──────────────────────────────
      {
        firstName:      'Alice',
        lastName:       'Brown',
        legalName:      'Alice Brown',
        ocifId:         'CS-0006',
        status:         'LEGAL HOLD',
        holdName:       'Legal Hold Re Placeholder',
        lifecycle:      'Active Customer',
        role:           'Authorized Signatory',
        address:        addr,
        customerStatus: 'Active',
        roleType:       'Primary',
        isParent:       true,
        isExpanded:     true,
        children: [
          mkChild('Alice', 'Corp',     'CS-0007', 'LEGAL HOLD', 'Legal Hold Re Placeholder', 'Primary'),
          mkChild('Alice', 'Holdings', 'CS-0008', 'N/A', '', 'Primary'),
        ],
      },

      // ── Bob Johnson — no children ──────────────────────────────────────────
      {
        firstName:      'Bob',
        lastName:       'Johnson',
        legalName:      'Bob Johnson',
        ocifId:         'CS-0009',
        status:         'N/A',
        holdName:       '',
        lifecycle:      'Active Customer',
        role:           'Owner',
        address:        addr,
        customerStatus: 'Inactive',
        roleType:       'Secondary',
        isParent:       false,
        isExpanded:     false,
        children:       [],
      },

    ];

    // When a search request is provided, filter by firstName and/or lastName
    const filtered = request
      ? data.filter(n => {
          const fnMatch = !request.firstName ||
            n.firstName.toLowerCase().includes(request.firstName.toLowerCase());
          const lnMatch = !request.lastName  ||
            n.lastName.toLowerCase().includes(request.lastName.toLowerCase());
          return fnMatch && lnMatch;
        })
      : data;

    return { data: filtered, totalCount: this.countAll(filtered) };
  }

  private countAll(nodes: CustomerNode[]): number {
    return nodes.reduce((sum, n) => sum + 1 + this.countAll(n.children), 0);
  }
}
