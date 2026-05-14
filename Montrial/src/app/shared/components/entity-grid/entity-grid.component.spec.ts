import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { EntityGridComponent } from './entity-grid.component';
import { EntityGridService } from '../../shared/services/entity-grid.service';
import { EntityNode, EntityRowNode, EntitySelectionEvent } from './entity-grid.model';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeNode(overrides: Partial<EntityNode> = {}): EntityNode {
  return {
    ocifId: 'OC-001',
    profileName: 'Test Profile',
    legalHoldStatus: 'N/A',
    holdName: '',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: '123 Main St',
    isParent: false,
    isExpanded: false,
    isSuspect: false,
    children: [],
    ...overrides,
  };
}

function makeTree(): EntityNode[] {
  return [
    makeNode({
      ocifId: 'OC-ROOT',
      profileName: 'Root Entity',
      isParent: true,
      isExpanded: true,
      children: [
        makeNode({
          ocifId: 'OC-CHILD-1',
          profileName: 'Child Entity 1',
          isParent: true,
          isExpanded: true,
          children: [
            makeNode({ ocifId: 'OC-GRANDCHILD', profileName: 'Grandchild Entity' }),
          ],
        }),
        makeNode({ ocifId: 'OC-CHILD-2', profileName: 'Child Entity 2' }),
      ],
    }),
    makeNode({ ocifId: 'OC-STANDALONE', profileName: 'Standalone Entity' }),
  ];
}

/** Minimal GridApi mock — extend per test as needed. */
function makeGridApi(overrides: Partial<any> = {}): any {
  return {
    setColumnVisible: jest.fn(),
    sizeColumnsToFit: jest.fn(),
    applyTransaction: jest.fn(),
    redrawRows: jest.fn(),
    forEachNode: jest.fn(),
    getSelectedRows: jest.fn().mockReturnValue([]),
    paginationGetCurrentPage: jest.fn().mockReturnValue(0),
    paginationGetTotalPages: jest.fn().mockReturnValue(1),
    paginationGetRowCount: jest.fn().mockReturnValue(0),
    paginationGoToPage: jest.fn(),
    updateGridOptions: jest.fn(),
    ...overrides,
  };
}

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('EntityGridComponent', () => {
  let component: EntityGridComponent;
  let fixture: ComponentFixture<EntityGridComponent>;
  let serviceSpy: jest.Mocked<EntityGridService>;

  const treeData = makeTree();

  beforeEach(async () => {
    serviceSpy = {
      getEntityGrid: jest.fn().mockReturnValue(
        of({ data: treeData, totalCount: 5 })
      ),
    } as any;

    await TestBed.configureTestingModule({
      imports: [EntityGridComponent],
      providers: [{ provide: EntityGridService, useValue: serviceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit → loadData
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  describe('creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialise signals with sensible defaults', () => {
      // After loadData resolves:
      expect(component.isLoading()).toBe(false);
      expect(component.loadError()).toBe(false);
      expect(component.pageSize()).toBe(20);
      expect(component.currentPage()).toBe(1);
      expect(component.totalPages()).toBe(1);
      expect(component.totalRows()).toBe(0);
    });

    it('should start with all filter options selected', () => {
      expect(component.selectedFilterIds).toEqual(
        component.filterOptions.map((o) => o.id)
      );
    });

    it('should expose the expected filter options', () => {
      const ids = component.filterOptions.map((o) => o.id);
      expect(ids).toEqual([
        'ocifId',
        'legalHoldStatus',
        'holdName',
        'lifecycle',
        'role',
        'address',
      ]);
    });
  });

  // ── loadData ──────────────────────────────────────────────────────────────

  describe('loadData()', () => {
    it('should call EntityGridService.getEntityGrid', () => {
      expect(serviceSpy.getEntityGrid).toHaveBeenCalledTimes(1);
    });

    it('should set isLoading false and showChipsSection true on success', () => {
      expect(component.isLoading()).toBe(false);
      expect(component.showChipsSection()).toBe(true);
    });

    it('should populate rowData signal with flat nodes', () => {
      // 2 root + 2 children + 1 grandchild = 5 nodes visible (roots expanded)
      expect(component.rowData().length).toBeGreaterThan(0);
    });

    it('should set loadError true and isLoading false on service error', () => {
      serviceSpy.getEntityGrid.mockReturnValue(throwError(() => new Error('500')));
      component.loadData();
      fixture.detectChanges();

      expect(component.loadError()).toBe(true);
      expect(component.isLoading()).toBe(false);
    });

    it('should reset loadError to false before each new load attempt', () => {
      // First load succeeded — now force an error then reload
      serviceSpy.getEntityGrid.mockReturnValue(throwError(() => new Error('err')));
      component.loadData();
      expect(component.loadError()).toBe(true);

      // Now restore success and reload
      serviceSpy.getEntityGrid.mockReturnValue(
        of({ data: treeData, totalCount: 5 })
      );
      component.loadData();
      expect(component.loadError()).toBe(false);
    });
  });

  // ── stampTree (via rowData inspection) ───────────────────────────────────

  describe('stampTree (internal, tested via rowData)', () => {
    function getTree(comp: EntityGridComponent): EntityRowNode[] {
      // Access private tree via any cast
      return (comp as any).tree as EntityRowNode[];
    }

    it('should assign _level 0 to root nodes', () => {
      const roots = getTree(component).filter((n: any) => n._level === 0);
      expect(roots.length).toBe(2); // root + standalone
    });

    it('should assign _level 1 to direct children', () => {
      const level1 = (getTree(component)[0] as any).children.filter(
        (n: any) => n._level === 1
      );
      expect(level1.length).toBe(2);
    });

    it('should assign _level 2 to grandchildren', () => {
      const grandchild = (getTree(component)[0] as any).children[0].children[0];
      expect((grandchild as any)._level).toBe(2);
    });

    it('should set _isParent true for nodes with children', () => {
      const root = getTree(component)[0] as any;
      expect(root._isParent).toBe(true);
    });

    it('should set _isParent false for leaf nodes', () => {
      const standalone = getTree(component)[1] as any;
      expect(standalone._isParent).toBe(false);
    });

    it('should generate unique _uid for every node', () => {
      const flat: any[] = component.rowData();
      const uids = flat.map((n) => n._uid);
      expect(new Set(uids).size).toBe(uids.length);
    });

    it('should initialise _selected to false', () => {
      component.rowData().forEach((n: any) => expect(n._selected).toBe(false));
    });

    it('should set _expanded based on isExpanded for parent nodes', () => {
      const root = getTree(component)[0] as any;
      expect(root._expanded).toBe(true); // makeTree sets isExpanded: true for root
    });

    it('should store child nodes in uidMap', () => {
      const uidMap: Map<string, any> = (component as any).uidMap;
      expect(uidMap.size).toBeGreaterThan(0);
    });
  });

  // ── buildFlat ─────────────────────────────────────────────────────────────

  describe('buildFlat (internal)', () => {
    function buildFlat(comp: EntityGridComponent, nodes: EntityRowNode[]): EntityRowNode[] {
      return (comp as any).buildFlat(nodes);
    }

    it('should include root nodes', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const flat = buildFlat(component, tree);
      expect(flat.some((n: any) => n._level === 0)).toBe(true);
    });

    it('should include expanded children', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const flat = buildFlat(component, tree);
      // Root is expanded, so children at level 1 must appear
      expect(flat.some((n: any) => n._level === 1)).toBe(true);
    });

    it('should NOT include children of collapsed parents', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      // Collapse the root
      (tree[0] as any)._expanded = false;
      const flat = buildFlat(component, tree);
      expect(flat.every((n: any) => n._level === 0)).toBe(true);
    });

    it('should mark _isClusterEnd on the last node of each root cluster', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const flat = buildFlat(component, tree);
      // The standalone entity (last node of its cluster) must be isClusterEnd
      const standalone = flat.find((n: any) => n.ocifId === 'OC-STANDALONE');
      expect((standalone as any)?._isClusterEnd).toBe(true);
    });
  });

  // ── Filter methods ────────────────────────────────────────────────────────

  describe('filter methods', () => {
    beforeEach(() => {
      // Simulate grid ready so syncColumns works
      (component as any).gridApi = makeGridApi();
    });

    describe('activeFilters getter', () => {
      it('should return all options when all are selected', () => {
        expect(component.activeFilters.length).toBe(component.filterOptions.length);
      });

      it('should return only selected options', () => {
        component.selectedFilterIds = ['ocifId', 'role'];
        expect(component.activeFilters.map((o) => o.id)).toEqual(['ocifId', 'role']);
      });
    });

    describe('removeFilter()', () => {
      it('should remove the given id from selectedFilterIds', () => {
        component.removeFilter('ocifId');
        expect(component.selectedFilterIds).not.toContain('ocifId');
      });

      it('should call syncColumns after removing', () => {
        const spy = jest.spyOn(component as any, 'syncColumns');
        component.removeFilter('role');
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('resetFilters()', () => {
      it('should restore all filter ids', () => {
        component.selectedFilterIds = ['ocifId'];
        component.resetFilters();
        expect(component.selectedFilterIds).toEqual(
          component.filterOptions.map((o) => o.id)
        );
      });

      it('should call syncColumns', () => {
        const spy = jest.spyOn(component as any, 'syncColumns');
        component.resetFilters();
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('onFilterChange()', () => {
      it('should strip SELECT_ALL from selectedFilterIds', () => {
        component.selectedFilterIds = ['SELECT_ALL', 'ocifId', 'role'];
        component.onFilterChange();
        expect(component.selectedFilterIds).not.toContain('SELECT_ALL');
      });

      it('should call syncColumns', () => {
        const spy = jest.spyOn(component as any, 'syncColumns');
        component.onFilterChange();
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('toggleSelectAll()', () => {
      it('should deselect all when all are selected', () => {
        const event = { stopPropagation: jest.fn() } as any;
        // All currently selected → clicking should deselect
        component.toggleSelectAll(event);
        expect(component.selectedFilterIds).toEqual([]);
      });

      it('should select all when none are selected', () => {
        component.selectedFilterIds = [];
        const event = { stopPropagation: jest.fn() } as any;
        component.toggleSelectAll(event);
        expect(component.selectedFilterIds).toEqual(
          component.filterOptions.map((o) => o.id)
        );
      });

      it('should stop event propagation', () => {
        const event = { stopPropagation: jest.fn() } as any;
        component.toggleSelectAll(event);
        expect(event.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('syncColumns() (private)', () => {
      it('should call setColumnVisible for each filter option', () => {
        const gridApi = makeGridApi();
        (component as any).gridApi = gridApi;
        component.selectedFilterIds = ['ocifId'];
        (component as any).syncColumns();
        expect(gridApi.setColumnVisible).toHaveBeenCalledWith('ocifId', true);
        expect(gridApi.setColumnVisible).toHaveBeenCalledWith('legalHoldStatus', false);
      });

      it('should call sizeColumnsToFit after updating visibility', () => {
        const gridApi = makeGridApi();
        (component as any).gridApi = gridApi;
        (component as any).syncColumns();
        expect(gridApi.sizeColumnsToFit).toHaveBeenCalled();
      });

      it('should return early if gridApi is not set', () => {
        (component as any).gridApi = undefined;
        expect(() => (component as any).syncColumns()).not.toThrow();
      });
    });
  });

  // ── onCellClicked ─────────────────────────────────────────────────────────

  describe('onCellClicked()', () => {
    let gridApi: any;

    beforeEach(() => {
      gridApi = makeGridApi();
      (component as any).gridApi = gridApi;
    });

    function makeCellEvent(overrides: Partial<any> = {}): any {
      const tree: EntityRowNode[] = (component as any).tree;
      return {
        colDef: { field: 'profileName' },
        data: tree[0], // root node (_isParent = true)
        event: { target: document.createElement('span') },
        ...overrides,
      };
    }

    it('should ignore clicks on columns other than profileName', () => {
      const event = makeCellEvent({ colDef: { field: 'ocifId' } });
      const initialRowData = component.rowData();
      component.onCellClicked(event);
      expect(component.rowData()).toBe(initialRowData); // same reference = no update
    });

    it('should ignore clicks on non-parent nodes', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const event = makeCellEvent({ data: tree[1] }); // standalone, _isParent = false
      const initialRowData = component.rowData();
      component.onCellClicked(event);
      expect(component.rowData()).toBe(initialRowData);
    });

    it('should toggle _expanded on the parent node', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      const wasExpanded = root._expanded;
      component.onCellClicked(makeCellEvent());
      expect(root._expanded).toBe(!wasExpanded);
    });

    it('should update rowData signal after toggle', () => {
      const before = component.rowData();
      component.onCellClicked(makeCellEvent());
      // A new array must be set (different reference)
      expect(component.rowData()).not.toBe(before);
    });

    it('should ignore clicks on ag-selection-checkbox', () => {
      const target = document.createElement('div');
      target.classList.add('ag-selection-checkbox');
      const event = makeCellEvent({ event: { target } });
      const initialRows = component.rowData();
      component.onCellClicked(event);
      expect(component.rowData()).toBe(initialRows);
    });

    it('should ignore clicks on ag-checkbox-input-wrapper', () => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('ag-checkbox-input-wrapper');
      const inner = document.createElement('input');
      wrapper.appendChild(inner);
      const event = makeCellEvent({ event: { target: inner } });
      const initialRows = component.rowData();
      component.onCellClicked(event);
      expect(component.rowData()).toBe(initialRows);
    });

    it('should call syncModelToGrid after toggling', () => {
      const spy = jest.spyOn(component as any, 'syncModelToGrid');
      component.onCellClicked(makeCellEvent());
      expect(spy).toHaveBeenCalled();
    });
  });

  // ── Selection logic ───────────────────────────────────────────────────────

  describe('collectSelected() (private)', () => {
    it('should collect uids of selected nodes', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      (tree[0] as any)._selected = true;
      const out = new Set<string>();
      (component as any).collectSelected(tree, out);
      expect(out.has((tree[0] as any)._uid)).toBe(true);
    });

    it('should recursively collect from children', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const grandchild = (tree[0] as any).children[0].children[0];
      grandchild._selected = true;
      const out = new Set<string>();
      (component as any).collectSelected(tree, out);
      expect(out.has(grandchild._uid)).toBe(true);
    });
  });

  describe('setAllDesc() (private)', () => {
    it('should set _selected on all descendants', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      (component as any).setAllDesc((tree[0] as any).children, true);
      (tree[0] as any).children.forEach((c: any) => {
        expect(c._selected).toBe(true);
        c.children.forEach((gc: any) => expect(gc._selected).toBe(true));
      });
    });

    it('should clear _selected on all descendants', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      // First select
      (component as any).setAllDesc((tree[0] as any).children, true);
      // Then deselect
      (component as any).setAllDesc((tree[0] as any).children, false);
      (tree[0] as any).children.forEach((c: any) => expect(c._selected).toBe(false));
    });
  });

  describe('recomputeParents() (private)', () => {
    it('should return true when all children are selected', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      (component as any).setAllDesc(root.children, true);
      const result = (component as any).recomputeParents(root.children);
      expect(result).toBe(true);
    });

    it('should return false when any child is not selected', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      // Only select first child
      root.children[0]._selected = true;
      root.children[1]._selected = false;
      const result = (component as any).recomputeParents(root.children);
      expect(result).toBe(false);
    });

    it('should propagate parent selection from children', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      // Select all grandchildren → should bubble up to child
      (component as any).setAllDesc(root.children[0].children, true);
      (component as any).recomputeParents(root.children);
      expect(root.children[0]._selected).toBe(true);
    });
  });

  describe('syncModelToGrid() (private)', () => {
    it('should call gridApi.forEachNode', () => {
      const gridApi = makeGridApi();
      (component as any).gridApi = gridApi;
      (component as any).syncModelToGrid();
      expect(gridApi.forEachNode).toHaveBeenCalled();
    });

    it('should call gn.setSelected for matched nodes', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      root._selected = true;

      const mockGn = { data: root, setSelected: jest.fn() };
      const gridApi = makeGridApi({
        forEachNode: jest.fn((cb: any) => cb(mockGn)),
      });
      (component as any).gridApi = gridApi;
      (component as any).syncModelToGrid();
      expect(mockGn.setSelected).toHaveBeenCalledWith(true, false, 'api');
    });
  });

  // ── emitSelection ─────────────────────────────────────────────────────────

  describe('emitSelection() (private)', () => {
    it('should emit selectionChanged with empty arrays when nothing selected', () => {
      const gridApi = makeGridApi({ getSelectedRows: jest.fn().mockReturnValue([]) });
      (component as any).gridApi = gridApi;
      const emitted: EntitySelectionEvent[] = [];
      component.selectionChanged.subscribe((e) => emitted.push(e as EntitySelectionEvent));
      (component as any).emitSelection();
      expect(emitted[0]).toEqual([]);
    });

    it('should emit selectedRows and selectedClusters when rows are selected', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as EntityRowNode;
      const gridApi = makeGridApi({
        getSelectedRows: jest.fn().mockReturnValue([root]),
      });
      (component as any).gridApi = gridApi;
      const emitted: EntitySelectionEvent[] = [];
      component.selectionChanged.subscribe((e) => emitted.push(e as EntitySelectionEvent));
      (component as any).emitSelection();
      expect((emitted[0] as any).selectedRows).toBeDefined();
      expect((emitted[0] as any).selectedClusters).toBeDefined();
    });
  });

  // ── Tree utilities ────────────────────────────────────────────────────────

  describe('findRootOf() (private)', () => {
    it('should return the root node when uid matches root', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      const found = (component as any).findRootOf(tree, root._uid);
      expect(found?._uid).toBe(root._uid);
    });

    it('should return the root when uid belongs to a deep descendant', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      const grandchild = root.children[0].children[0];
      const found = (component as any).findRootOf(tree, grandchild._uid);
      expect(found?._uid).toBe(root._uid);
    });

    it('should return null for unknown uid', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      expect((component as any).findRootOf(tree, 'does-not-exist')).toBeNull();
    });
  });

  describe('findByUid() (private)', () => {
    it('should find a node by uid', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const grandchild = (tree[0] as any).children[0].children[0];
      const found = (component as any).findByUid(tree, grandchild._uid);
      expect(found?._uid).toBe(grandchild._uid);
    });

    it('should return null when uid not found', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      expect((component as any).findByUid(tree, 'nope')).toBeNull();
    });
  });

  describe('flattenNode() (private)', () => {
    it('should return the node itself and all descendants', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as EntityRowNode;
      const flat = (component as any).flattenNode(root);
      // root + 2 children + 1 grandchild = 4
      expect(flat.length).toBe(4);
    });

    it('should return just the node for a leaf', () => {
      const leaf = makeNode() as EntityRowNode;
      (leaf as any)._uid = 'leaf-1';
      (leaf as any).children = [];
      const flat = (component as any).flattenNode(leaf);
      expect(flat).toEqual([leaf]);
    });
  });

  // ── Pagination ────────────────────────────────────────────────────────────

  describe('onPaginationChanged()', () => {
    it('should do nothing if gridApi is not set', () => {
      (component as any).gridApi = undefined;
      expect(() => component.onPaginationChanged()).not.toThrow();
    });

    it('should update currentPage (1-based) from grid (0-based)', () => {
      const gridApi = makeGridApi({
        paginationGetCurrentPage: jest.fn().mockReturnValue(2), // 0-based page 2
        paginationGetTotalPages: jest.fn().mockReturnValue(5),
        paginationGetRowCount: jest.fn().mockReturnValue(100),
      });
      (component as any).gridApi = gridApi;
      component.onPaginationChanged();
      expect(component.currentPage()).toBe(3); // +1
    });

    it('should update totalPages', () => {
      const gridApi = makeGridApi({
        paginationGetCurrentPage: jest.fn().mockReturnValue(0),
        paginationGetTotalPages: jest.fn().mockReturnValue(7),
        paginationGetRowCount: jest.fn().mockReturnValue(140),
      });
      (component as any).gridApi = gridApi;
      component.onPaginationChanged();
      expect(component.totalPages()).toBe(7);
    });

    it('should default totalPages to 1 when grid returns 0', () => {
      const gridApi = makeGridApi({
        paginationGetTotalPages: jest.fn().mockReturnValue(0),
        paginationGetCurrentPage: jest.fn().mockReturnValue(0),
        paginationGetRowCount: jest.fn().mockReturnValue(0),
      });
      (component as any).gridApi = gridApi;
      component.onPaginationChanged();
      expect(component.totalPages()).toBe(1);
    });

    it('should update totalRows', () => {
      const gridApi = makeGridApi({
        paginationGetCurrentPage: jest.fn().mockReturnValue(0),
        paginationGetTotalPages: jest.fn().mockReturnValue(3),
        paginationGetRowCount: jest.fn().mockReturnValue(55),
      });
      (component as any).gridApi = gridApi;
      component.onPaginationChanged();
      expect(component.totalRows()).toBe(55);
    });
  });

  describe('goToPage()', () => {
    it('should call paginationGoToPage with (page - 1)', () => {
      const gridApi = makeGridApi();
      (component as any).gridApi = gridApi;
      component.totalPages.set(10); // make sure page is valid
      component.goToPage(3);
      expect(gridApi.paginationGoToPage).toHaveBeenCalledWith(2);
    });

    it('should do nothing when gridApi is not set', () => {
      (component as any).gridApi = undefined;
      expect(() => component.goToPage(1)).not.toThrow();
    });

    it('should do nothing for page < 1', () => {
      const gridApi = makeGridApi();
      (component as any).gridApi = gridApi;
      component.goToPage(0);
      expect(gridApi.paginationGoToPage).not.toHaveBeenCalled();
    });

    it('should do nothing for page > totalPages', () => {
      const gridApi = makeGridApi();
      (component as any).gridApi = gridApi;
      component.totalPages.set(5);
      component.goToPage(6);
      expect(gridApi.paginationGoToPage).not.toHaveBeenCalled();
    });
  });

  describe('onPageSizeChange()', () => {
    it('should update pageSize signal', () => {
      const gridApi = makeGridApi();
      (component as any).gridApi = gridApi;
      const event = { target: { value: '40' } } as any;
      component.onPageSizeChange(event);
      expect(component.pageSize()).toBe(40);
    });

    it('should call gridApi.updateGridOptions with new page size', () => {
      const gridApi = makeGridApi();
      (component as any).gridApi = gridApi;
      const event = { target: { value: '100' } } as any;
      component.onPageSizeChange(event);
      expect(gridApi.updateGridOptions).toHaveBeenCalledWith({
        paginationPageSize: 100,
      });
    });
  });

  // ── rangeLabel computed ───────────────────────────────────────────────────

  describe('rangeLabel computed', () => {
    it('should return "0 of 0" when totalRows is 0', () => {
      component.totalRows.set(0);
      expect(component.rangeLabel()).toBe('0 of 0');
    });

    it('should compute correct range for first page', () => {
      component.totalRows.set(50);
      component.currentPage.set(1);
      component.pageSize.set(20);
      expect(component.rangeLabel()).toBe('1-20 of 50');
    });

    it('should compute correct range for last partial page', () => {
      component.totalRows.set(45);
      component.currentPage.set(3);
      component.pageSize.set(20);
      // start = (3-1)*20+1 = 41, end = min(3*20, 45) = 45
      expect(component.rangeLabel()).toBe('41-45 of 45');
    });
  });

  // ── visiblePages computed ─────────────────────────────────────────────────

  describe('visiblePages computed', () => {
    it('should return all pages when total <= 7', () => {
      component.totalPages.set(5);
      component.currentPage.set(1);
      const pages = component.visiblePages();
      expect(pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('should include ellipsis (-1) for large page sets', () => {
      component.totalPages.set(20);
      component.currentPage.set(10);
      const pages = component.visiblePages();
      expect(pages).toContain(-1); // at least one ellipsis
    });

    it('should always include first and last page', () => {
      component.totalPages.set(15);
      component.currentPage.set(8);
      const pages = component.visiblePages();
      expect(pages).toContain(1);
      expect(pages).toContain(15);
    });

    it('should always include current page', () => {
      component.totalPages.set(15);
      component.currentPage.set(7);
      const pages = component.visiblePages();
      expect(pages).toContain(7);
    });

    it('should return pages in ascending order (excluding ellipsis)', () => {
      component.totalPages.set(10);
      component.currentPage.set(5);
      const pages = component.visiblePages().filter((p) => p !== -1);
      expect(pages).toEqual([...pages].sort((a, b) => a - b));
    });
  });

  // ── getRowId ──────────────────────────────────────────────────────────────

  describe('getRowId', () => {
    it('should return the _uid of the row node', () => {
      const params = { data: { _uid: 'r0-1-2' } } as any;
      expect(component.getRowId(params)).toBe('r0-1-2');
    });
  });

  // ── getRowClass ───────────────────────────────────────────────────────────

  describe('getRowClass', () => {
    function makeRowParams(data: Partial<EntityRowNode>): any {
      return { data };
    }

    it('should include "row-root" for level-0 nodes', () => {
      const cls = component.getRowClass(makeRowParams({ _level: 0, _isParent: true, _expanded: true, _isClusterEnd: false }));
      expect(cls).toContain('row-root');
    });

    it('should include "row-is-parent" for parent nodes', () => {
      const cls = component.getRowClass(makeRowParams({ _level: 0, _isParent: true, _expanded: false, _isClusterEnd: false }));
      expect(cls).toContain('row-is-parent');
    });

    it('should include "row-is-leaf" for leaf nodes', () => {
      const cls = component.getRowClass(makeRowParams({ _level: 1, _isParent: false, _expanded: false, _isClusterEnd: false }));
      expect(cls).toContain('row-is-leaf');
    });

    it('should include "row-cluster-end" when _isClusterEnd is true', () => {
      const cls = component.getRowClass(makeRowParams({ _level: 0, _isParent: false, _expanded: false, _isClusterEnd: true }));
      expect(cls).toContain('row-cluster-end');
    });

    it('should include "row-expanded" when parent is expanded', () => {
      const cls = component.getRowClass(makeRowParams({ _level: 0, _isParent: true, _expanded: true, _isClusterEnd: false }));
      expect(cls).toContain('row-expanded');
    });

    it('should clamp child level to 10 for class name', () => {
      const cls = component.getRowClass(makeRowParams({ _level: 15, _isParent: false, _expanded: false, _isClusterEnd: false }));
      expect(cls).toContain('row-child-l10');
    });
  });

  // ── onGridReady ───────────────────────────────────────────────────────────

  describe('onGridReady()', () => {
    it('should store gridApi reference', () => {
      const api = makeGridApi();
      component.onGridReady({ api } as any);
      expect((component as any).gridApi).toBe(api);
    });
  });

  // ── @Input bindings ───────────────────────────────────────────────────────

  describe('@Input properties', () => {
    it('should accept searchTerm input', () => {
      component.searchTerm = 'test';
      expect(component.searchTerm).toBe('test');
    });

    it('should accept searchSummary input', () => {
      component.searchSummary = 'Showing results for: test';
      expect(component.searchSummary).toBe('Showing results for: test');
    });
  });

  // ── columnDefs cellRenderer — profileName column ──────────────────────────

  describe('columnDefs profileName cellRenderer', () => {
    function getCellRenderer(): ((p: any) => string) {
      const col = component.columnDefs.find((c) => c.field === 'profileName');
      return col!.cellRenderer as (p: any) => string;
    }

    it('should return empty string when p.data is falsy', () => {
      const render = getCellRenderer();
      expect(render({ data: null, value: null })).toBe('');
    });

    it('should render pn-parent span with chevron for parent nodes', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      const render = getCellRenderer();
      const html = render({ data: root, value: root.profileName });
      expect(html).toContain('pn-parent');
      expect(html).toContain('pn-chevron');
    });

    it('should render pn-child span for leaf nodes', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const leaf = tree[1] as any; // standalone, not a parent
      const render = getCellRenderer();
      const html = render({ data: leaf, value: leaf.profileName });
      expect(html).toContain('pn-child');
    });

    it('should render an up-chevron SVG when parent is expanded', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      root._expanded = true;
      const render = getCellRenderer();
      const html = render({ data: root, value: root.profileName });
      // Up chevron path from the component: "M1 5L5 1L9 5"
      expect(html).toContain('M1 5L5 1L9 5');
    });

    it('should render a down-chevron SVG when parent is collapsed', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const root = tree[0] as any;
      root._expanded = false;
      const render = getCellRenderer();
      const html = render({ data: root, value: root.profileName });
      // Down chevron path from the component: "M1 1L5 5L9 1"
      expect(html).toContain('M1 1L5 5L9 1');
    });

    it('should include suspect-icon span when node isSuspect is true', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const node = tree[1] as any;
      node.isSuspect = true;
      const render = getCellRenderer();
      const html = render({ data: node, value: node.profileName });
      expect(html).toContain('suspect-icon');
    });

    it('should NOT include suspect-icon when node isSuspect is false', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const node = tree[1] as any;
      node.isSuspect = false;
      const render = getCellRenderer();
      const html = render({ data: node, value: node.profileName });
      expect(html).not.toContain('suspect-icon');
    });

    it('should include the profile name text in the rendered HTML', () => {
      const tree: EntityRowNode[] = (component as any).tree;
      const node = tree[1] as any;
      const render = getCellRenderer();
      const html = render({ data: node, value: 'Standalone Entity' });
      expect(html).toContain('Standalone Entity');
    });
  });

  // ── columnDefs cellRenderer — legalHoldStatus column ─────────────────────

  describe('columnDefs legalHoldStatus cellRenderer', () => {
    function getLhRenderer(): ((p: any) => string) {
      const col = component.columnDefs.find((c) => c.field === 'legalHoldStatus');
      return col!.cellRenderer as (p: any) => string;
    }

    it('should render lh-pill for LEGAL HOLD status', () => {
      const render = getLhRenderer();
      const html = render({ value: 'LEGAL HOLD' });
      expect(html).toContain('lh-pill');
      expect(html).toContain('LEGAL HOLD');
    });

    it('should render lh-na for N/A status', () => {
      const render = getLhRenderer();
      const html = render({ value: 'N/A' });
      expect(html).toContain('lh-na');
      expect(html).toContain('N/A');
    });

    it('should render lh-na for empty/null value', () => {
      const render = getLhRenderer();
      const html = render({ value: null });
      expect(html).toContain('lh-na');
    });
  });

  // ── columnDefs structure ──────────────────────────────────────────────────

  describe('columnDefs structure', () => {
    it('should define exactly 7 columns', () => {
      expect(component.columnDefs.length).toBe(7);
    });

    it('first column should be profileName with checkboxSelection', () => {
      const first = component.columnDefs[0];
      expect(first.field).toBe('profileName');
      expect(first.checkboxSelection).toBe(true);
      expect(first.headerCheckboxSelection).toBe(true);
    });

    it('should have ocifId, legalHoldStatus, holdName, lifecycle, role, address columns', () => {
      const fields = component.columnDefs.map((c) => c.field);
      expect(fields).toContain('ocifId');
      expect(fields).toContain('legalHoldStatus');
      expect(fields).toContain('holdName');
      expect(fields).toContain('lifecycle');
      expect(fields).toContain('role');
      expect(fields).toContain('address');
    });

    it('defaultColDef should suppress movable and be resizable', () => {
      expect(component.defaultColDef.suppressMovable).toBe(true);
      expect(component.defaultColDef.resizable).toBe(true);
    });
  });

  // ── pageSizeOpts ──────────────────────────────────────────────────────────

  describe('pageSizeOpts', () => {
    it('should include 20 as the first option', () => {
      expect(component.pageSizeOpts[0]).toBe(20);
    });

    it('should include common page sizes up to 200', () => {
      expect(component.pageSizeOpts).toContain(40);
      expect(component.pageSizeOpts).toContain(100);
      expect(component.pageSizeOpts).toContain(200);
    });

    it('should be in ascending order', () => {
      const sorted = [...component.pageSizeOpts].sort((a, b) => a - b);
      expect(component.pageSizeOpts).toEqual(sorted);
    });
  });
});


// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { CommonModule } from '@angular/common';
// import { ChangeDetectorRef } from '@angular/core';
// import { of, throwError } from 'rxjs';

// import { EntityGridComponent } from './entity-grid.component';
// import { EntityGridService } from './entity-grid.service';
// import { EntityGridResponse, EntityNode } from './entity-grid.model';

// const addr = '33 Dundas St W, Toronto, ON M5G 2C3';
// function makeLeaf(id: string, name: string): EntityNode {
//   return {
//     ocifId: id, profileName: name, legalHoldStatus: 'N/A', holdName: '',
//     lifecycle: 'Active Customer', role: 'Owner', address: addr,
//     isParent: false, isExpanded: false, children: [],
//   };
// }

// function makeParent(id: string, name: string, children: EntityNode[], expanded = true): EntityNode {
//   return {
//     ocifId: id, profileName: name, legalHoldStatus: 'N/A', holdName: '',
//     lifecycle: 'Active Customer', role: 'Owner', address: addr,
//     isParent: true, isExpanded: expanded, children,
//   };
// }

// /** Minimal mock response used in most tests */
// function mockResponse(): EntityGridResponse {
//   return {
//     totalCount: 5,
//     data: [
//       makeParent('C1', 'Corp 1', [
//         makeLeaf('C1-L1', 'Role Player A'),
//         makeLeaf('C1-L2', 'Role Player B'),
//       ]),
//       makeParent('C2', 'Corp 2', [
//         makeParent('C2-P1', 'Sub Corp', [
//           makeLeaf('C2-P1-L1', 'Deep Leaf'),
//         ]),
//       ]),
//     ],
//   };
// }

// // ── Mock GridApi ────────────────────────────────────────────────────────────────

// function makeMockGridApi() {
//   const nodes: Map<string, { data: any; selected: boolean }> = new Map();

//   return {
//     _nodes: nodes,
//     forEachNode: jasmine.createSpy('forEachNode').and.callFake((cb: any) => {
//       nodes.forEach((node) => cb({ data: node.data, isSelected: () => node.selected, setSelected: (v: boolean) => { node.selected = v; } }));
//     }),
//     getSelectedRows: jasmine.createSpy('getSelectedRows').and.callFake(() =>
//       [...nodes.values()].filter(n => n.selected).map(n => n.data)
//     ),
//     applyTransaction: jasmine.createSpy('applyTransaction'),
//     setSelected: jasmine.createSpy('setSelected'),
//     _addNode(data: any, selected = false) {
//       nodes.set(data._uid, { data, selected });
//     },
//     _selectByUid(uid: string) {
//       const n = nodes.get(uid);
//       if (n) n.selected = true;
//     },
//     _deselectByUid(uid: string) {
//       const n = nodes.get(uid);
//       if (n) n.selected = false;
//     },
//   };
// }

// // ── Test Suite ─────────────────────────────────────────────────────────────────

// describe('EntityGridComponent', () => {
//   let component: EntityGridComponent;
//   let fixture: ComponentFixture<EntityGridComponent>;
//   let serviceSpy: jasmine.SpyObj<EntityGridService>;
//   let mockGridApi: ReturnType<typeof makeMockGridApi>;

//   beforeEach(async () => {
//     serviceSpy = jasmine.createSpyObj<EntityGridService>('EntityGridService', ['getEntityGrid']);
//     serviceSpy.getEntityGrid.and.returnValue(of(mockResponse()));

//     await TestBed.configureTestingModule({
//       imports: [EntityGridComponent, CommonModule],
//       providers: [
//         { provide: EntityGridService, useValue: serviceSpy },
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(EntityGridComponent);
//     component = fixture.componentInstance;
//     mockGridApi = makeMockGridApi();

//     // Inject the mock grid api
//     (component as any).gridApi = mockGridApi;
//   });

//   // ── Component initialisation ─────────────────────────────────────────────────

//   describe('Initialisation', () => {

//     it('should create the component', () => {
//       expect(component).toBeTruthy();
//     });

//     it('should start with isLoading=true and loadError=false', () => {
//       // Before ngOnInit
//       const fresh = TestBed.createComponent(EntityGridComponent);
//       expect(fresh.componentInstance.isLoading).toBeTrue();
//       expect(fresh.componentInstance.loadError).toBeFalse();
//     });

//     it('should call getEntityGrid on init', () => {
//       fixture.detectChanges(); // triggers ngOnInit
//       expect(serviceSpy.getEntityGrid).toHaveBeenCalledTimes(1);
//     });

//     it('should set isLoading=false after data loads', () => {
//       fixture.detectChanges();
//       expect(component.isLoading).toBeFalse();
//     });

//     it('should populate rowData after successful load', () => {
//       fixture.detectChanges();
//       expect(component.rowData.length).toBeGreaterThan(0);
//     });

//     it('should set loadError=true and isLoading=false on service error', () => {
//       serviceSpy.getEntityGrid.and.returnValue(throwError(() => new Error('API error')));
//       fixture.detectChanges();
//       expect(component.loadError).toBeTrue();
//       expect(component.isLoading).toBeFalse();
//     });

//     it('should unsubscribe on destroy', () => {
//       fixture.detectChanges();
//       spyOn((component as any).destroy$, 'next').and.callThrough();
//       component.ngOnDestroy();
//       expect((component as any).destroy$.next).toHaveBeenCalled();
//     });
//   });

//   // ── stampTree ────────────────────────────────────────────────────────────────

//   describe('stampTree', () => {

//     beforeEach(() => fixture.detectChanges());

//     it('should stamp _uid on every node', () => {
//       const tree = (component as any).tree;
//       expect(tree[0]._uid).toBe('r0');
//       expect(tree[1]._uid).toBe('r1');
//     });

//     it('should stamp correct _level — roots at 0', () => {
//       const tree = (component as any).tree;
//       expect(tree[0]._level).toBe(0);
//       expect(tree[1]._level).toBe(0);
//     });

//     it('should stamp _level=1 for direct children', () => {
//       const tree = (component as any).tree;
//       expect(tree[0].children[0]._level).toBe(1);
//     });

//     it('should stamp _level=2 for grandchildren', () => {
//       const tree = (component as any).tree;
//       // Corp 2 → Sub Corp (L1) → Deep Leaf (L2)
//       expect(tree[1].children[0].children[0]._level).toBe(2);
//     });

//     it('should stamp _isParent=true for nodes with children', () => {
//       const tree = (component as any).tree;
//       expect(tree[0]._isParent).toBeTrue();
//     });

//     it('should stamp _isParent=false for leaf nodes', () => {
//       const tree = (component as any).tree;
//       expect(tree[0].children[0]._isParent).toBeFalse();
//     });

//     it('should stamp _selected=false on all nodes initially', () => {
//       const tree = (component as any).tree;
//       expect(tree[0]._selected).toBeFalse();
//       expect(tree[0].children[0]._selected).toBeFalse();
//     });

//     it('should stamp _expanded=true for parent nodes', () => {
//       const tree = (component as any).tree;
//       expect(tree[0]._expanded).toBeTrue();
//     });

//     it('should stamp _expanded=false for leaf nodes', () => {
//       const tree = (component as any).tree;
//       expect(tree[0].children[0]._expanded).toBeFalse();
//     });

//     it('should generate unique _uid for every node in the tree', () => {
//       const allUids: string[] = [];
//       const collect = (nodes: any[]) => nodes.forEach(n => { allUids.push(n._uid); if (n.children?.length) collect(n.children); });
//       collect((component as any).tree);
//       const unique = new Set(allUids);
//       expect(unique.size).toBe(allUids.length);
//     });
//   });

//   // ── buildFlat ─────────────────────────────────────────────────────────────────

//   describe('buildFlat', () => {

//     beforeEach(() => fixture.detectChanges());

//     it('should include all expanded nodes in rowData', () => {
//       // Both root nodes are expanded, so all descendants should appear
//       const names = component.rowData.map((r: any) => r.profileName);
//       expect(names).toContain('Corp 1');
//       expect(names).toContain('Role Player A');
//       expect(names).toContain('Role Player B');
//       expect(names).toContain('Corp 2');
//       expect(names).toContain('Sub Corp');
//       expect(names).toContain('Deep Leaf');
//     });

//     it('should NOT include children of collapsed nodes', () => {
//       // Collapse Corp 1
//       (component as any).tree[0]._expanded = false;
//       const flat = (component as any).buildFlat((component as any).tree);
//       const names = flat.map((r: any) => r.profileName);
//       expect(names).not.toContain('Role Player A');
//       expect(names).not.toContain('Role Player B');
//       expect(names).toContain('Corp 1'); // root still shows
//     });

//     it('should mark the last row of each cluster as _isClusterEnd=true', () => {
//       const flat = component.rowData;
//       // Last child of Corp 1 cluster should be marked
//       const rolePlayerB = flat.find((r: any) => r.profileName === 'Role Player B');
//       expect(rolePlayerB?._isClusterEnd).toBeTrue();
//     });

//     it('should mark the last row of the last cluster as _isClusterEnd=true', () => {
//       const flat = component.rowData;
//       const last = flat[flat.length - 1];
//       expect(last._isClusterEnd).toBeTrue();
//     });

//     it('should NOT mark non-last rows as _isClusterEnd', () => {
//       const flat = component.rowData;
//       const corp1 = flat.find((r: any) => r.profileName === 'Corp 1');
//       expect(corp1?._isClusterEnd).toBeFalse();
//     });

//     it('should return rows in correct tree order', () => {
//       const names = component.rowData.map((r: any) => r.profileName);
//       const corp1Idx      = names.indexOf('Corp 1');
//       const rolePlayerIdx = names.indexOf('Role Player A');
//       const corp2Idx      = names.indexOf('Corp 2');
//       expect(corp1Idx).toBeLessThan(rolePlayerIdx);
//       expect(rolePlayerIdx).toBeLessThan(corp2Idx);
//     });
//   });

//   // ── getRowClass ───────────────────────────────────────────────────────────────

//   describe('getRowClass', () => {

//     beforeEach(() => fixture.detectChanges());

//     it('should return "row-root" for level-0 rows', () => {
//       const node = { _level: 0, _isParent: true, _isClusterEnd: false };
//       expect(component.getRowClass({ data: node } as any)).toBe('row-root');
//     });

//     it('should append "row-cluster-end" for cluster-end root rows', () => {
//       const node = { _level: 0, _isParent: true, _isClusterEnd: true };
//       expect(component.getRowClass({ data: node } as any)).toContain('row-cluster-end');
//     });

//     it('should return "row-child row-child-l1 row-is-parent" for level-1 parent', () => {
//       const node = { _level: 1, _isParent: true, _isClusterEnd: false };
//       const cls = component.getRowClass({ data: node } as any);
//       expect(cls).toContain('row-child');
//       expect(cls).toContain('row-child-l1');
//       expect(cls).toContain('row-is-parent');
//     });

//     it('should return "row-is-leaf" for level-1 leaf', () => {
//       const node = { _level: 1, _isParent: false, _isClusterEnd: false };
//       expect(component.getRowClass({ data: node } as any)).toContain('row-is-leaf');
//     });

//     it('should return "row-is-leaf" for level-3 leaf', () => {
//       const node = { _level: 3, _isParent: false, _isClusterEnd: false };
//       const cls = component.getRowClass({ data: node } as any);
//       expect(cls).toContain('row-child-l3');
//       expect(cls).toContain('row-is-leaf');
//     });

//     it('should cap level class at l10 for very deep nodes', () => {
//       const node = { _level: 15, _isParent: false, _isClusterEnd: false };
//       expect(component.getRowClass({ data: node } as any)).toContain('row-child-l10');
//     });
//   });

//   // ── Selection: cascade down ───────────────────────────────────────────────────

//   describe('Selection — cascade down (parent → children)', () => {

//     beforeEach(() => {
//       fixture.detectChanges();
//       // Seed the mock grid api with all visible rows
//       component.rowData.forEach((r: any) => mockGridApi._addNode(r, false));
//     });

//     it('should select all descendants when a parent is selected', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];

//       // Simulate user selecting Corp 1
//       mockGridApi._selectByUid(corp1._uid);
//       component.onSelectionChanged();

//       expect(corp1.children[0]._selected).toBeTrue();  // Role Player A
//       expect(corp1.children[1]._selected).toBeTrue();  // Role Player B
//     });

//     it('should deselect all descendants when a parent is deselected', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];

//       // First select everything
//       corp1._selected = true;
//       corp1.children.forEach((c: any) => c._selected = true);

//       // Now deselect the parent
//       mockGridApi._deselectByUid(corp1._uid);
//       component.onSelectionChanged();

//       expect(corp1.children[0]._selected).toBeFalse();
//       expect(corp1.children[1]._selected).toBeFalse();
//     });

//     it('should cascade selection through multiple levels', () => {
//       const tree = (component as any).tree as any[];
//       const corp2   = tree[1];               // L0
//       const subCorp = corp2.children[0];     // L1 — is a parent
//       const deepLeaf = subCorp.children[0];  // L2

//       mockGridApi._selectByUid(corp2._uid);
//       component.onSelectionChanged();

//       expect(subCorp._selected).toBeTrue();
//       expect(deepLeaf._selected).toBeTrue();
//     });

//     it('should NOT affect sibling clusters when selecting one parent', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];
//       const corp2 = tree[1];

//       mockGridApi._selectByUid(corp1._uid);
//       component.onSelectionChanged();

//       // Corp 2 and its children must remain unselected
//       expect(corp2._selected).toBeFalse();
//       expect(corp2.children[0]._selected).toBeFalse();
//     });
//   });

//   // ── Selection: bubble up ──────────────────────────────────────────────────────

//   describe('Selection — bubble up (all children → parent)', () => {

//     beforeEach(() => {
//       fixture.detectChanges();
//       component.rowData.forEach((r: any) => mockGridApi._addNode(r, false));
//     });

//     it('should auto-select parent when ALL children are selected', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];

//       // Select both children
//       mockGridApi._selectByUid(corp1.children[0]._uid);
//       mockGridApi._selectByUid(corp1.children[1]._uid);
//       component.onSelectionChanged();

//       expect(corp1._selected).toBeTrue();
//     });

//     it('should NOT auto-select parent when only SOME children are selected', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];

//       // Select only one child
//       mockGridApi._selectByUid(corp1.children[0]._uid);
//       component.onSelectionChanged();

//       expect(corp1._selected).toBeFalse();
//     });

//     it('should auto-deselect parent when a child is deselected', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];

//       // Select all, then remove one
//       corp1._selected = true;
//       corp1.children.forEach((c: any) => { c._selected = true; mockGridApi._selectByUid(c._uid); });
//       mockGridApi._deselectByUid(corp1.children[0]._uid);

//       component.onSelectionChanged();

//       expect(corp1._selected).toBeFalse();
//     });
//   });

//   // ── selectionChanged Output ────────────────────────────────────────────────

//   describe('@Output selectionChanged', () => {

//     beforeEach(() => {
//       fixture.detectChanges();
//       component.rowData.forEach((r: any) => mockGridApi._addNode(r, false));
//     });

//     it('should emit selected rows via selectionChanged output', () => {
//       const emitted: EntityNode[][] = [];
//       component.selectionChanged.subscribe(rows => emitted.push(rows));

//       const tree = (component as any).tree as any[];
//       mockGridApi._selectByUid(tree[0].children[0]._uid);
//       component.onSelectionChanged();

//       expect(emitted.length).toBeGreaterThan(0);
//     });

//     it('should emit empty array when all rows are deselected', () => {
//       const emitted: EntityNode[][] = [];
//       component.selectionChanged.subscribe(rows => emitted.push(rows));

//       // Nothing selected — trigger change
//       component.onSelectionChanged();

//       const lastEmit = emitted[emitted.length - 1];
//       expect(lastEmit).toEqual([]);
//     });
//   });

//   // ── Expand / Collapse ──────────────────────────────────────────────────────

//   describe('Expand / Collapse (onCellClicked)', () => {

//     beforeEach(() => fixture.detectChanges());

//     it('should collapse a parent row and remove children from rowData', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];
//       const initialLength = component.rowData.length;

//       // Simulate cell click on Corp 1
//       component.onCellClicked({
//         colDef: { field: 'profileName' },
//         data: corp1,
//         event: { target: document.createElement('span') },
//       } as any);

//       expect(corp1._expanded).toBeFalse();
//       expect(component.rowData.length).toBeLessThan(initialLength);
//     });

//     it('should expand a collapsed parent and add children to rowData', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];

//       // First collapse
//       corp1._expanded = false;
//       component.rowData = (component as any).buildFlat(tree);
//       const collapsedLength = component.rowData.length;

//       // Now expand via click
//       component.onCellClicked({
//         colDef: { field: 'profileName' },
//         data: corp1,
//         event: { target: document.createElement('span') },
//       } as any);

//       expect(corp1._expanded).toBeTrue();
//       expect(component.rowData.length).toBeGreaterThan(collapsedLength);
//     });

//     it('should NOT toggle when clicking a non-profileName column', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];
//       const wasExpanded = corp1._expanded;

//       component.onCellClicked({
//         colDef: { field: 'ocifId' },
//         data: corp1,
//         event: { target: document.createElement('span') },
//       } as any);

//       expect(corp1._expanded).toBe(wasExpanded);
//     });

//     it('should NOT toggle when clicking the checkbox', () => {
//       const tree = (component as any).tree as any[];
//       const corp1 = tree[0];
//       const wasExpanded = corp1._expanded;

//       const checkbox = document.createElement('div');
//       checkbox.className = 'ag-selection-checkbox';

//       component.onCellClicked({
//         colDef: { field: 'profileName' },
//         data: corp1,
//         event: { target: checkbox },
//       } as any);

//       expect(corp1._expanded).toBe(wasExpanded);
//     });

//     it('should NOT toggle when clicking a leaf node', () => {
//       const tree = (component as any).tree as any[];
//       const leaf = tree[0].children[0]; // Role Player A

//       component.onCellClicked({
//         colDef: { field: 'profileName' },
//         data: leaf,
//         event: { target: document.createElement('span') },
//       } as any);

//       // No error, no state change — just silently returns
//       expect(leaf._expanded).toBeFalse();
//     });
//   });

//   // ── loadData retry ──────────────────────────────────────────────────────────

//   describe('loadData retry', () => {

//     it('should reset loadError and reload when loadData is called again', () => {
//       serviceSpy.getEntityGrid.and.returnValue(throwError(() => new Error('fail')));
//       fixture.detectChanges();
//       expect(component.loadError).toBeTrue();

//       // Now fix the service and retry
//       serviceSpy.getEntityGrid.and.returnValue(of(mockResponse()));
//       component.loadData();

//       expect(component.loadError).toBeFalse();
//       expect(component.isLoading).toBeFalse();
//       expect(component.rowData.length).toBeGreaterThan(0);
//     });
//   });

//   // ── Column definitions ──────────────────────────────────────────────────────

//   describe('Column definitions', () => {

//     it('should define 7 columns', () => {
//       expect(component.columnDefs.length).toBe(7);
//     });

//     it('should have Profile Name column with checkboxSelection=true', () => {
//       const profileCol = component.columnDefs.find(c => c.field === 'profileName');
//       expect(profileCol?.checkboxSelection).toBeTrue();
//     });

//     it('should have headerCheckboxSelection=true on Profile Name', () => {
//       const profileCol = component.columnDefs.find(c => c.field === 'profileName');
//       expect(profileCol?.headerCheckboxSelection).toBeTrue();
//     });

//     it('should apply dynamic padding-left indentation via cellStyle', () => {
//       const profileCol = component.columnDefs.find(c => c.field === 'profileName');
//       const style = (profileCol?.cellStyle as Function)({ data: { _level: 2 } });
//       expect(style['padding-left']).toBe('48px'); // 8 + (2 × 20)
//     });

//     it('should apply 8px padding for level 0', () => {
//       const profileCol = component.columnDefs.find(c => c.field === 'profileName');
//       const style = (profileCol?.cellStyle as Function)({ data: { _level: 0 } });
//       expect(style['padding-left']).toBe('8px');
//     });

//     it('should render LEGAL HOLD pill for legalHoldStatus column', () => {
//       const lhCol = component.columnDefs.find(c => c.field === 'legalHoldStatus');
//       const html = (lhCol?.cellRenderer as Function)({ value: 'LEGAL HOLD' });
//       expect(html).toContain('lh-pill');
//       expect(html).toContain('LEGAL HOLD');
//     });

//     it('should render N/A span for non-legal-hold status', () => {
//       const lhCol = component.columnDefs.find(c => c.field === 'legalHoldStatus');
//       const html = (lhCol?.cellRenderer as Function)({ value: 'N/A' });
//       expect(html).toContain('lh-na');
//     });
//   });
// });
