import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import {
  CustomerSearchGridComponent,
  NameCellComponent,
  NameHeaderComponent,
  GridRow,
} from './customer-search-grid.component';
import { CustomerNode } from './customer-search.model';

// ─────────────────────────────────────────────────────────
// Helper factories
// ─────────────────────────────────────────────────────────
function makeGridRow(overrides: Partial<GridRow> = {}): GridRow {
  return {
    _uid: 'r0',
    _isParent: false,
    _expanded: false,
    _selected: false,
    _isClusterEnd: false,
    legalName: 'Test Name',
    ...overrides,
  };
}

/** Minimal CustomerNode[] for seeding the component via @Input */
const MOCK_DATA: CustomerNode[] = [
  {
    firstName: 'John', lastName: 'Doe', legalName: 'John Doe',
    ocifId: 'CS-0001', status: 'LEGAL HOLD', holdName: 'Hold A',
    lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W',
    customerStatus: 'Active', roleType: 'Primary',
    isParent: true, isExpanded: false,
    children: [
      {
        firstName: 'John', lastName: 'Doe', legalName: 'John Doe',
        ocifId: 'CS-0001', status: 'LEGAL HOLD', holdName: 'Hold A',
        lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W',
        customerStatus: 'Active', roleType: 'Primary',
        isParent: false, isExpanded: false, children: [],
      },
    ],
  },
  {
    firstName: 'Jane', lastName: 'Smith', legalName: 'Jane Smith',
    ocifId: 'CS-0002', status: 'N/A', holdName: '',
    lifecycle: 'Active Customer', role: 'Owner', address: '33 Dundas St W',
    customerStatus: 'Active', roleType: 'Secondary',
    isParent: false, isExpanded: false, children: [],
  },
];

// ═══════════════════════════════════════════════════════════
// NameCellComponent
// ═══════════════════════════════════════════════════════════
describe('NameCellComponent', () => {
  let comp: NameCellComponent;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    comp = new NameCellComponent(cdr);
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('agInit populates all properties from params', () => {
    const onCheck  = jasmine.createSpy('onCheck');
    const onToggle = jasmine.createSpy('onToggle');
    const row = makeGridRow({ _uid: 'abc', _isParent: true, _expanded: true, _selected: true });

    comp.agInit({
      value: 'Jane Doe',
      data: { ...row, isSuspect: true },
      onCheck,
      onToggle,
    } as any);

    expect(comp.name).toBe('Jane Doe');
    expect(comp.isParent).toBeTrue();
    expect(comp.expanded).toBeTrue();
    expect(comp.selected).toBeTrue();
    expect(comp.isSuspect).toBeTrue();
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('agInit handles missing value gracefully (defaults to empty string)', () => {
    comp.agInit({
      value: null,
      data: makeGridRow({ _uid: 'x' }),
      onCheck: jasmine.createSpy(),
      onToggle: jasmine.createSpy(),
    } as any);
    expect(comp.name).toBe('');
  });

  it('refresh re-syncs props and returns true', () => {
    const p = {
      value: 'Updated',
      data: makeGridRow({ _uid: 'u1', _selected: true }),
      onCheck: jasmine.createSpy(),
      onToggle: jasmine.createSpy(),
    } as any;

    comp.agInit(p);
    cdr.detectChanges.calls.reset();

    const result = comp.refresh(p);

    expect(result).toBeTrue();
    expect(comp.name).toBe('Updated');
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('onCheckClick stops propagation and invokes onCheck with the uid', () => {
    const onCheck = jasmine.createSpy('onCheck');
    comp.agInit({
      value: 'X',
      data: makeGridRow({ _uid: 'uid-check' }),
      onCheck,
      onToggle: jasmine.createSpy(),
    } as any);

    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    comp.onCheckClick(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onCheck).toHaveBeenCalledWith('uid-check');
  });

  it('onChevronClick stops propagation and invokes onToggle with the uid', () => {
    const onToggle = jasmine.createSpy('onToggle');
    comp.agInit({
      value: 'X',
      data: makeGridRow({ _uid: 'uid-toggle' }),
      onCheck: jasmine.createSpy(),
      onToggle,
    } as any);

    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    comp.onChevronClick(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledWith('uid-toggle');
  });

  it('onCheckClick does not throw when onCheck is not set', () => {
    // agInit never called — callbacks are undefined
    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    expect(() => comp.onCheckClick(event)).not.toThrow();
  });

  it('onChevronClick does not throw when onToggle is not set', () => {
    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    expect(() => comp.onChevronClick(event)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════
// NameHeaderComponent
// ═══════════════════════════════════════════════════════════
describe('NameHeaderComponent', () => {
  let comp: NameHeaderComponent;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    comp = new NameHeaderComponent(cdr);
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('agInit sets state from params', () => {
    comp.agInit({ state: 'some', onSelectAll: jasmine.createSpy() } as any);
    expect(comp.state).toBe('some');
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('agInit defaults state to "none" when param.state is absent', () => {
    comp.agInit({ onSelectAll: jasmine.createSpy() } as any);
    expect(comp.state).toBe('none');
  });

  it('refresh updates state and returns true', () => {
    comp.agInit({ state: 'none', onSelectAll: jasmine.createSpy() } as any);
    cdr.detectChanges.calls.reset();

    const result = comp.refresh({ state: 'all', onSelectAll: jasmine.createSpy() } as any);

    expect(result).toBeTrue();
    expect(comp.state).toBe('all');
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  it('onClick calls onSelectAll(true) when state is "none"', () => {
    const onSelectAll = jasmine.createSpy('onSelectAll');
    comp.agInit({ state: 'none', onSelectAll } as any);
    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    comp.onClick(event);
    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it('onClick calls onSelectAll(true) when state is "some"', () => {
    const onSelectAll = jasmine.createSpy('onSelectAll');
    comp.agInit({ state: 'some', onSelectAll } as any);
    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    comp.onClick(event);
    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it('onClick calls onSelectAll(false) when state is "all"', () => {
    const onSelectAll = jasmine.createSpy('onSelectAll');
    comp.agInit({ state: 'all', onSelectAll } as any);
    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    comp.onClick(event);
    expect(onSelectAll).toHaveBeenCalledWith(false);
  });
});

// ═══════════════════════════════════════════════════════════
// CustomerSearchGridComponent
// ═══════════════════════════════════════════════════════════
describe('CustomerSearchGridComponent', () => {
  let component: CustomerSearchGridComponent;
  let fixture: ComponentFixture<CustomerSearchGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CustomerSearchGridComponent,
        CommonModule,
        FormsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
      ],
    })
    // Override template to avoid ag-grid rendering in unit tests
    .overrideComponent(CustomerSearchGridComponent, {
      set: { template: '<div class="test-host"></div>' },
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerSearchGridComponent);
    component = fixture.componentInstance;
  });

  // ── Core instantiation ──────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('processes customerGridData on init when input is provided', () => {
    component.customerGridData = MOCK_DATA;
    component.ngOnInit();

    expect(component.rowData.length).toBeGreaterThan(0);
    expect(component.showChipsSection).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.currentPage).toBe(1);
  });

  it('does not process data on init when customerGridData is absent', () => {
    component.ngOnInit();
    expect(component.rowData.length).toBe(0);
    expect(component.isLoading).toBeTrue();
  });

  it('has correct default property values', () => {
    fixture.detectChanges();
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.isLoading).toBeTrue();
    expect(component.loadError).toBeFalse();
    expect(component.totalRows).toBe(0);
    expect(component.totalPages).toBe(1);
    expect(component.searchSummary).toBe('');
    expect(component.showChipsSection).toBeFalse();
  });

  it('initialises columnDefs with 8 columns', () => {
    fixture.detectChanges();
    expect(component.columnDefs.length).toBe(8);
  });

  it('first column uses NameCellComponent renderer and NameHeaderComponent', () => {
    fixture.detectChanges();
    const col = component.columnDefs[0];
    expect(col.cellRenderer).toBe(NameCellComponent);
    expect(col.headerComponent).toBe(NameHeaderComponent);
  });

  it('selectedFilterIds is initialised with all filterOption ids', () => {
    fixture.detectChanges();
    const allIds = component.filterOptions.map((o: any) => o.id);
    expect(component.selectedFilterIds).toEqual(allIds);
  });

  // ── Error handling ───────────────────────────────────────
  describe('handleError', () => {
    it('sets loadError=true and isLoading=false', () => {
      (component as any).handleError(new Error('api failure'));
      expect(component.loadError).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
  });

  // ── toggleExpand ─────────────────────────────────────────
  describe('toggleExpand()', () => {
    beforeEach(() => {
      component.customerGridData = MOCK_DATA;
      component.ngOnInit();
    });

    it('expanding a collapsed parent adds children to rowData', () => {
      const parent = component.tree[0];
      // ensure collapsed
      parent._expanded = false;
      (component as any).refresh();
      const collapsedCount = component.rowData.length;

      component.toggleExpand(parent._uid);

      expect(component.rowData.length).toBeGreaterThan(collapsedCount);
    });

    it('collapsing an expanded parent removes children from rowData', () => {
      const parent = component.tree[0];
      parent._expanded = true;
      (component as any).refresh();
      const expandedCount = component.rowData.length;

      component.toggleExpand(parent._uid);

      expect(component.rowData.length).toBeLessThan(expandedCount);
    });

    it('does nothing for an unknown uid', () => {
      const before = component.rowData.length;
      component.toggleExpand('non-existent-uid');
      expect(component.rowData.length).toBe(before);
    });
  });

  // ── getRowClass ──────────────────────────────────────────
  describe('getRowClass()', () => {
    it('returns "row-parent-expanded" for an expanded parent', () => {
      const row = makeGridRow({ _isParent: true, _expanded: true });
      expect(component.getRowClass({ data: row })).toBe('row-parent-expanded');
    });

    it('returns "row-parent-collapsed" for a collapsed parent', () => {
      const row = makeGridRow({ _isParent: true, _expanded: false });
      expect(component.getRowClass({ data: row })).toBe('row-parent-collapsed');
    });

    it('returns "row-child row-cluster-end" for last child in cluster', () => {
      const row = makeGridRow({ _isParent: false, _isClusterEnd: true });
      expect(component.getRowClass({ data: row })).toBe('row-child row-cluster-end');
    });

    it('returns "row-child" for a non-last child', () => {
      const row = makeGridRow({ _isParent: false, _isClusterEnd: false });
      expect(component.getRowClass({ data: row })).toBe('row-child');
    });
  });

  // ── onCheckboxClick ──────────────────────────────────────
  describe('onCheckboxClick()', () => {
    beforeEach(() => {
      component.customerGridData = MOCK_DATA;
      component.ngOnInit();
    });

    it('selecting a parent marks all its children as selected', () => {
      const parent = component.tree[0];
      parent._selected = false;
      (parent.children ?? []).forEach(c => (c._selected = false));

      component.onCheckboxClick(parent._uid);

      expect(parent._selected).toBeTrue();
      (parent.children ?? []).forEach(c => expect(c._selected).toBeTrue());
    });

    it('deselecting a parent marks all its children as deselected', () => {
      const parent = component.tree[0];
      parent._selected = true;
      (parent.children ?? []).forEach(c => (c._selected = true));

      component.onCheckboxClick(parent._uid);

      expect(parent._selected).toBeFalse();
      (parent.children ?? []).forEach(c => expect(c._selected).toBeFalse());
    });

    it('selecting all children of a parent marks parent as selected (bubble up)', () => {
      const parent = component.tree[0];
      const children = parent.children ?? [];
      // Pre-select all children except the last one
      children.slice(0, -1).forEach(c => (c._selected = true));
      parent._selected = false;

      // Select the last child — should bubble up to parent
      const lastChild = children[children.length - 1];
      component.onCheckboxClick(lastChild._uid);

      expect(parent._selected).toBeTrue();
    });

    it('deselecting one child of a selected parent deselects the parent', () => {
      const parent = component.tree[0];
      const children = parent.children ?? [];
      parent._selected = true;
      children.forEach(c => (c._selected = true));

      // Deselect first child
      component.onCheckboxClick(children[0]._uid);

      expect(parent._selected).toBeFalse();
    });

    it('emits selectionChanged after a checkbox click', () => {
      const emitSpy = spyOn(component.selectionChanged, 'emit');
      component.onCheckboxClick(component.tree[0]._uid);
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  // ── onSelectAll ──────────────────────────────────────────
  describe('onSelectAll()', () => {
    beforeEach(() => {
      component.customerGridData = MOCK_DATA;
      component.ngOnInit();
    });

    it('selects all nodes when select=true', () => {
      component.onSelectAll(true);
      const allNodes: GridRow[] = (component as any).allNodes();
      allNodes.forEach(n => expect(n._selected).toBeTrue());
    });

    it('deselects all nodes when select=false', () => {
      component.onSelectAll(true);
      component.onSelectAll(false);
      const allNodes: GridRow[] = (component as any).allNodes();
      allNodes.forEach(n => expect(n._selected).toBeFalse());
    });
  });

  // ── selectionChanged output ──────────────────────────────
  describe('selectionChanged output', () => {
    beforeEach(() => {
      component.customerGridData = MOCK_DATA;
      component.ngOnInit();
    });

    it('emits with identifier "customer"', () => {
      const emitSpy = spyOn(component.selectionChanged, 'emit');
      component.onSelectAll(true);
      expect(emitSpy.calls.mostRecent().args[0].identifier).toBe('customer');
    });

    it('emits selected array with all nodes when all are selected', () => {
      const emitSpy = spyOn(component.selectionChanged, 'emit');
      component.onSelectAll(true);
      const { selected } = emitSpy.calls.mostRecent().args[0];
      expect(selected.length).toBeGreaterThan(0);
    });

    it('emits empty selected array when no nodes are selected', () => {
      const emitSpy = spyOn(component.selectionChanged, 'emit');
      component.onSelectAll(false);
      const { selected } = emitSpy.calls.mostRecent().args[0];
      expect(selected.length).toBe(0);
    });
  });

  // ── pagination ───────────────────────────────────────────
  describe('pagination', () => {
    beforeEach(() => {
      component.customerGridData = MOCK_DATA;
      component.ngOnInit();
    });

    it('goPage ignores page < 1', () => {
      component.currentPage = 1;
      component.goPage(0);
      expect(component.currentPage).toBe(1);
    });

    it('goPage ignores page > totalPages', () => {
      component.totalPages = 3;
      component.currentPage = 1;
      component.goPage(99);
      expect(component.currentPage).toBe(1);
    });

    it('goPage ignores the current page (no re-render)', () => {
      component.totalPages = 5;
      component.currentPage = 2;
      const refreshSpy = spyOn<any>(component, 'refresh').and.callThrough();
      component.goPage(2);
      expect(refreshSpy).not.toHaveBeenCalled();
    });

    it('goPage navigates to a valid page', () => {
      component.totalPages = 5;
      component.goPage(3);
      expect(component.currentPage).toBe(3);
    });

    it('onPageSizeChange resets currentPage to 1', () => {
      component.currentPage = 4;
      component.onPageSizeChange();
      expect(component.currentPage).toBe(1);
    });

    it('buildPageNumbers returns full list when totalPages <= 7', () => {
      component.totalPages = 5;
      component.currentPage = 3;
      const pages = (component as any).buildPageNumbers();
      expect(pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('buildPageNumbers includes "…" for large page counts', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      const pages: (number | string)[] = (component as any).buildPageNumbers();
      expect(pages).toContain('…');
    });

    it('buildPageNumbers always starts with page 1 and ends with totalPages', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      const pages: (number | string)[] = (component as any).buildPageNumbers();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
    });

    it('paginationFrom returns 0 when there are no rows', () => {
      component.totalRows = 0;
      expect(component.paginationFrom).toBe(0);
    });

    it('paginationTo does not exceed totalRows', () => {
      component.totalRows = 3;
      component.pageSize = 10;
      component.currentPage = 1;
      expect(component.paginationTo).toBe(3);
    });
  });

  // ── syncHeaderCheckbox ───────────────────────────────────
  describe('syncHeaderCheckbox()', () => {
    beforeEach(() => {
      component.customerGridData = MOCK_DATA;
      component.ngOnInit();
    });

    it('sets header state to "none" when no nodes are selected', () => {
      component.onSelectAll(false);
      (component as any).syncHeaderCheckbox();
      expect(component.columnDefs[0].headerComponentParams.state).toBe('none');
    });

    it('sets header state to "all" when all nodes are selected', () => {
      component.onSelectAll(true);
      (component as any).syncHeaderCheckbox();
      expect(component.columnDefs[0].headerComponentParams.state).toBe('all');
    });

    it('sets header state to "some" when some nodes are selected', () => {
      const allNodes: GridRow[] = (component as any).allNodes();
      allNodes[0]._selected = true;
      allNodes.slice(1).forEach(n => (n._selected = false));
      (component as any).syncHeaderCheckbox();
      expect(component.columnDefs[0].headerComponentParams.state).toBe('some');
    });
  });

  // ── filter / column visibility ───────────────────────────
  describe('column filter (syncColumns / removeFilter / resetFilters)', () => {
    beforeEach(() => {
      component.customerGridData = MOCK_DATA;
      component.ngOnInit();
      // Provide a mock gridApi
      (component as any).gridApi = {
        setColumnVisible: jasmine.createSpy('setColumnVisible'),
        sizeColumnsToFit: jasmine.createSpy('sizeColumnsToFit'),
        refreshHeader: jasmine.createSpy('refreshHeader'),
      };
    });

    it('removeFilter removes the id from selectedFilterIds', () => {
      const before = component.selectedFilterIds.length;
      const idToRemove = component.filterOptions[0].id;
      component.removeFilter(idToRemove);
      expect(component.selectedFilterIds.length).toBe(before - 1);
      expect(component.selectedFilterIds).not.toContain(idToRemove);
    });

    it('resetFilters restores all filter ids', () => {
      component.removeFilter(component.filterOptions[0].id);
      component.resetFilters();
      expect(component.selectedFilterIds.length).toBe(component.filterOptions.length);
    });

    it('syncColumns calls setColumnVisible for each filter option', () => {
      (component as any).syncColumns();
      const spy = (component as any).gridApi.setColumnVisible;
      expect(spy.calls.count()).toBe(component.filterOptions.length);
    });
  });

  // ── ngOnDestroy ──────────────────────────────────────────
  describe('ngOnDestroy()', () => {
    it('completes the destroy$ subject without throwing', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ── onGridReady ──────────────────────────────────────────
  describe('onGridReady()', () => {
    it('stores the grid API reference', () => {
      const mockApi = { sizeColumnsToFit: jasmine.createSpy() } as any;
      component.onGridReady({ api: mockApi } as any);
      expect((component as any).gridApi).toBe(mockApi);
    });
  });
});