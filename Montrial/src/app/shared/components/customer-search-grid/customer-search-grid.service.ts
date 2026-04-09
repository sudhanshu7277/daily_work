import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CustomerSearchResponse, CustomerNode } from './customer-search.model';

/**
 * CustomerSearchService
 *
 * Returns a flat list of customer records, each optionally having
 * one level of children (no deep nesting unlike entity-grid).
 *
 * Structure:
 *   Jane Doe        (parent, isParent=true)
 *     └─ Jane Doe   (child)
 *   John Smith      (parent, isParent=true)
 *     ├─ John Smith Jr.
 *     └─ John Smith Sr.
 *   Alice Brown     (parent, isParent=true, LEGAL HOLD)
 *     ├─ Alice Corp
 *     └─ Alice Holdings
 *   Bob Johnson     (no children, isParent=false)
 */
@Injectable({ providedIn: 'root' })
export class CustomerSearchService {

  private readonly apiUrl = '/api/v1/customer-search';
  private readonly useMock = true;

  constructor(private readonly http: HttpClient) {}

  getCustomers(): Observable<CustomerSearchResponse> {
    if (this.useMock) {
      return of(this.buildMockResponse());
    }
    return this.http.get<CustomerSearchResponse>(this.apiUrl);
  }

  private buildMockResponse(): CustomerSearchResponse {
    const addr = '33 Dundas St W, Toronto, ON M5G 2C3';

    const child = (
      legalName: string,
      ocifId: string,
      status: 'LEGAL HOLD' | 'N/A',
      holdName: string,
      roleType: string
    ): CustomerNode => ({
      legalName,
      ocifId,
      status,
      holdName,
      lifecycle: 'Active Customer',
      role: 'Owner',
      address: addr,
      customerStatus: 'Active',
      roleType,
      isParent: false,
      isExpanded: false,
      children: [],
    });

    const data: CustomerNode[] = [

      // ── Jane Doe — 1 child ─────────────────────────────────────────────────
      {
        legalName: 'Jane Doe',
        ocifId: 'CS-0001',
        status: 'LEGAL HOLD',
        holdName: 'Legal Hold Re Placeholder',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        customerStatus: 'Active',
        roleType: 'Primary',
        isParent: true,
        isExpanded: true,
        children: [
          child('Jane Doe', 'CS-0002', 'LEGAL HOLD', 'Legal Hold Re Placeholder', 'Primary'),
        ],
      },

      // ── John Smith — 2 children ────────────────────────────────────────────
      {
        legalName: 'John Smith',
        ocifId: 'CS-0003',
        status: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        customerStatus: 'Active',
        roleType: 'Secondary',
        isParent: true,
        isExpanded: true,
        children: [
          child('John Smith Jr.',  'CS-0004', 'N/A', '', 'Secondary'),
          child('John Smith Sr.',  'CS-0005', 'N/A', '', 'Secondary'),
        ],
      },

      // ── Alice Brown — 2 children, LEGAL HOLD ──────────────────────────────
      {
        legalName: 'Alice Brown',
        ocifId: 'CS-0006',
        status: 'LEGAL HOLD',
        holdName: 'Legal Hold Re Placeholder',
        lifecycle: 'Active Customer',
        role: 'Authorized Signatory',
        address: addr,
        customerStatus: 'Active',
        roleType: 'Primary',
        isParent: true,
        isExpanded: true,
        children: [
          child('Alice Corp',     'CS-0007', 'LEGAL HOLD', 'Legal Hold Re Placeholder', 'Primary'),
          child('Alice Holdings', 'CS-0008', 'N/A', '', 'Primary'),
        ],
      },

      // ── Bob Johnson — no children ──────────────────────────────────────────
      {
        legalName: 'Bob Johnson',
        ocifId: 'CS-0009',
        status: 'N/A',
        holdName: '',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: addr,
        customerStatus: 'Inactive',
        roleType: 'Secondary',
        isParent: false,
        isExpanded: false,
        children: [],
      },

    ];

    return { data, totalCount: this.countAll(data) };
  }

  private countAll(nodes: CustomerNode[]): number {
    return nodes.reduce((sum, n) => sum + 1 + this.countAll(n.children), 0);
  }
}