import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import {
  CustomerSearchComponent,
  NameCellComponent,
  NameHeaderComponent,
  GridRow,
} from './customer-search.component';
import { CustomerSearchService } from './customer-search.service';
import { CustomerSearchResponse } from './customer-search.model';

// ─────────────────────────────────────────────────────────────────────────────
// Mock data helpers
// ─────────────────────────────────────────────────────────────────────────────
const ADDR = '33 Dundas St W, Toronto, ON M5G 2C3';

function makeChild(name: string, ocifId: string): any {
  return {
    legalName: name, ocifId, status: 'N/A', holdName: '',
    lifecycle: 'Active Customer', roleType: 'Secondary',
    customerStatus: 'Active', address: ADDR, children: [],
  };
}

function makeMockResponse(): CustomerSearchResponse {
  return {
    totalCount: 5,
    data: [
      {
        legalName: 'Jane Doe', ocifId: 'CS-0001', status: 'LEGAL HOLD',
        holdName: 'Hold A', lifecycle: 'Active Customer', roleType: 'Primary',
        customerStatus: 'Active', address: ADDR,
        isParent: true, isExpanded: true,
        children: [makeChild('Jane Doe Jr.', 'CS-0002')],
      },
      {
        legalName: 'John Smith', ocifId: 'CS-0003', status: 'N/A',
        holdName: '', lifecycle: 'Active Customer', roleType: 'Secondary',
        customerStatus: 'Active', address: ADDR,
        isParent: true, isExpanded: true,
        children: [
          makeChild('John Smith Jr.', 'CS-0004'),
          makeChild('John Smith Sr.', 'CS-0005'),
        ],
      },
      {
        legalName: 'Bob Johnson', ocifId: 'CS-0009', status: 'N/A',
        holdName: '', lifecycle: 'Active Customer', roleType: 'Secondary',
        customerStatus: 'Inactive', address: ADDR,
        isParent: false, isExpanded: false, children: [],
      },
    ] as any,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stub AG Grid so we don't need the full grid in unit tests
// ─────────────────────────────────────────────────────────────────────────────
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'ag-grid-angular', template: '', standalone: true })
class AgGridStub {
  @Input() rowData: any;
  @Input() columnDefs: any;
  @Input() defaultColDef: any;
  @Input() getRowId: any;
  @Input() rowHeight: any;
  @Input() headerHeight: any;
  @Input() suppressCellFocus: any;
  @Input() suppressRowClickSelection: any;
  @Input() suppressMultiRangeSelection: any;
  @Input() animateRows: any;
  @Input() getRowClass: any;
  @Output() gridReady = new EventEmitter();
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerSearchComponent', () => {
  let component: CustomerSearchComponent;
  let fixture:   ComponentFixture<CustomerSearchComponent>;
  let svcSpy:    jasmine.SpyObj<CustomerSearchService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('CustomerSearchService', ['getCustomers']);
    svcSpy.getCustomers.and.returnValue(of(makeMockResponse()));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        AgGridStub,
        CustomerSearchComponent,
      ],
      providers: [
        { provide: CustomerSearchService, useValue: svcSpy },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(CustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Initialisation ─────────────────────────────────────────────────────────
  describe('initialisation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should call getCustomers on init', () => {
      expect(svcSpy.getCustomers).toHaveBeenCalledTimes(1);
    });

    it('should set isLoading to false after data loads', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('should populate rowData after load', () => {
      // 3 parents + 1 + 2 children = 6 visible rows (all expanded)
      expect(component.rowData.length).toBeGreaterThan(0);
    });

    it('should set totalRows to the full flat count', () => {
      // Jane(1+1) + John(1+2) + Bob(1) = 6
      expect(component.totalRows).toBe(6);
    });

    it('should default to page 1', () => {
      expect(component.currentPage).toBe(1);
    });

    it('should default pageSize to 10', () => {
      expect(component.pageSize).toBe(10);
    });
  });

  // ── Load error ─────────────────────────────────────────────────────────────
  describe('load error', () => {
    it('should set loadError true on service failure', () => {
      svcSpy.getCustomers.and.returnValue(throwError(() => new Error('fail')));
      component.loadData();
      fixture.detectChanges();
      expect(component.loadError).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  describe('pagination', () => {
    it('paginationFrom should be 1 on page 1 with data', () => {
      expect(component.paginationFrom).toBe(1);
    });

    it('paginationTo should not exceed totalRows', () => {
      expect(component.paginationTo).toBeLessThanOrEqual(component.totalRows);
    });

    it('goPage should not navigate below 1', () => {
      component.goPage(0);
      expect(component.currentPage).toBe(1);
    });

    it('goPage should not navigate beyond totalPages', () => {
      component.goPage(999);
      expect(component.currentPage).toBe(component.totalPages);
    });

    it('goPage should update currentPage', () => {
      // Load enough data to have multiple pages
      const bigResponse: CustomerSearchResponse = {
        totalCount: 30,
        data: Array.from({ length: 15 }, (_, i) => ({
          legalName: `Person ${i}`, ocifId: `CS-00${i}`, status: 'N/A',
          holdName: '', lifecycle: 'Active Customer', roleType: 'Primary',
          customerStatus: 'Active', address: ADDR,
          isParent: false, isExpanded: false, children: [],
        })) as any,
      };
      svcSpy.getCustomers.and.returnValue(of(bigResponse));
      component.loadData();
      fixture.detectChanges();

      component.goPage(2);
      expect(component.currentPage).toBe(2);
    });

    it('onPageSizeChange resets to page 1', () => {
      component.currentPage = 3;
      component.pageSize    = 25;
      component.onPageSizeChange();
      expect(component.currentPage).toBe(1);
    });

    it('buildPageNumbers returns all pages when totalPages <= 7', () => {
      // With 6 rows and pageSize 10, totalPages = 1
      expect(component.totalPages).toBe(1);
      expect(component.pageNumbers).toEqual([1]);
    });

    it('buildPageNumbers includes ellipsis when totalPages > 7', () => {
      const bigResponse: CustomerSearchResponse = {
        totalCount: 100,
        data: Array.from({ length: 50 }, (_, i) => ({
          legalName: `Person ${i}`, ocifId: `CS-${i}`, status: 'N/A',
          holdName: '', lifecycle: 'Active', roleType: 'Primary',
          customerStatus: 'Active', address: ADDR,
          isParent: false, isExpanded: false, children: [],
        })) as any,
      };
      svcSpy.getCustomers.and.returnValue(of(bigResponse));
      component.loadData();
      fixture.detectChanges();
      component.goPage(5);
      expect(component.pageNumbers).toContain('…');
    });
  });

  // ── Expand / Collapse ──────────────────────────────────────────────────────
  describe('expand / collapse', () => {
    it('should start with all clusters expanded', () => {
      // Jane parent row + child = 2; John parent + 2 children = 3; Bob = 1 → 6
      expect(component.rowData.length).toBe(6);
    });

    it('toggleExpand should collapse a parent cluster', () => {
      // Find Jane Doe parent uid
      const janeRow = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      expect(janeRow).toBeTruthy();
      const before = component.rowData.length;
      component.toggleExpand(janeRow!._uid);
      fixture.detectChanges();
      // Collapsing Jane removes her 1 child → 5 rows
      expect(component.rowData.length).toBe(before - 1);
    });

    it('toggleExpand should re-expand a collapsed cluster', () => {
      const janeRow = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      component.toggleExpand(janeRow!._uid);
      fixture.detectChanges();
      const afterCollapse = component.rowData.length;

      component.toggleExpand(janeRow!._uid);
      fixture.detectChanges();
      expect(component.rowData.length).toBe(afterCollapse + 1);
    });

    it('collapsed parent row should have _isClusterEnd = true', () => {
      const janeRow = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      component.toggleExpand(janeRow!._uid);
      fixture.detectChanges();
      const collapsedRow = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      expect(collapsedRow!._isClusterEnd).toBeTrue();
    });
  });

  // ── Checkbox — parent selection cascade ────────────────────────────────────
  describe('checkbox selection', () => {
    it('selecting a parent should select all its children', () => {
      const janeParent = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      component.onCheckboxClick(janeParent!._uid);
      fixture.detectChanges();

      // Jane parent should be selected
      const updatedParent = component.rowData.find(r => r._uid === janeParent!._uid);
      expect(updatedParent!._selected).toBeTrue();

      // Jane Jr child should also be selected
      const child = component.rowData.find(r => r.legalName === 'Jane Doe Jr.');
      expect(child!._selected).toBeTrue();
    });

    it('deselecting a parent should deselect all its children', () => {
      const janeParent = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      // Select first
      component.onCheckboxClick(janeParent!._uid);
      fixture.detectChanges();
      // Then deselect
      component.onCheckboxClick(janeParent!._uid);
      fixture.detectChanges();

      const child = component.rowData.find(r => r.legalName === 'Jane Doe Jr.');
      expect(child!._selected).toBeFalse();
    });

    it('selecting all children should auto-select the parent', () => {
      const johnParent = component.rowData.find(r => r.legalName === 'John Smith' && r._isParent);
      const jr         = component.rowData.find(r => r.legalName === 'John Smith Jr.');
      const sr         = component.rowData.find(r => r.legalName === 'John Smith Sr.');

      component.onCheckboxClick(jr!._uid);
      fixture.detectChanges();
      // Parent should still be unchecked (not all children selected)
      const parentAfterOne = component.rowData.find(r => r._uid === johnParent!._uid);
      expect(parentAfterOne!._selected).toBeFalse();

      component.onCheckboxClick(sr!._uid);
      fixture.detectChanges();
      // Now all children selected → parent auto-selects
      const parentAfterAll = component.rowData.find(r => r._uid === johnParent!._uid);
      expect(parentAfterAll!._selected).toBeTrue();
    });

    it('deselecting one child should deselect the parent', () => {
      const johnParent = component.rowData.find(r => r.legalName === 'John Smith' && r._isParent);
      // Select parent (cascades to children)
      component.onCheckboxClick(johnParent!._uid);
      fixture.detectChanges();

      // Deselect one child
      const jr = component.rowData.find(r => r.legalName === 'John Smith Jr.');
      component.onCheckboxClick(jr!._uid);
      fixture.detectChanges();

      const parent = component.rowData.find(r => r._uid === johnParent!._uid);
      expect(parent!._selected).toBeFalse();
    });

    it('selecting a standalone row (no children) should only select itself', () => {
      const bob = component.rowData.find(r => r.legalName === 'Bob Johnson');
      component.onCheckboxClick(bob!._uid);
      fixture.detectChanges();

      const updatedBob = component.rowData.find(r => r.legalName === 'Bob Johnson');
      expect(updatedBob!._selected).toBeTrue();
    });
  });

  // ── Select All ─────────────────────────────────────────────────────────────
  describe('onSelectAll', () => {
    it('should select every row when called with true', () => {
      component.onSelectAll(true);
      fixture.detectChanges();
      expect(component.rowData.every(r => r._selected)).toBeTrue();
    });

    it('should deselect every row when called with false', () => {
      component.onSelectAll(true);
      component.onSelectAll(false);
      fixture.detectChanges();
      expect(component.rowData.some(r => r._selected)).toBeFalse();
    });
  });

  // ── selectionChanged output ────────────────────────────────────────────────
  describe('selectionChanged output', () => {
    it('should emit selected rows after checkbox click', () => {
      const emitted: any[] = [];
      component.selectionChanged.subscribe(rows => emitted.push(...rows));

      const janeParent = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      component.onCheckboxClick(janeParent!._uid);
      fixture.detectChanges();

      // Jane + Jane Jr = 2 selected
      expect(emitted.length).toBe(2);
    });

    it('should emit all rows after selectAll(true)', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      component.onSelectAll(true);
      fixture.detectChanges();

      const lastEmit = emitted[emitted.length - 1];
      expect(lastEmit.length).toBe(6); // all 6 flat rows
    });

    it('should emit empty array after selectAll(false)', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      component.onSelectAll(true);
      component.onSelectAll(false);
      fixture.detectChanges();

      const lastEmit = emitted[emitted.length - 1];
      expect(lastEmit.length).toBe(0);
    });
  });

  // ── getRowClass ────────────────────────────────────────────────────────────
  describe('getRowClass', () => {
    it('returns row-parent-expanded for an expanded parent', () => {
      const janeRow = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      const cls = component.getRowClass({ data: janeRow });
      expect(cls).toContain('row-parent-expanded');
    });

    it('returns row-parent-collapsed for a collapsed parent', () => {
      const janeRow = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent);
      component.toggleExpand(janeRow!._uid);
      fixture.detectChanges();
      const collapsed = component.rowData.find(r => r._uid === janeRow!._uid);
      const cls = component.getRowClass({ data: collapsed });
      expect(cls).toContain('row-parent-collapsed');
    });

    it('returns row-child for child rows', () => {
      const child = component.rowData.find(r => r.legalName === 'Jane Doe Jr.');
      const cls = component.getRowClass({ data: child });
      expect(cls).toContain('row-child');
    });

    it('appends row-cluster-end for the last child in a cluster', () => {
      // Jane has 1 child → it is the last → _isClusterEnd = true
      const child = component.rowData.find(r => r.legalName === 'Jane Doe Jr.');
      expect(child!._isClusterEnd).toBeTrue();
      const cls = component.getRowClass({ data: child });
      expect(cls).toContain('row-cluster-end');
    });
  });

  // ── Column definitions ─────────────────────────────────────────────────────
  describe('columnDefs', () => {
    it('should have 8 column definitions', () => {
      expect(component.columnDefs.length).toBe(8);
    });

    it('first column should use NameCellComponent as cellRenderer', () => {
      expect(component.columnDefs[0].cellRenderer).toBe(NameCellComponent);
    });

    it('first column should use NameHeaderComponent as headerComponent', () => {
      expect(component.columnDefs[0].headerComponent).toBe(NameHeaderComponent);
    });

    it('defaultColDef should suppress AG Grid checkboxes', () => {
      expect(component.defaultColDef.checkboxSelection).toBeFalse();
      expect(component.defaultColDef.headerCheckboxSelection).toBeFalse();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NameCellComponent unit tests
// ─────────────────────────────────────────────────────────────────────────────
describe('NameCellComponent', () => {
  let component: NameCellComponent;
  let fixture:   ComponentFixture<NameCellComponent>;

  const makeParams = (overrides: Partial<GridRow> = {}): any => ({
    value: overrides.legalName ?? 'Test Name',
    data:  {
      _uid: 'test-uid', _isParent: false, _expanded: false,
      _selected: false, _isClusterEnd: false, ...overrides,
    },
    onCheck:  () => {},
    onToggle: () => {},
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, NameCellComponent],
    }).compileComponents();

    fixture   = TestBed.createComponent(NameCellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agInit should populate name, isParent, expanded, selected', () => {
    component.agInit(makeParams({ _isParent: true, _expanded: true, _selected: false }));
    expect(component.name).toBe('Test Name');
    expect(component.isParent).toBeTrue();
    expect(component.expanded).toBeTrue();
    expect(component.selected).toBeFalse();
  });

  it('refresh should update expanded and return true', () => {
    component.agInit(makeParams({ _expanded: false }));
    const result = component.refresh(makeParams({ _expanded: true }));
    expect(result).toBeTrue();
    expect(component.expanded).toBeTrue();
  });

  it('cb-box--on class applied when selected=true', () => {
    component.agInit(makeParams({ _selected: true }));
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.css('.cb-box'));
    expect(box.classes['cb-box--on']).toBeTrue();
  });

  it('cb-box--on class not applied when selected=false', () => {
    component.agInit(makeParams({ _selected: false }));
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.css('.cb-box'));
    expect(box.classes['cb-box--on']).toBeFalsy();
  });

  it('chevron-btn rendered only for parent rows', () => {
    component.agInit(makeParams({ _isParent: true }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn'))).toBeTruthy();
  });

  it('chevron-btn not rendered for child rows', () => {
    component.agInit(makeParams({ _isParent: false }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn'))).toBeNull();
  });

  it('chevron SVG rotates to 0deg when expanded', () => {
    component.agInit(makeParams({ _isParent: true, _expanded: true }));
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('.chevron-btn svg'));
    expect(svg.styles['transform']).toBe('rotate(0deg)');
  });

  it('chevron SVG rotates to -90deg when collapsed', () => {
    component.agInit(makeParams({ _isParent: true, _expanded: false }));
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('.chevron-btn svg'));
    expect(svg.styles['transform']).toBe('rotate(-90deg)');
  });

  it('onCheckClick calls onCheck with uid', () => {
    const onCheck = jasmine.createSpy('onCheck');
    const params  = makeParams({ _uid: 'abc-123' });
    params.onCheck = onCheck;
    component.agInit(params);

    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.onCheckClick(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onCheck).toHaveBeenCalledWith('abc-123');
  });

  it('onChevronClick calls onToggle with uid', () => {
    const onToggle = jasmine.createSpy('onToggle');
    const params   = makeParams({ _uid: 'xyz-456', _isParent: true });
    params.onToggle = onToggle;
    component.agInit(params);

    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.onChevronClick(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledWith('xyz-456');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NameHeaderComponent unit tests
// ─────────────────────────────────────────────────────────────────────────────
describe('NameHeaderComponent', () => {
  let component: NameHeaderComponent;
  let fixture:   ComponentFixture<NameHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, NameHeaderComponent],
    }).compileComponents();

    fixture   = TestBed.createComponent(NameHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agInit sets state and onSelectAll', () => {
    const onSelectAll = jasmine.createSpy();
    component.agInit({ state: 'some', onSelectAll });
    expect(component.state).toBe('some');
  });

  it('refresh updates state and returns true', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} });
    const result = component.refresh({ state: 'all', onSelectAll: () => {} });
    expect(result).toBeTrue();
    expect(component.state).toBe('all');
  });

  it('cb-box--on applied when state is "all"', () => {
    component.agInit({ state: 'all', onSelectAll: () => {} });
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.css('.cb-box'));
    expect(box.classes['cb-box--on']).toBeTrue();
  });

  it('cb-box--on applied when state is "some"', () => {
    component.agInit({ state: 'some', onSelectAll: () => {} });
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.css('.cb-box'));
    expect(box.classes['cb-box--on']).toBeTrue();
  });

  it('cb-box--on NOT applied when state is "none"', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} });
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.css('.cb-box'));
    expect(box.classes['cb-box--on']).toBeFalsy();
  });

  it('onClick calls onSelectAll(true) when state is "none"', () => {
    const onSelectAll = jasmine.createSpy();
    component.agInit({ state: 'none', onSelectAll });
    const e = new MouseEvent('click');
    spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it('onClick calls onSelectAll(false) when state is "all"', () => {
    const onSelectAll = jasmine.createSpy();
    component.agInit({ state: 'all', onSelectAll });
    const e = new MouseEvent('click');
    spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(onSelectAll).toHaveBeenCalledWith(false);
  });
});
