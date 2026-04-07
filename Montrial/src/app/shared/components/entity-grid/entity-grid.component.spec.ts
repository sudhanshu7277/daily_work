import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { EntityGridComponent } from './entity-grid.component';
import { EntityGridService } from './entity-grid.service';
import { EntityGridResponse, EntityNode } from './entity-grid.model';

// ── Helpers ────────────────────────────────────────────────────────────────────

const addr = '33 Dundas St W, Toronto, ON M5G 2C3';

function makeLeaf(id: string, name: string): EntityNode {
  return {
    ocifId: id, profileName: name, legalHoldStatus: 'N/A', holdName: '',
    lifecycle: 'Active Customer', role: 'Owner', address: addr,
    isParent: false, isExpanded: false, children: [],
  };
}

function makeParent(id: string, name: string, children: EntityNode[], expanded = true): EntityNode {
  return {
    ocifId: id, profileName: name, legalHoldStatus: 'N/A', holdName: '',
    lifecycle: 'Active Customer', role: 'Owner', address: addr,
    isParent: true, isExpanded: expanded, children,
  };
}

/** Minimal mock response used in most tests */
function mockResponse(): EntityGridResponse {
  return {
    totalCount: 5,
    data: [
      makeParent('C1', 'Corp 1', [
        makeLeaf('C1-L1', 'Role Player A'),
        makeLeaf('C1-L2', 'Role Player B'),
      ]),
      makeParent('C2', 'Corp 2', [
        makeParent('C2-P1', 'Sub Corp', [
          makeLeaf('C2-P1-L1', 'Deep Leaf'),
        ]),
      ]),
    ],
  };
}

// ── Mock GridApi ────────────────────────────────────────────────────────────────

function makeMockGridApi() {
  const nodes: Map<string, { data: any; selected: boolean }> = new Map();

  return {
    _nodes: nodes,
    forEachNode: jasmine.createSpy('forEachNode').and.callFake((cb: any) => {
      nodes.forEach((node) => cb({ data: node.data, isSelected: () => node.selected, setSelected: (v: boolean) => { node.selected = v; } }));
    }),
    getSelectedRows: jasmine.createSpy('getSelectedRows').and.callFake(() =>
      [...nodes.values()].filter(n => n.selected).map(n => n.data)
    ),
    applyTransaction: jasmine.createSpy('applyTransaction'),
    setSelected: jasmine.createSpy('setSelected'),
    _addNode(data: any, selected = false) {
      nodes.set(data._uid, { data, selected });
    },
    _selectByUid(uid: string) {
      const n = nodes.get(uid);
      if (n) n.selected = true;
    },
    _deselectByUid(uid: string) {
      const n = nodes.get(uid);
      if (n) n.selected = false;
    },
  };
}

// ── Test Suite ─────────────────────────────────────────────────────────────────

describe('EntityGridComponent', () => {
  let component: EntityGridComponent;
  let fixture: ComponentFixture<EntityGridComponent>;
  let serviceSpy: jasmine.SpyObj<EntityGridService>;
  let mockGridApi: ReturnType<typeof makeMockGridApi>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<EntityGridService>('EntityGridService', ['getEntityGrid']);
    serviceSpy.getEntityGrid.and.returnValue(of(mockResponse()));

    await TestBed.configureTestingModule({
      imports: [EntityGridComponent, CommonModule],
      providers: [
        { provide: EntityGridService, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityGridComponent);
    component = fixture.componentInstance;
    mockGridApi = makeMockGridApi();

    // Inject the mock grid api
    (component as any).gridApi = mockGridApi;
  });

  // ── Component initialisation ─────────────────────────────────────────────────

  describe('Initialisation', () => {

    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should start with isLoading=true and loadError=false', () => {
      // Before ngOnInit
      const fresh = TestBed.createComponent(EntityGridComponent);
      expect(fresh.componentInstance.isLoading).toBeTrue();
      expect(fresh.componentInstance.loadError).toBeFalse();
    });

    it('should call getEntityGrid on init', () => {
      fixture.detectChanges(); // triggers ngOnInit
      expect(serviceSpy.getEntityGrid).toHaveBeenCalledTimes(1);
    });

    it('should set isLoading=false after data loads', () => {
      fixture.detectChanges();
      expect(component.isLoading).toBeFalse();
    });

    it('should populate rowData after successful load', () => {
      fixture.detectChanges();
      expect(component.rowData.length).toBeGreaterThan(0);
    });

    it('should set loadError=true and isLoading=false on service error', () => {
      serviceSpy.getEntityGrid.and.returnValue(throwError(() => new Error('API error')));
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

  // ── stampTree ────────────────────────────────────────────────────────────────

  describe('stampTree', () => {

    beforeEach(() => fixture.detectChanges());

    it('should stamp _uid on every node', () => {
      const tree = (component as any).tree;
      expect(tree[0]._uid).toBe('r0');
      expect(tree[1]._uid).toBe('r1');
    });

    it('should stamp correct _level — roots at 0', () => {
      const tree = (component as any).tree;
      expect(tree[0]._level).toBe(0);
      expect(tree[1]._level).toBe(0);
    });

    it('should stamp _level=1 for direct children', () => {
      const tree = (component as any).tree;
      expect(tree[0].children[0]._level).toBe(1);
    });

    it('should stamp _level=2 for grandchildren', () => {
      const tree = (component as any).tree;
      // Corp 2 → Sub Corp (L1) → Deep Leaf (L2)
      expect(tree[1].children[0].children[0]._level).toBe(2);
    });

    it('should stamp _isParent=true for nodes with children', () => {
      const tree = (component as any).tree;
      expect(tree[0]._isParent).toBeTrue();
    });

    it('should stamp _isParent=false for leaf nodes', () => {
      const tree = (component as any).tree;
      expect(tree[0].children[0]._isParent).toBeFalse();
    });

    it('should stamp _selected=false on all nodes initially', () => {
      const tree = (component as any).tree;
      expect(tree[0]._selected).toBeFalse();
      expect(tree[0].children[0]._selected).toBeFalse();
    });

    it('should stamp _expanded=true for parent nodes', () => {
      const tree = (component as any).tree;
      expect(tree[0]._expanded).toBeTrue();
    });

    it('should stamp _expanded=false for leaf nodes', () => {
      const tree = (component as any).tree;
      expect(tree[0].children[0]._expanded).toBeFalse();
    });

    it('should generate unique _uid for every node in the tree', () => {
      const allUids: string[] = [];
      const collect = (nodes: any[]) => nodes.forEach(n => { allUids.push(n._uid); if (n.children?.length) collect(n.children); });
      collect((component as any).tree);
      const unique = new Set(allUids);
      expect(unique.size).toBe(allUids.length);
    });
  });

  // ── buildFlat ─────────────────────────────────────────────────────────────────

  describe('buildFlat', () => {

    beforeEach(() => fixture.detectChanges());

    it('should include all expanded nodes in rowData', () => {
      // Both root nodes are expanded, so all descendants should appear
      const names = component.rowData.map((r: any) => r.profileName);
      expect(names).toContain('Corp 1');
      expect(names).toContain('Role Player A');
      expect(names).toContain('Role Player B');
      expect(names).toContain('Corp 2');
      expect(names).toContain('Sub Corp');
      expect(names).toContain('Deep Leaf');
    });

    it('should NOT include children of collapsed nodes', () => {
      // Collapse Corp 1
      (component as any).tree[0]._expanded = false;
      const flat = (component as any).buildFlat((component as any).tree);
      const names = flat.map((r: any) => r.profileName);
      expect(names).not.toContain('Role Player A');
      expect(names).not.toContain('Role Player B');
      expect(names).toContain('Corp 1'); // root still shows
    });

    it('should mark the last row of each cluster as _isClusterEnd=true', () => {
      const flat = component.rowData;
      // Last child of Corp 1 cluster should be marked
      const rolePlayerB = flat.find((r: any) => r.profileName === 'Role Player B');
      expect(rolePlayerB?._isClusterEnd).toBeTrue();
    });

    it('should mark the last row of the last cluster as _isClusterEnd=true', () => {
      const flat = component.rowData;
      const last = flat[flat.length - 1];
      expect(last._isClusterEnd).toBeTrue();
    });

    it('should NOT mark non-last rows as _isClusterEnd', () => {
      const flat = component.rowData;
      const corp1 = flat.find((r: any) => r.profileName === 'Corp 1');
      expect(corp1?._isClusterEnd).toBeFalse();
    });

    it('should return rows in correct tree order', () => {
      const names = component.rowData.map((r: any) => r.profileName);
      const corp1Idx      = names.indexOf('Corp 1');
      const rolePlayerIdx = names.indexOf('Role Player A');
      const corp2Idx      = names.indexOf('Corp 2');
      expect(corp1Idx).toBeLessThan(rolePlayerIdx);
      expect(rolePlayerIdx).toBeLessThan(corp2Idx);
    });
  });

  // ── getRowClass ───────────────────────────────────────────────────────────────

  describe('getRowClass', () => {

    beforeEach(() => fixture.detectChanges());

    it('should return "row-root" for level-0 rows', () => {
      const node = { _level: 0, _isParent: true, _isClusterEnd: false };
      expect(component.getRowClass({ data: node } as any)).toBe('row-root');
    });

    it('should append "row-cluster-end" for cluster-end root rows', () => {
      const node = { _level: 0, _isParent: true, _isClusterEnd: true };
      expect(component.getRowClass({ data: node } as any)).toContain('row-cluster-end');
    });

    it('should return "row-child row-child-l1 row-is-parent" for level-1 parent', () => {
      const node = { _level: 1, _isParent: true, _isClusterEnd: false };
      const cls = component.getRowClass({ data: node } as any);
      expect(cls).toContain('row-child');
      expect(cls).toContain('row-child-l1');
      expect(cls).toContain('row-is-parent');
    });

    it('should return "row-is-leaf" for level-1 leaf', () => {
      const node = { _level: 1, _isParent: false, _isClusterEnd: false };
      expect(component.getRowClass({ data: node } as any)).toContain('row-is-leaf');
    });

    it('should return "row-is-leaf" for level-3 leaf', () => {
      const node = { _level: 3, _isParent: false, _isClusterEnd: false };
      const cls = component.getRowClass({ data: node } as any);
      expect(cls).toContain('row-child-l3');
      expect(cls).toContain('row-is-leaf');
    });

    it('should cap level class at l10 for very deep nodes', () => {
      const node = { _level: 15, _isParent: false, _isClusterEnd: false };
      expect(component.getRowClass({ data: node } as any)).toContain('row-child-l10');
    });
  });

  // ── Selection: cascade down ───────────────────────────────────────────────────

  describe('Selection — cascade down (parent → children)', () => {

    beforeEach(() => {
      fixture.detectChanges();
      // Seed the mock grid api with all visible rows
      component.rowData.forEach((r: any) => mockGridApi._addNode(r, false));
    });

    it('should select all descendants when a parent is selected', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];

      // Simulate user selecting Corp 1
      mockGridApi._selectByUid(corp1._uid);
      component.onSelectionChanged();

      expect(corp1.children[0]._selected).toBeTrue();  // Role Player A
      expect(corp1.children[1]._selected).toBeTrue();  // Role Player B
    });

    it('should deselect all descendants when a parent is deselected', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];

      // First select everything
      corp1._selected = true;
      corp1.children.forEach((c: any) => c._selected = true);

      // Now deselect the parent
      mockGridApi._deselectByUid(corp1._uid);
      component.onSelectionChanged();

      expect(corp1.children[0]._selected).toBeFalse();
      expect(corp1.children[1]._selected).toBeFalse();
    });

    it('should cascade selection through multiple levels', () => {
      const tree = (component as any).tree as any[];
      const corp2   = tree[1];               // L0
      const subCorp = corp2.children[0];     // L1 — is a parent
      const deepLeaf = subCorp.children[0];  // L2

      mockGridApi._selectByUid(corp2._uid);
      component.onSelectionChanged();

      expect(subCorp._selected).toBeTrue();
      expect(deepLeaf._selected).toBeTrue();
    });

    it('should NOT affect sibling clusters when selecting one parent', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];
      const corp2 = tree[1];

      mockGridApi._selectByUid(corp1._uid);
      component.onSelectionChanged();

      // Corp 2 and its children must remain unselected
      expect(corp2._selected).toBeFalse();
      expect(corp2.children[0]._selected).toBeFalse();
    });
  });

  // ── Selection: bubble up ──────────────────────────────────────────────────────

  describe('Selection — bubble up (all children → parent)', () => {

    beforeEach(() => {
      fixture.detectChanges();
      component.rowData.forEach((r: any) => mockGridApi._addNode(r, false));
    });

    it('should auto-select parent when ALL children are selected', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];

      // Select both children
      mockGridApi._selectByUid(corp1.children[0]._uid);
      mockGridApi._selectByUid(corp1.children[1]._uid);
      component.onSelectionChanged();

      expect(corp1._selected).toBeTrue();
    });

    it('should NOT auto-select parent when only SOME children are selected', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];

      // Select only one child
      mockGridApi._selectByUid(corp1.children[0]._uid);
      component.onSelectionChanged();

      expect(corp1._selected).toBeFalse();
    });

    it('should auto-deselect parent when a child is deselected', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];

      // Select all, then remove one
      corp1._selected = true;
      corp1.children.forEach((c: any) => { c._selected = true; mockGridApi._selectByUid(c._uid); });
      mockGridApi._deselectByUid(corp1.children[0]._uid);

      component.onSelectionChanged();

      expect(corp1._selected).toBeFalse();
    });
  });

  // ── selectionChanged Output ────────────────────────────────────────────────

  describe('@Output selectionChanged', () => {

    beforeEach(() => {
      fixture.detectChanges();
      component.rowData.forEach((r: any) => mockGridApi._addNode(r, false));
    });

    it('should emit selected rows via selectionChanged output', () => {
      const emitted: EntityNode[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      const tree = (component as any).tree as any[];
      mockGridApi._selectByUid(tree[0].children[0]._uid);
      component.onSelectionChanged();

      expect(emitted.length).toBeGreaterThan(0);
    });

    it('should emit empty array when all rows are deselected', () => {
      const emitted: EntityNode[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      // Nothing selected — trigger change
      component.onSelectionChanged();

      const lastEmit = emitted[emitted.length - 1];
      expect(lastEmit).toEqual([]);
    });
  });

  // ── Expand / Collapse ──────────────────────────────────────────────────────

  describe('Expand / Collapse (onCellClicked)', () => {

    beforeEach(() => fixture.detectChanges());

    it('should collapse a parent row and remove children from rowData', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];
      const initialLength = component.rowData.length;

      // Simulate cell click on Corp 1
      component.onCellClicked({
        colDef: { field: 'profileName' },
        data: corp1,
        event: { target: document.createElement('span') },
      } as any);

      expect(corp1._expanded).toBeFalse();
      expect(component.rowData.length).toBeLessThan(initialLength);
    });

    it('should expand a collapsed parent and add children to rowData', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];

      // First collapse
      corp1._expanded = false;
      component.rowData = (component as any).buildFlat(tree);
      const collapsedLength = component.rowData.length;

      // Now expand via click
      component.onCellClicked({
        colDef: { field: 'profileName' },
        data: corp1,
        event: { target: document.createElement('span') },
      } as any);

      expect(corp1._expanded).toBeTrue();
      expect(component.rowData.length).toBeGreaterThan(collapsedLength);
    });

    it('should NOT toggle when clicking a non-profileName column', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];
      const wasExpanded = corp1._expanded;

      component.onCellClicked({
        colDef: { field: 'ocifId' },
        data: corp1,
        event: { target: document.createElement('span') },
      } as any);

      expect(corp1._expanded).toBe(wasExpanded);
    });

    it('should NOT toggle when clicking the checkbox', () => {
      const tree = (component as any).tree as any[];
      const corp1 = tree[0];
      const wasExpanded = corp1._expanded;

      const checkbox = document.createElement('div');
      checkbox.className = 'ag-selection-checkbox';

      component.onCellClicked({
        colDef: { field: 'profileName' },
        data: corp1,
        event: { target: checkbox },
      } as any);

      expect(corp1._expanded).toBe(wasExpanded);
    });

    it('should NOT toggle when clicking a leaf node', () => {
      const tree = (component as any).tree as any[];
      const leaf = tree[0].children[0]; // Role Player A

      component.onCellClicked({
        colDef: { field: 'profileName' },
        data: leaf,
        event: { target: document.createElement('span') },
      } as any);

      // No error, no state change — just silently returns
      expect(leaf._expanded).toBeFalse();
    });
  });

  // ── loadData retry ──────────────────────────────────────────────────────────

  describe('loadData retry', () => {

    it('should reset loadError and reload when loadData is called again', () => {
      serviceSpy.getEntityGrid.and.returnValue(throwError(() => new Error('fail')));
      fixture.detectChanges();
      expect(component.loadError).toBeTrue();

      // Now fix the service and retry
      serviceSpy.getEntityGrid.and.returnValue(of(mockResponse()));
      component.loadData();

      expect(component.loadError).toBeFalse();
      expect(component.isLoading).toBeFalse();
      expect(component.rowData.length).toBeGreaterThan(0);
    });
  });

  // ── Column definitions ──────────────────────────────────────────────────────

  describe('Column definitions', () => {

    it('should define 7 columns', () => {
      expect(component.columnDefs.length).toBe(7);
    });

    it('should have Profile Name column with checkboxSelection=true', () => {
      const profileCol = component.columnDefs.find(c => c.field === 'profileName');
      expect(profileCol?.checkboxSelection).toBeTrue();
    });

    it('should have headerCheckboxSelection=true on Profile Name', () => {
      const profileCol = component.columnDefs.find(c => c.field === 'profileName');
      expect(profileCol?.headerCheckboxSelection).toBeTrue();
    });

    it('should apply dynamic padding-left indentation via cellStyle', () => {
      const profileCol = component.columnDefs.find(c => c.field === 'profileName');
      const style = (profileCol?.cellStyle as Function)({ data: { _level: 2 } });
      expect(style['padding-left']).toBe('48px'); // 8 + (2 × 20)
    });

    it('should apply 8px padding for level 0', () => {
      const profileCol = component.columnDefs.find(c => c.field === 'profileName');
      const style = (profileCol?.cellStyle as Function)({ data: { _level: 0 } });
      expect(style['padding-left']).toBe('8px');
    });

    it('should render LEGAL HOLD pill for legalHoldStatus column', () => {
      const lhCol = component.columnDefs.find(c => c.field === 'legalHoldStatus');
      const html = (lhCol?.cellRenderer as Function)({ value: 'LEGAL HOLD' });
      expect(html).toContain('lh-pill');
      expect(html).toContain('LEGAL HOLD');
    });

    it('should render N/A span for non-legal-hold status', () => {
      const lhCol = component.columnDefs.find(c => c.field === 'legalHoldStatus');
      const html = (lhCol?.cellRenderer as Function)({ value: 'N/A' });
      expect(html).toContain('lh-na');
    });
  });
});
