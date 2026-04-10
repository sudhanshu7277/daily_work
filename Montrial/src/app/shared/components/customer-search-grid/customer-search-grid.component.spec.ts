import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { of, throwError } from 'rxjs';

import {
  CustomerSearchComponent,
  NameCellComponent,
  NameHeaderComponent,
  GridRow,
} from './customer-search.component';
import { CustomerSearchService } from './customer-search.service';

// ─────────────────────────────────────────────────────────────────────────────
// AG Grid stub
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
  @Input() animateRows: any;
  @Input() getRowClass: any;
  @Output() gridReady = new EventEmitter<any>();
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
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
        customerStatus: 'Inactive', address: ADDR,
        isParent: false, isExpanded: false, children: [],
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
      imports: [CommonModule, FormsModule, AgGridStub, CustomerSearchComponent],
      providers: [{ provide: CustomerSearchService, useValue: svcSpy }],
    })
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
    it('creates the component', () => expect(component).toBeTruthy());

    it('calls getCustomers once on init', () =>
      expect(svcSpy.getCustomers).toHaveBeenCalledTimes(1));

    it('sets isLoading false after data loads', () =>
      expect(component.isLoading).toBeFalse());

    it('rowData has 6 rows (all expanded)', () =>
      expect(component.rowData.length).toBe(6));

    it('totalRows is 6', () => expect(component.totalRows).toBe(6));

    it('defaults to page 1', () => expect(component.currentPage).toBe(1));

    it('defaults pageSize to 10', () => expect(component.pageSize).toBe(10));

    it('has 8 column definitions', () =>
      expect(component.columnDefs.length).toBe(8));

    it('first column uses NameCellComponent', () =>
      expect(component.columnDefs[0].cellRenderer).toBe(NameCellComponent));

    it('first column uses NameHeaderComponent', () =>
      expect(component.columnDefs[0].headerComponent).toBe(NameHeaderComponent));

    it('defaultColDef has no checkboxSelection (v32 uses rowSelection object)', () =>
      expect((component.defaultColDef as any).checkboxSelection).toBeUndefined());
  });

  // ── Load error ─────────────────────────────────────────────────────────────
  describe('loadData error', () => {
    it('sets loadError on service failure', () => {
      svcSpy.getCustomers.and.returnValue(throwError(() => new Error('fail')));
      component.loadData();
      fixture.detectChanges();
      expect(component.loadError).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  describe('pagination', () => {
    it('paginationFrom is 1 on page 1', () => expect(component.paginationFrom).toBe(1));

    it('paginationTo <= totalRows', () =>
      expect(component.paginationTo).toBeLessThanOrEqual(component.totalRows));

    it('goPage ignores page < 1', () => { component.goPage(0); expect(component.currentPage).toBe(1); });

    it('goPage ignores page > totalPages', () => {
      component.goPage(999); expect(component.currentPage).toBe(component.totalPages);
    });

    it('goPage navigates to valid page', () => {
      const big = { totalCount: 30, data: Array.from({ length: 15 }, (_, i) => ({
        legalName: `P${i}`, ocifId: `CS-${i}`, status: 'N/A', holdName: '',
        lifecycle: 'Active', roleType: 'Primary', customerStatus: 'Active',
        address: ADDR, isParent: false, isExpanded: false, children: [],
      })) };
      svcSpy.getCustomers.and.returnValue(of(big as any));
      component.loadData(); fixture.detectChanges();
      component.goPage(2);
      expect(component.currentPage).toBe(2);
    });

    it('onPageSizeChange resets to page 1', () => {
      component.currentPage = 3; component.pageSize = 25;
      component.onPageSizeChange();
      expect(component.currentPage).toBe(1);
    });

    it('pageNumbers contains ellipsis for many pages', () => {
      const big = { totalCount: 100, data: Array.from({ length: 50 }, (_, i) => ({
        legalName: `P${i}`, ocifId: `CS-${i}`, status: 'N/A', holdName: '',
        lifecycle: 'Active', roleType: 'Primary', customerStatus: 'Active',
        address: ADDR, isParent: false, isExpanded: false, children: [],
      })) };
      svcSpy.getCustomers.and.returnValue(of(big as any));
      component.loadData(); fixture.detectChanges();
      component.goPage(5);
      expect(component.pageNumbers).toContain('…');
    });
  });

  // ── Expand / collapse ──────────────────────────────────────────────────────
  describe('expand / collapse', () => {
    it('all clusters start expanded — 6 rows', () =>
      expect(component.rowData.length).toBe(6));

    it('collapsing Jane removes her child (5 rows)', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid); fixture.detectChanges();
      expect(component.rowData.length).toBe(5);
    });

    it('re-expanding Jane restores child (6 rows)', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid);
      component.toggleExpand(jane._uid);
      fixture.detectChanges();
      expect(component.rowData.length).toBe(6);
    });

    it('collapsed parent gets _isClusterEnd = true', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid); fixture.detectChanges();
      const row = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      expect(row._isClusterEnd).toBeTrue();
    });

    it('getRowClass returns row-parent-expanded', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      expect(component.getRowClass({ data: jane })).toContain('row-parent-expanded');
    });

    it('getRowClass returns row-parent-collapsed after toggle', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid); fixture.detectChanges();
      const row = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      expect(component.getRowClass({ data: row })).toContain('row-parent-collapsed');
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

  // ── Checkbox selection ─────────────────────────────────────────────────────
  describe('onCheckboxClick', () => {
    it('selecting parent selects all children', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid); fixture.detectChanges();
      expect(component.rowData.find(r => r._uid === jane._uid)!._selected).toBeTrue();
      expect(component.rowData.find(r => r.legalName === 'Jane Doe Jr.')!._selected).toBeTrue();
    });

    it('deselecting parent deselects all children', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid);
      component.onCheckboxClick(jane._uid);
      fixture.detectChanges();
      expect(component.rowData.find(r => r.legalName === 'Jane Doe Jr.')!._selected).toBeFalse();
    });

    it('selecting all children auto-selects parent', () => {
      const john = component.rowData.find(r => r.legalName === 'John Smith' && r._isParent)!;
      const jr   = component.rowData.find(r => r.legalName === 'John Smith Jr.')!;
      const sr   = component.rowData.find(r => r.legalName === 'John Smith Sr.')!;

      component.onCheckboxClick(jr._uid); fixture.detectChanges();
      expect(component.rowData.find(r => r._uid === john._uid)!._selected).toBeFalse();

      component.onCheckboxClick(sr._uid); fixture.detectChanges();
      expect(component.rowData.find(r => r._uid === john._uid)!._selected).toBeTrue();
    });

    it('deselecting one child deselects parent', () => {
      const john = component.rowData.find(r => r.legalName === 'John Smith' && r._isParent)!;
      component.onCheckboxClick(john._uid); fixture.detectChanges();
      const jr = component.rowData.find(r => r.legalName === 'John Smith Jr.')!;
      component.onCheckboxClick(jr._uid); fixture.detectChanges();
      expect(component.rowData.find(r => r._uid === john._uid)!._selected).toBeFalse();
    });

    it('standalone row selects only itself', () => {
      const bob = component.rowData.find(r => r.legalName === 'Bob Johnson')!;
      component.onCheckboxClick(bob._uid); fixture.detectChanges();
      expect(component.rowData.find(r => r._uid === bob._uid)!._selected).toBeTrue();
    });
  });

  // ── Select all ─────────────────────────────────────────────────────────────
  describe('onSelectAll', () => {
    it('selects every row', () => {
      component.onSelectAll(true); fixture.detectChanges();
      expect(component.rowData.every(r => r._selected)).toBeTrue();
    });

    it('deselects every row', () => {
      component.onSelectAll(true);
      component.onSelectAll(false); fixture.detectChanges();
      expect(component.rowData.some(r => r._selected)).toBeFalse();
    });
  });

  // ── selectionChanged output ────────────────────────────────────────────────
  describe('selectionChanged', () => {
    it('emits 2 rows when Jane parent is selected', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(r => emitted.push(r));
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid); fixture.detectChanges();
      expect(emitted[emitted.length - 1].length).toBe(2);
    });

    it('emits all 6 rows on selectAll(true)', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(r => emitted.push(r));
      component.onSelectAll(true); fixture.detectChanges();
      expect(emitted[emitted.length - 1].length).toBe(6);
    });

    it('emits 0 rows on selectAll(false)', () => {
      const emitted: any[][] = [];
      component.selectionChanged.subscribe(r => emitted.push(r));
      component.onSelectAll(true);
      component.onSelectAll(false); fixture.detectChanges();
      expect(emitted[emitted.length - 1].length).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NameCellComponent tests
// ─────────────────────────────────────────────────────────────────────────────
describe('NameCellComponent', () => {
  let component: NameCellComponent;
  let fixture:   ComponentFixture<NameCellComponent>;

  function params(overrides: Partial<GridRow> = {}): any {
    return {
      value:   overrides.legalName ?? 'Test',
      data:    { _uid:'uid', _isParent:false, _expanded:false, _selected:false, _isClusterEnd:false, ...overrides },
      onCheck:  () => {},
      onToggle: () => {},
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [CommonModule, NameCellComponent],
      providers: [NgZone],
    }).compileComponents();
    fixture   = TestBed.createComponent(NameCellComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => expect(component).toBeTruthy());

  it('agInit sets fields', () => {
    component.agInit(params({ _isParent: true, _expanded: true }));
    expect(component.isParent).toBeTrue();
    expect(component.expanded).toBeTrue();
  });

  it('refresh returns true and updates expanded', () => {
    component.agInit(params({ _expanded: false }));
    expect(component.refresh(params({ _expanded: true }))).toBeTrue();
    expect(component.expanded).toBeTrue();
  });

  it('cb-box--checked applied when selected', () => {
    component.agInit(params({ _selected: true }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue();
  });

  it('cb-box--checked not applied when not selected', () => {
    component.agInit(params({ _selected: false }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeFalsy();
  });

  it('tick SVG present when selected', () => {
    component.agInit(params({ _selected: true }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box svg'))).toBeTruthy();
  });

  it('tick SVG absent when not selected', () => {
    component.agInit(params({ _selected: false }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box svg'))).toBeNull();
  });

  it('chevron shown only for parent', () => {
    component.agInit(params({ _isParent: true }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn'))).toBeTruthy();
  });

  it('chevron hidden for child', () => {
    component.agInit(params({ _isParent: false }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn'))).toBeNull();
  });

  it('chevron rotate(0deg) when expanded', () => {
    component.agInit(params({ _isParent: true, _expanded: true }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn svg')).styles['transform']).toBe('rotate(0deg)');
  });

  it('chevron rotate(-90deg) when collapsed', () => {
    component.agInit(params({ _isParent: true, _expanded: false }));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn svg')).styles['transform']).toBe('rotate(-90deg)');
  });

  it('onCheckClick calls onCheck with uid', () => {
    const spy = jasmine.createSpy();
    const p = params({ _uid: 'abc' }); p.onCheck = spy;
    component.agInit(p);
    const e = new MouseEvent('click'); spyOn(e, 'stopPropagation');
    component.onCheckClick(e);
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('onChevronClick calls onToggle with uid', () => {
    const spy = jasmine.createSpy();
    const p = params({ _uid: 'xyz', _isParent: true }); p.onToggle = spy;
    component.agInit(p);
    const e = new MouseEvent('click'); spyOn(e, 'stopPropagation');
    component.onChevronClick(e);
    expect(spy).toHaveBeenCalledWith('xyz');
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
      imports:   [CommonModule, NameHeaderComponent],
      providers: [NgZone],
    }).compileComponents();
    fixture   = TestBed.createComponent(NameHeaderComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => expect(component).toBeTruthy());

  it('agInit sets state', () => {
    component.agInit({ state: 'some', onSelectAll: () => {} });
    expect(component.state).toBe('some');
  });

  it('refresh updates state and returns true', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} });
    expect(component.refresh({ state: 'all', onSelectAll: () => {} })).toBeTrue();
    expect(component.state).toBe('all');
  });

  it('cb-box--checked when state is all', () => {
    component.agInit({ state: 'all', onSelectAll: () => {} }); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue();
  });

  it('cb-box--checked when state is some', () => {
    component.agInit({ state: 'some', onSelectAll: () => {} }); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue();
  });

  it('cb-box--checked false when state is none', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} }); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeFalsy();
  });

  it('tick SVG when all', () => {
    component.agInit({ state: 'all', onSelectAll: () => {} }); fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.cb-box svg')).length).toBe(1);
  });

  it('dash SVG when some', () => {
    component.agInit({ state: 'some', onSelectAll: () => {} }); fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.cb-box svg')).length).toBe(1);
  });

  it('no SVG when none', () => {
    component.agInit({ state: 'none', onSelectAll: () => {} }); fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.cb-box svg')).length).toBe(0);
  });

  it('onClick(none) calls onSelectAll(true)', () => {
    const spy = jasmine.createSpy();
    component.agInit({ state: 'none', onSelectAll: spy });
    const e = new MouseEvent('click'); spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('onClick(all) calls onSelectAll(false)', () => {
    const spy = jasmine.createSpy();
    component.agInit({ state: 'all', onSelectAll: spy });
    const e = new MouseEvent('click'); spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('onClick(some) calls onSelectAll(true)', () => {
    const spy = jasmine.createSpy();
    component.agInit({ state: 'some', onSelectAll: spy });
    const e = new MouseEvent('click'); spyOn(e, 'stopPropagation');
    component.onClick(e);
    expect(spy).toHaveBeenCalledWith(true);
  });
});
