import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { of, throwError } from 'rxjs';

import {
  CustomerSearchComponent,
  NameCellComponent,
  NameHeaderComponent,
  GridRow,
} from './customer-search.component';
import { CustomerSearchService } from './customer-search.service';

// ─────────────────────────────────────────────────────────────────────────────
// AG Grid stub — avoids importing the full ag-grid-angular module in unit tests
// ─────────────────────────────────────────────────────────────────────────────
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
  @Output() gridReady = new EventEmitter<any>();
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data factory
// ─────────────────────────────────────────────────────────────────────────────
const ADDR = '33 Dundas St W, Toronto, ON M5G 2C3';

function child(name: string, ocifId: string): any {
  return {
    legalName: name, ocifId, status: 'N/A', holdName: '',
    lifecycle: 'Active Customer', roleType: 'Secondary',
    customerStatus: 'Active', address: ADDR, children: [],
    isParent: false, isExpanded: false,
  };
}

function mockResponse() {
  return {
    totalCount: 6,
    data: [
      {
        legalName: 'Jane Doe', ocifId: 'CS-0001', status: 'LEGAL HOLD',
        holdName: 'Hold A', lifecycle: 'Active Customer', roleType: 'Primary',
        customerStatus: 'Active', address: ADDR, isParent: true, isExpanded: true,
        children: [child('Jane Doe Jr.', 'CS-0002')],
      },
      {
        legalName: 'John Smith', ocifId: 'CS-0003', status: 'N/A',
        holdName: '', lifecycle: 'Active Customer', roleType: 'Secondary',
        customerStatus: 'Active', address: ADDR, isParent: true, isExpanded: true,
        children: [
          child('John Smith Jr.', 'CS-0004'),
          child('John Smith Sr.', 'CS-0005'),
        ],
      },
      {
        legalName: 'Bob Johnson', ocifId: 'CS-0009', status: 'N/A',
        holdName: '', lifecycle: 'Active Customer', roleType: 'Secondary',
        customerStatus: 'Inactive', address: ADDR, isParent: false, isExpanded: false,
        children: [],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomerSearchComponent tests
// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerSearchComponent', () => {
  let component: CustomerSearchComponent;
  let fixture:   ComponentFixture<CustomerSearchComponent>;
  let svcSpy:    jasmine.SpyObj<CustomerSearchService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('CustomerSearchService', ['getCustomers']);
    svcSpy.getCustomers.and.returnValue(of(mockResponse() as any));

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
    })
    // Override AgGridAngular so our stub is used instead
    .overrideComponent(CustomerSearchComponent, {
      set: { imports: [CommonModule, FormsModule, AgGridStub] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(CustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  describe('initialisation', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('calls getCustomers once on init', () => {
      expect(svcSpy.getCustomers).toHaveBeenCalledTimes(1);
    });

    it('sets isLoading to false after data arrives', () => {
      expect(component.isLoading).toBeFalse();
    });

    it('populates rowData after load', () => {
      // Jane(1+1) + John(1+2) + Bob(1) = 6 rows all expanded
      expect(component.rowData.length).toBe(6);
    });

    it('sets totalRows to full flat count', () => {
      expect(component.totalRows).toBe(6);
    });

    it('defaults to page 1', () => {
      expect(component.currentPage).toBe(1);
    });

    it('defaults pageSize to 10', () => {
      expect(component.pageSize).toBe(10);
    });

    it('has 8 column definitions', () => {
      expect(component.columnDefs.length).toBe(8);
    });

    it('first column uses NameCellComponent', () => {
      expect(component.columnDefs[0].cellRenderer).toBe(NameCellComponent);
    });

    it('first column uses NameHeaderComponent', () => {
      expect(component.columnDefs[0].headerComponent).toBe(NameHeaderComponent);
    });

    it('defaultColDef suppresses AG Grid native checkboxes', () => {
      expect(component.defaultColDef.checkboxSelection).toBeFalse();
      expect(component.defaultColDef.headerCheckboxSelection).toBeFalse();
    });
  });

  // ── Load error ─────────────────────────────────────────────────────────────
  describe('loadData error', () => {
    it('sets loadError and clears isLoading on service error', () => {
      svcSpy.getCustomers.and.returnValue(throwError(() => new Error('fail')));
      component.loadData();
      fixture.detectChanges();
      expect(component.loadError).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  describe('pagination', () => {
    it('paginationFrom is 1 on page 1 with data', () => {
      expect(component.paginationFrom).toBe(1);
    });

    it('paginationTo does not exceed totalRows', () => {
      expect(component.paginationTo).toBeLessThanOrEqual(component.totalRows);
    });

    it('goPage ignores values below 1', () => {
      component.goPage(0);
      expect(component.currentPage).toBe(1);
    });

    it('goPage ignores values beyond totalPages', () => {
      component.goPage(999);
      expect(component.currentPage).toBe(component.totalPages);
    });

    it('goPage navigates to a valid page', () => {
      // Load enough rows to have multiple pages
      const big = { totalCount: 30, data: Array.from({ length: 15 }, (_, i) => ({
        legalName: `P${i}`, ocifId: `CS-${i}`, status: 'N/A', holdName: '',
        lifecycle: 'Active', roleType: 'Primary', customerStatus: 'Active',
        address: ADDR, isParent: false, isExpanded: false, children: [],
      })) };
      svcSpy.getCustomers.and.returnValue(of(big as any));
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

    it('pageNumbers is [1] when only one page exists', () => {
      expect(component.pageNumbers).toEqual([1]);
    });

    it('pageNumbers contains ellipsis when many pages', () => {
      const big = { totalCount: 100, data: Array.from({ length: 50 }, (_, i) => ({
        legalName: `P${i}`, ocifId: `CS-${i}`, status: 'N/A', holdName: '',
        lifecycle: 'Active', roleType: 'Primary', customerStatus: 'Active',
        address: ADDR, isParent: false, isExpanded: false, children: [],
      })) };
      svcSpy.getCustomers.and.returnValue(of(big as any));
      component.loadData();
      fixture.detectChanges();
      component.goPage(5);
      expect(component.pageNumbers).toContain('…');
    });
  });

  // ── Expand / collapse ──────────────────────────────────────────────────────
  describe('expand / collapse', () => {
    it('all clusters start expanded (6 visible rows)', () => {
      expect(component.rowData.length).toBe(6);
    });

    it('toggleExpand collapses a parent and removes its children from rowData', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      const before = component.rowData.length;
      component.toggleExpand(jane._uid);
      fixture.detectChanges();
      expect(component.rowData.length).toBe(before - 1); // 1 child removed
    });

    it('toggleExpand re-expands a collapsed cluster', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid);
      const afterCollapse = component.rowData.length;
      component.toggleExpand(jane._uid);
      expect(component.rowData.length).toBe(afterCollapse + 1);
    });

    it('collapsed parent gets _isClusterEnd = true', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid);
      fixture.detectChanges();
      const collapsed = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      expect(collapsed._isClusterEnd).toBeTrue();
    });

    it('getRowClass returns row-parent-expanded for an expanded parent', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      expect(component.getRowClass({ data: jane })).toContain('row-parent-expanded');
    });

    it('getRowClass returns row-parent-collapsed for a collapsed parent', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid);
      fixture.detectChanges();
      const collapsed = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      expect(component.getRowClass({ data: collapsed })).toContain('row-parent-collapsed');
    });

    it('getRowClass returns row-child for child rows', () => {
      const jr = component.rowData.find(r => r.legalName === 'Jane Doe Jr.')!;
      expect(component.getRowClass({ data: jr })).toContain('row-child');
    });

    it('last child in cluster gets row-cluster-end', () => {
      const jr = component.rowData.find(r => r.legalName === 'Jane Doe Jr.')!;
      expect(jr._isClusterEnd).toBeTrue();
      expect(component.getRowClass({ data: jr })).toContain('row-cluster-end');
    });
  });

  // ── Checkbox selection cascade ─────────────────────────────────────────────
  describe('onCheckboxClick', () => {
    it('selecting a parent selects all its children', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid);
      fixture.detectChanges();

      const updatedJane = component.rowData.find(r => r._uid === jane._uid)!;
      const janeJr      = component.rowData.find(r => r.legalName === 'Jane Doe Jr.')!;
      expect(updatedJane._selected).toBeTrue();
      expect(janeJr._selected).toBeTrue();
    });

    it('deselecting a parent deselects all children', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid); // select
      component.onCheckboxClick(jane._uid); // deselect
      fixture.detectChanges();

      const janeJr = component.rowData.find(r => r.legalName === 'Jane Doe Jr.')!;
      expect(janeJr._selected).toBeFalse();
    });

    it('selecting all children auto-selects the parent', () => {
      const john = component.rowData.find(r => r.legalName === 'John Smith' && r._isParent)!;
      const jr   = component.rowData.find(r => r.legalName === 'John Smith Jr.')!;
      const sr   = component.rowData.find(r => r.legalName === 'John Smith Sr.')!;

      component.onCheckboxClick(jr._uid);
      fixture.detectChanges();
      // Only one child selected — parent stays unchecked
      const afterOne = component.rowData.find(r => r._uid === john._uid)!;
      expect(afterOne._selected).toBeFalse();

      component.onCheckboxClick(sr._uid);
      fixture.detectChanges();
      // All children now selected — parent auto-checks
      const afterAll = component.rowData.find(r => r._uid === john._uid)!;
      expect(afterAll._selected).toBeTrue();
    });

    it('deselecting one child deselects the parent', () => {
      const john = component.rowData.find(r => r.legalName === 'John Smith' && r._isParent)!;
      component.onCheckboxClick(john._uid); // select all
      fixture.detectChanges();

      const jr = component.rowData.find(r => r.legalName === 'John Smith Jr.')!;
      component.onCheckboxClick(jr._uid); // deselect one child
      fixture.detectChanges();

      const updatedJohn = component.rowData.find(r => r._uid === john._uid)!;
      expect(updatedJohn._selected).toBeFalse();
    });

    it('selecting a standalone row (no children) selects only itself', () => {
      const bob = component.rowData.find(r => r.legalName === 'Bob Johnson')!;
      component.onCheckboxClick(bob._uid);
      fixture.detectChanges();
      const updated = component.rowData.find(r => r._uid === bob._uid)!;
      expect(updated._selected).toBeTrue();
    });
  });

  // ── Select all ─────────────────────────────────────────────────────────────
  describe('onSelectAll', () => {
    it('onSelectAll(true) selects every row', () => {
      component.onSelectAll(true);
      fixture.detectChanges();
      expect(component.rowData.every(r => r._selected)).toBeTrue();
    });

    it('onSelectAll(false) deselects every row', () => {
      component.onSelectAll(true);
      component.onSelectAll(false);
      fixture.detectChanges();
      expect(component.rowData.some(r => r._selected)).toBeFalse();
    });
  });

  // ── selectionChanged output ────────────────────────────────────────────────
  describe('selectionChanged output', () => {
    it('emits selected rows after a checkbox click', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid);
      fixture.detectChanges();

      // Jane parent + Jane Jr = 2
      const last = emitted[emitted.length - 1];
      expect(last.length).toBe(2);
    });

    it('emits all rows after onSelectAll(true)', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      component.onSelectAll(true);
      fixture.detectChanges();

      const last = emitted[emitted.length - 1];
      expect(last.length).toBe(6);
    });

    it('emits empty array after onSelectAll(false)', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(rows => emitted.push(rows));

      component.onSelectAll(true);
      component.onSelectAll(false);
      fixture.detectChanges();

      const last = emitted[emitted.length - 1];
      expect(last.length).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NameCellComponent tests
// ─────────────────────────────────────────────────────────────────────────────
describe('NameCellComponent', () => {
  let component: NameCellComponent;
  let fixture:   ComponentFixture<NameCellComponent>;

  function makeParams(overrides: Partial<GridRow> = {}): ICellRendererParams {
    return {
      value: overrides.legalName ?? 'Test Name',
      data: {
        _uid: 'test-uid', _isParent: false, _expanded: false,
        _selected: false, _isClusterEnd: false,
        ...overrides,
      },
      onCheck:  () => {},
      onToggle: () => {},
    } as any;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, NameCellComponent],
    }).compileComponents();
    fixture   = TestBed.createComponent(NameCellComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('agInit populates name, isParent, expanded, selected', () => {
    component.agInit(makeParams({ _isParent: true, _expanded: true, _selected: false }));
    expect(component.name).toBe('Test Name');
    expect(component.isParent).toBeTrue();
    expect(component.expanded).toBeTrue();
    expect(component.selected).toBeFalse();
  });

  it('refresh updates state and returns true', () => {
    component.agInit(makeParams({ _expanded: false }));
    const result = component.refresh(makeParams({ _expanded: true }));
    expect(result).toBeTrue();
    expect(component.expanded).toBeTrue();
  });

  it('cb-box--checked class applied when selected=true', () => {
    component.agInit(makeParams({ _selected: true }));
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.css('.cb-box'));
    expect(box.classes['cb-box--checked']).toBeTrue();
  });

  it('cb-box--checked class not applied when selected=false', () => {
    component.agInit(makeParams({ _selected: false }));
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.css('.cb-box'));
    expect(box.classes['cb-box--checked']).toBeFalsy();
  });

  it('tick SVG rendered when selected=true', () => {
    component.agInit(makeParams({ _selected: true }));
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('.cb-box svg'));
    expect(svg).toBeTruthy();
  });

  it('tick SVG not rendered when selected=false', () => {
    component.agInit(makeParams({ _selected: false }));
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('.cb-box svg'));
    expect(svg).toBeNull();
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

  it('chevron SVG has transform rotate(0deg) when expanded', () => {
    component.agInit(makeParams({ _isParent: true, _expanded: true }));
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('.chevron-btn svg'));
    expect(svg.styles['transform']).toBe('rotate(0deg)');
  });

  it('chevron SVG has transform rotate(-90deg) when collapsed', () => {
    component.agInit(makeParams({ _isParent: true, _expanded: false }));
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('.chevron-btn svg'));
    expect(svg.styles['transform']).toBe('rotate(-90deg)');
  });

  it('onCheckClick stops propagation and calls onCheck with uid', () => {
    const onCheck = jasmine.createSpy('onCheck');
    const p = makeParams({ _uid: 'abc-123' });
    (p as any).onCheck = onCheck;
    component.agInit(p);

    const e = new MouseEvent('click');
    spyOn(e, 'stopPropagation');
    component.onCheckClick(e);

    expect(e.stopPropagation).toHaveBeenCalled();
    expect(onCheck).toHaveBeenCalledWith('abc-123');
  });

  it('onChevronClick stops propagation and calls onToggle with uid', () => {
    const onToggle = jasmine.createSpy('onToggle');
    const p = makeParams({ _uid: 'xyz-456', _isParent: true });
    (p as any).onToggle = onToggle;
    component.agInit(p);

    const e = new MouseEvent('click');
    spyOn(e, 'stopPropagation');
    component.onChevronClick(e);

    expect(e.stopPropagation).toHaveBeenCalled();
    expect(onToggle).toHaveBeenCalledWith('xyz-456');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NameHeaderComponent tests
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

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('agInit sets state', () => {
    component.agInit({ state: 'some', onSelectAll: () => {} });
    expect(component.state).toBe('some');
  });

  it('refresh updates state and returns true', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} });
    const result = component.refresh({ state: 'all', onSelectAll: () => {} });
    expect(result).toBeTrue();
    expect(component.state).toBe('all');
  });

  it('cb-box--checked applied when state is "all"', () => {
    component.agInit({ state: 'all', onSelectAll: () => {} });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue();
  });

  it('cb-box--checked applied when state is "some"', () => {
    component.agInit({ state: 'some', onSelectAll: () => {} });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue();
  });

  it('cb-box--checked NOT applied when state is "none"', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeFalsy();
  });

  it('tick SVG shown when state is "all"', () => {
    component.agInit({ state: 'all', onSelectAll: () => {} });
    fixture.detectChanges();
    // The tick polyline SVG should be present
    const svgs = fixture.debugElement.queryAll(By.css('.cb-box svg'));
    expect(svgs.length).toBe(1);
  });

  it('dash SVG shown when state is "some"', () => {
    component.agInit({ state: 'some', onSelectAll: () => {} });
    fixture.detectChanges();
    const svgs = fixture.debugElement.queryAll(By.css('.cb-box svg'));
    expect(svgs.length).toBe(1);
  });

  it('no SVG shown when state is "none"', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} });
    fixture.detectChanges();
    const svgs = fixture.debugElement.queryAll(By.css('.cb-box svg'));
    expect(svgs.length).toBe(0);
  });

  it('onClick calls onSelectAll(true) when state is none', () => {
    const spy = jasmine.createSpy('onSelectAll');
    component.agInit({ state: 'none', onSelectAll: spy });
    const e = new MouseEvent('click');
    spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('onClick calls onSelectAll(false) when state is all', () => {
    const spy = jasmine.createSpy('onSelectAll');
    component.agInit({ state: 'all', onSelectAll: spy });
    const e = new MouseEvent('click');
    spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('onClick calls onSelectAll(true) when state is some', () => {
    const spy = jasmine.createSpy('onSelectAll');
    component.agInit({ state: 'some', onSelectAll: spy });
    const e = new MouseEvent('click');
    spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(spy).toHaveBeenCalledWith(true);
  });
});
