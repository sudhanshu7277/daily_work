import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { CustomerSearchComponent } from './customer-search.component';
import { CustomerSearchService } from './customer-search.service';
import { CustomerSearchResponse, CustomerNode } from './customer-search.model';

// ── Helpers ────────────────────────────────────────────────────────────────────

const addr = '33 Dundas St W, Toronto, ON M5G 2C3';

function makeChild(id: string, name: string): CustomerNode {
  return {
    legalName: name, ocifId: id, status: 'N/A', holdName: '',
    lifecycle: 'Active Customer', role: 'Owner', address: addr,
    customerStatus: 'Active', roleType: 'Primary',
    isParent: false, isExpanded: false, children: [],
  };
}

function makeParent(id: string, name: string, children: CustomerNode[]): CustomerNode {
  return {
    legalName: name, ocifId: id, status: 'N/A', holdName: '',
    lifecycle: 'Active Customer', role: 'Owner', address: addr,
    customerStatus: 'Active', roleType: 'Primary',
    isParent: true, isExpanded: true, children,
  };
}

function mockResponse(): CustomerSearchResponse {
  return {
    totalCount: 6,
    data: [
      makeParent('P1', 'Jane Doe', [
        makeChild('P1-C1', 'Jane Doe Child 1'),
        makeChild('P1-C2', 'Jane Doe Child 2'),
      ]),
      makeParent('P2', 'John Smith', [
        makeChild('P2-C1', 'John Smith Jr.'),
      ]),
      {
        ...makeChild('P3', 'Bob Johnson'),
        isParent: false,
        children: [],
      },
    ],
  };
}

// ── Mock GridApi ───────────────────────────────────────────────────────────────

function makeMockGridApi() {
  const nodes = new Map<string, { data: any; selected: boolean }>();

  return {
    _nodes: nodes,
    forEachNode: jasmine.createSpy('forEachNode').and.callFake((cb: any) => {
      nodes.forEach(n => cb({
        data: n.data,
        isSelected: () => n.selected,
        setSelected: (v: boolean) => { n.selected = v; },
      }));
    }),
    getSelectedRows: jasmine.createSpy('getSelectedRows').and.callFake(() =>
      [...nodes.values()].filter(n => n.selected).map(n => n.data)
    ),
    applyTransaction: jasmine.createSpy('applyTransaction'),
    redrawRows: jasmine.createSpy('redrawRows'),
    _add(data: any, selected = false) { nodes.set(data._uid, { data, selected }); },
    _select(uid: string)   { const n = nodes.get(uid); if (n) n.selected = true; },
    _deselect(uid: string) { const n = nodes.get(uid); if (n) n.selected = false; },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('CustomerSearchComponent', () => {
  let component: CustomerSearchComponent;
  let fixture: ComponentFixture<CustomerSearchComponent>;
  let serviceSpy: jasmine.SpyObj<CustomerSearchService>;
  let mockApi: ReturnType<typeof makeMockGridApi>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('CustomerSearchService', ['getCustomers']);
    serviceSpy.getCustomers.and.returnValue(of(mockResponse()));

    await TestBed.configureTestingModule({
      imports: [CustomerSearchComponent, CommonModule],
      providers: [{ provide: CustomerSearchService, useValue: serviceSpy }],
    }).compileComponents();

    fixture   = TestBed.createComponent(CustomerSearchComponent);
    component = fixture.componentInstance;
    mockApi   = makeMockGridApi();
    (component as any).gridApi = mockApi;
  });

  // ── Initialisation ──────────────────────────────────────────────────────────

  describe('Initialisation', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should start with isLoading=true', () => {
      expect(component.isLoading).toBeTrue();
    });

    it('should call getCustomers on init', () => {
      fixture.detectChanges();
      expect(serviceSpy.getCustomers).toHaveBeenCalledTimes(1);
    });

    it('should set isLoading=false after data loads', () => {
      fixture.detectChanges();
      expect(component.isLoading).toBeFalse();
    });

    it('should populate rowData after load', () => {
      fixture.detectChanges();
      expect(component.rowData.length).toBeGreaterThan(0);
    });

    it('should set loadError=true on service error', () => {
      serviceSpy.getCustomers.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(component.loadError).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });

    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      spyOn((component as any).destroy$, 'next').and.callThrough();
      component.ngOnDestroy();
      expect((component as any).destroy$.next).toHaveBeenCalled();
    });
  });

  // ── stampTree ──────────────────────────────────────────────────────────────

  describe('stampTree', () => {

    beforeEach(() => fixture.detectChanges());

    it('should stamp _uid on root nodes', () => {
      const tree = (component as any).tree;
      expect(tree[0]._uid).toBe('r0');
      expect(tree[1]._uid).toBe('r1');
    });

    it('should stamp _uid on child nodes', () => {
      const tree = (component as any).tree;
      expect(tree[0].children[0]._uid).toBe('r0-0');
      expect(tree[0].children[1]._uid).toBe('r0-1');
    });

    it('should stamp _isParent=true for nodes with children', () => {
      const tree = (component as any).tree;
      expect(tree[0]._isParent).toBeTrue();
    });

    it('should stamp _isParent=false for leaf nodes', () => {
      const tree = (component as any).tree;
      expect(tree[0].children[0]._isParent).toBeFalse();
    });

    it('should stamp _selected=false on all nodes', () => {
      const tree = (component as any).tree;
      expect(tree[0]._selected).toBeFalse();
      expect(tree[0].children[0]._selected).toBeFalse();
    });

    it('should generate unique _uid for all nodes', () => {
      const uids: string[] = [];
      const collect = (nodes: any[]) =>
        nodes.forEach(n => { uids.push(n._uid); collect(n.children ?? []); });
      collect((component as any).tree);
      expect(new Set(uids).size).toBe(uids.length);
    });
  });

  // ── buildFlat ──────────────────────────────────────────────────────────────

  describe('buildFlat', () => {

    beforeEach(() => fixture.detectChanges());

    it('should include parent rows in rowData', () => {
      const names = component.rowData.map((r: any) => r.legalName);
      expect(names).toContain('Jane Doe');
      expect(names).toContain('John Smith');
    });

    it('should include all child rows in rowData', () => {
      const names = component.rowData.map((r: any) => r.legalName);
      expect(names).toContain('Jane Doe Child 1');
      expect(names).toContain('Jane Doe Child 2');
      expect(names).toContain('John Smith Jr.');
    });

    it('should place parent before its children', () => {
      const names = component.rowData.map((r: any) => r.legalName);
      expect(names.indexOf('Jane Doe')).toBeLessThan(names.indexOf('Jane Doe Child 1'));
    });

    it('should mark _isClusterEnd=true on last child of each parent', () => {
      const flat = component.rowData;
      const lastJaneDoeChild = flat.find((r: any) => r.legalName === 'Jane Doe Child 2');
      expect(lastJaneDoeChild?._isClusterEnd).toBeTrue();
    });

    it('should mark _isClusterEnd=false on non-last children', () => {
      const flat = component.rowData;
      const firstChild = flat.find((r: any) => r.legalName === 'Jane Doe Child 1');
      expect(firstChild?._isClusterEnd).toBeFalse();
    });

    it('should include standalone nodes without children', () => {
      const names = component.rowData.map((r: any) => r.legalName);
      expect(names).toContain('Bob Johnson');
    });
  });

  // ── getRowClass ────────────────────────────────────────────────────────────

  describe('getRowClass', () => {

    beforeEach(() => fixture.detectChanges());

    it('should return "row-parent" for parent nodes', () => {
      const node = { _isParent: true, _isClusterEnd: false };
      expect(component.getRowClass({ data: node } as any)).toBe('row-parent');
    });

    it('should return "row-child-item" for leaf nodes', () => {
      const node = { _isParent: false, _isClusterEnd: false };
      expect(component.getRowClass({ data: node } as any)).toBe('row-child-item');
    });

    it('should append "row-cluster-end" for cluster-end rows', () => {
      const node = { _isParent: false, _isClusterEnd: true };
      expect(component.getRowClass({ data: node } as any)).toContain('row-cluster-end');
    });

    it('should return "row-parent row-cluster-end" for cluster-end parent', () => {
      const node = { _isParent: true, _isClusterEnd: true };
      const cls = component.getRowClass({ data: node } as any);
      expect(cls).toContain('row-parent');
      expect(cls).toContain('row-cluster-end');
    });
  });

  // ── Selection: cascade down ────────────────────────────────────────────────

  describe('Selection — cascade down (parent → children)', () => {

    beforeEach(() => {
      fixture.detectChanges();
      component.rowData.forEach((r: any) => mockApi._add(r, false));
    });

    it('should select all children when parent is selected', () => {
      const tree = (component as any).tree as any[];
      const parent = tree[0]; // Jane Doe

      mockApi._select(parent._uid);
      component.onSelectionChanged();

      expect(parent.children[0]._selected).toBeTrue();
      expect(parent.children[1]._selected).toBeTrue();
    });

    it('should not affect other clusters when one parent is selected', () => {
      const tree = (component as any).tree as any[];
      const parent1 = tree[0];
      const parent2 = tree[1];

      mockApi._select(parent1._uid);
      component.onSelectionChanged();

      expect(parent2._selected).toBeFalse();
      expect(parent2.children[0]._selected).toBeFalse();
    });
  });

  // ── Selection: bubble up ───────────────────────────────────────────────────

  describe('Selection — bubble up (all children → parent)', () => {

    beforeEach(() => {
      fixture.detectChanges();
      component.rowData.forEach((r: any) => mockApi._add(r, false));
    });

    it('should auto-select parent when ALL children are selected', () => {
      const tree = (component as any).tree as any[];
      const parent = tree[0]; // Jane Doe — 2 children

      mockApi._select(parent.children[0]._uid);
      mockApi._select(parent.children[1]._uid);
      component.onSelectionChanged();

      expect(parent._selected).toBeTrue();
    });

    it('should NOT auto-select parent when only SOME children are selected', () => {
      const tree = (component as any).tree as any[];
      const parent = tree[0];

      mockApi._select(parent.children[0]._uid); // only first child
      component.onSelectionChanged();

      expect(parent._selected).toBeFalse();
    });

    it('should auto-select parent with single child when that child is selected', () => {
      const tree = (component as any).tree as any[];
      const parent = tree[1]; // John Smith — 1 child

      mockApi._select(parent.children[0]._uid);
      component.onSelectionChanged();

      expect(parent._selected).toBeTrue();
    });
  });

  // ── @Output selectionChanged ───────────────────────────────────────────────

  describe('@Output selectionChanged', () => {

    beforeEach(() => {
      fixture.detectChanges();
      component.rowData.forEach((r: any) => mockApi._add(r, false));
    });

    it('should emit selected rows', () => {
      const emitted: CustomerNode[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      const tree = (component as any).tree as any[];
      mockApi._select(tree[0].children[0]._uid);
      component.onSelectionChanged();

      expect(emitted.length).toBeGreaterThan(0);
    });

    it('should emit empty array when nothing is selected', () => {
      const emitted: CustomerNode[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      component.onSelectionChanged();

      expect(emitted[emitted.length - 1]).toEqual([]);
    });
  });

  // ── Column definitions ─────────────────────────────────────────────────────

  describe('Column definitions', () => {

    it('should define 8 columns', () => {
      expect(component.columnDefs.length).toBe(8);
    });

    it('should have Legal Name column with checkboxSelection=true', () => {
      const col = component.columnDefs.find(c => c.field === 'legalName');
      expect(col?.checkboxSelection).toBeTrue();
    });

    it('should have headerCheckboxSelection=true on Legal Name', () => {
      const col = component.columnDefs.find(c => c.field === 'legalName');
      expect(col?.headerCheckboxSelection).toBeTrue();
    });

    it('should render LEGAL HOLD pill for status column', () => {
      const col = component.columnDefs.find(c => c.field === 'status');
      const html = (col?.cellRenderer as Function)({ value: 'LEGAL HOLD' });
      expect(html).toContain('lh-pill');
    });

    it('should render N/A span for non-legal-hold status', () => {
      const col = component.columnDefs.find(c => c.field === 'status');
      const html = (col?.cellRenderer as Function)({ value: 'N/A' });
      expect(html).toContain('lh-na');
    });
  });

  // ── loadData retry ─────────────────────────────────────────────────────────

  describe('loadData retry', () => {

    it('should reload successfully after an error', () => {
      serviceSpy.getCustomers.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(component.loadError).toBeTrue();

      serviceSpy.getCustomers.and.returnValue(of(mockResponse()));
      component.loadData();

      expect(component.loadError).toBeFalse();
      expect(component.rowData.length).toBeGreaterThan(0);
    });
  });
});