import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ICellRendererParams } from 'ag-grid-community';

import {
  CustomerSearchGridComponent,
  NameCellComponent,
  NameHeaderComponent,
  GridRow,
} from './customer-search-grid.component';
import { CustomerSearchGridService } from './customer-search-grid.service';

// ── AG Grid stub ──────────────────────────────────────────────────────────────
@Component({ selector: 'ag-grid-angular', template: '', standalone: true })
class AgGridStub {
  @Input() rowData: any;
  @Input() columnDefs: any;
  @Input() defaultColDef: any;
  @Input() rowHeight: any;
  @Input() headerHeight: any;
  @Input() suppressCellFocus: any;
  @Input() animateRows: any;
  @Input() getRowClass: any;
  @Output() gridReady = new EventEmitter<any>();
}

// ── Mock data factory ─────────────────────────────────────────────────────────
const ADDR = '33 Dundas St W, Toronto, ON M5G 2C3';

function mockResponse() {
  return {
    totalCount: 6,
    data: [
      {
        firstName: 'Jane', lastName: 'Doe', legalName: 'Jane Doe',
        ocifId: 'CS-0001', status: 'LEGAL HOLD', holdName: 'Hold A',
        lifecycle: 'Active Customer', role: 'Owner', address: ADDR,
        customerStatus: 'Active', roleType: 'Primary',
        isParent: true, isExpanded: true,
        children: [
          { firstName: 'Jane', lastName: 'Doe', legalName: 'Jane Doe',
            ocifId: 'CS-0002', status: 'LEGAL HOLD', holdName: 'Hold A',
            lifecycle: 'Active Customer', role: 'Owner', address: ADDR,
            customerStatus: 'Active', roleType: 'Primary',
            isParent: false, isExpanded: false, children: [] },
        ],
      },
      {
        firstName: 'John', lastName: 'Smith', legalName: 'John Smith',
        ocifId: 'CS-0003', status: 'N/A', holdName: '',
        lifecycle: 'Active Customer', role: 'Owner', address: ADDR,
        customerStatus: 'Active', roleType: 'Secondary',
        isParent: true, isExpanded: true,
        children: [
          { firstName: 'John', lastName: 'Smith', legalName: 'John Smith Jr.',
            ocifId: 'CS-0004', status: 'N/A', holdName: '',
            lifecycle: 'Active Customer', role: 'Owner', address: ADDR,
            customerStatus: 'Active', roleType: 'Secondary',
            isParent: false, isExpanded: false, children: [] },
          { firstName: 'John', lastName: 'Smith', legalName: 'John Smith Sr.',
            ocifId: 'CS-0005', status: 'N/A', holdName: '',
            lifecycle: 'Active Customer', role: 'Owner', address: ADDR,
            customerStatus: 'Active', roleType: 'Secondary',
            isParent: false, isExpanded: false, children: [] },
        ],
      },
      {
        firstName: 'Bob', lastName: 'Johnson', legalName: 'Bob Johnson',
        ocifId: 'CS-0009', status: 'N/A', holdName: '',
        lifecycle: 'Active Customer', role: 'Owner', address: ADDR,
        customerStatus: 'Inactive', roleType: 'Secondary',
        isParent: false, isExpanded: false, children: [],
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomerSearchGridComponent tests
// ─────────────────────────────────────────────────────────────────────────────
describe('CustomerSearchGridComponent', () => {
  let component: CustomerSearchGridComponent;
  let fixture:   ComponentFixture<CustomerSearchGridComponent>;
  let svcSpy:    jasmine.SpyObj<CustomerSearchGridService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('CustomerSearchGridService', ['getCustomers', 'searchCustomers']);
    svcSpy.getCustomers.and.returnValue(of(mockResponse() as any));
    svcSpy.searchCustomers.and.returnValue(of(mockResponse() as any));

    await TestBed.configureTestingModule({
      imports:   [CommonModule, FormsModule, AgGridStub, CustomerSearchGridComponent],
      providers: [{ provide: CustomerSearchGridService, useValue: svcSpy }],
    })
    .overrideComponent(CustomerSearchGridComponent, {
      set: { imports: [CommonModule, FormsModule, AgGridStub] },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(CustomerSearchGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  describe('initialisation', () => {
    it('creates',                        () => expect(component).toBeTruthy());
    it('calls getCustomers once on init',() => expect(svcSpy.getCustomers).toHaveBeenCalledTimes(1));
    it('isLoading false after load',     () => expect(component.isLoading).toBeFalse());
    it('rowData has 6 rows',             () => expect(component.rowData.length).toBe(6));
    it('totalRows is 6',                 () => expect(component.totalRows).toBe(6));
    it('starts on page 1',               () => expect(component.currentPage).toBe(1));
    it('default pageSize is 10',         () => expect(component.pageSize).toBe(10));
    it('has 8 column defs',              () => expect(component.columnDefs.length).toBe(8));
    it('col 0 uses NameCellComponent',   () => expect(component.columnDefs[0].cellRenderer).toBe(NameCellComponent));
    it('col 0 uses NameHeaderComponent', () => expect(component.columnDefs[0].headerComponent).toBe(NameHeaderComponent));
  });

  // ── POST search ────────────────────────────────────────────────────────────
  describe('search() POST', () => {
    it('calls searchCustomers with firstName and lastName', () => {
      component.firstName = 'Jane';
      component.lastName  = 'Doe';
      component.search();
      expect(svcSpy.searchCustomers).toHaveBeenCalledWith({ firstName: 'Jane', lastName: 'Doe' });
    });

    it('trims whitespace from inputs before calling service', () => {
      component.firstName = '  John  ';
      component.lastName  = '  Smith  ';
      component.search();
      expect(svcSpy.searchCustomers).toHaveBeenCalledWith({ firstName: 'John', lastName: 'Smith' });
    });

    it('reloads rowData after search', () => {
      component.firstName = 'Bob';
      component.lastName  = 'Johnson';
      component.search();
      fixture.detectChanges();
      expect(component.rowData.length).toBeGreaterThan(0);
    });
  });

  // ── Load error ─────────────────────────────────────────────────────────────
  describe('loadData error', () => {
    it('sets loadError on failure', () => {
      svcSpy.getCustomers.and.returnValue(throwError(() => new Error('fail')));
      component.loadData(); fixture.detectChanges();
      expect(component.loadError).toBeTrue();
      expect(component.isLoading).toBeFalse();
    });
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  describe('pagination', () => {
    it('paginationFrom = 1',           () => expect(component.paginationFrom).toBe(1));
    it('paginationTo <= totalRows',    () => expect(component.paginationTo).toBeLessThanOrEqual(component.totalRows));
    it('goPage ignores 0',             () => { component.goPage(0);   expect(component.currentPage).toBe(1); });
    it('goPage ignores out-of-range',  () => { component.goPage(999); expect(component.currentPage).toBe(component.totalPages); });
    it('onPageSizeChange resets to 1', () => {
      component.currentPage = 3; component.pageSize = 25;
      component.onPageSizeChange(); expect(component.currentPage).toBe(1);
    });
  });

  // ── Expand / collapse ──────────────────────────────────────────────────────
  describe('expand / collapse', () => {
    it('starts with 6 visible rows', () => expect(component.rowData.length).toBe(6));

    it('collapses Jane → 5 rows', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid); fixture.detectChanges();
      expect(component.rowData.length).toBe(5);
    });

    it('re-expands Jane → 6 rows', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid);
      component.toggleExpand(jane._uid); fixture.detectChanges();
      expect(component.rowData.length).toBe(6);
    });

    it('expanded parent → row-parent-expanded', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      expect(component.getRowClass({ data: jane })).toBe('row-parent-expanded');
    });

    it('collapsed parent → row-parent-collapsed (no cluster-end, no blue)', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.toggleExpand(jane._uid); fixture.detectChanges();
      const row = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      const cls = component.getRowClass({ data: row });
      expect(cls).toBe('row-parent-collapsed');
      expect(cls).not.toContain('row-cluster-end');
    });

    it('child row → row-child', () => {
      const jr = component.rowData.find(r => r.legalName === 'Jane Doe' && !r._isParent)!;
      expect(component.getRowClass({ data: jr })).toContain('row-child');
    });

    it('last child of expanded cluster → row-child row-cluster-end', () => {
      const jr = component.rowData.find(r => r.legalName === 'Jane Doe' && !r._isParent)!;
      expect(jr._isClusterEnd).toBeTrue();
      expect(component.getRowClass({ data: jr })).toBe('row-child row-cluster-end');
    });
  });

  // ── Selection ──────────────────────────────────────────────────────────────
  describe('onCheckboxClick', () => {
    it('selecting parent selects all children', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid); fixture.detectChanges();
      expect(component.rowData.find(r => r._uid === jane._uid)!._selected).toBeTrue();
      expect(component.rowData.find(r => r.legalName === 'Jane Doe' && !r._isParent)!._selected).toBeTrue();
    });

    it('deselecting parent deselects all children', () => {
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid);
      component.onCheckboxClick(jane._uid); fixture.detectChanges();
      expect(component.rowData.find(r => r.legalName === 'Jane Doe' && !r._isParent)!._selected).toBeFalse();
    });

    it('all children selected → parent auto-selects', () => {
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

  describe('onSelectAll', () => {
    it('selects all',   () => { component.onSelectAll(true);  fixture.detectChanges(); expect(component.rowData.every(r => r._selected)).toBeTrue(); });
    it('deselects all', () => { component.onSelectAll(true); component.onSelectAll(false); fixture.detectChanges(); expect(component.rowData.some(r => r._selected)).toBeFalse(); });
  });

  describe('selectionChanged output', () => {
    it('emits 2 rows for Jane parent', () => {
      const out: any[][] = []; component.selectionChanged.subscribe(r => out.push(r));
      const jane = component.rowData.find(r => r.legalName === 'Jane Doe' && r._isParent)!;
      component.onCheckboxClick(jane._uid); fixture.detectChanges();
      expect(out[out.length - 1].length).toBe(2);
    });
    it('emits all 6 on selectAll(true)', () => {
      const out: any[][] = []; component.selectionChanged.subscribe(r => out.push(r));
      component.onSelectAll(true); fixture.detectChanges();
      expect(out[out.length - 1].length).toBe(6);
    });
    it('emits 0 on selectAll(false)', () => {
      const out: any[][] = []; component.selectionChanged.subscribe(r => out.push(r));
      component.onSelectAll(true); component.onSelectAll(false); fixture.detectChanges();
      expect(out[out.length - 1].length).toBe(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NameCellComponent tests
// ─────────────────────────────────────────────────────────────────────────────
describe('NameCellComponent', () => {
  let component: NameCellComponent;
  let fixture:   ComponentFixture<NameCellComponent>;

  function p(o: Partial<GridRow> = {}): ICellRendererParams {
    return {
      value: o.legalName ?? 'Test Name',
      data:  { _uid:'u', _isParent:false, _expanded:false, _selected:false, _isClusterEnd:false, ...o },
      onCheck: () => {}, onToggle: () => {},
    } as any;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CommonModule, NameCellComponent] }).compileComponents();
    fixture   = TestBed.createComponent(NameCellComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => expect(component).toBeTruthy());

  it('agInit sets all fields correctly', () => {
    component.agInit(p({ _isParent: true, _expanded: true, _selected: true }));
    expect(component.isParent).toBeTrue();
    expect(component.expanded).toBeTrue();
    expect(component.selected).toBeTrue();
  });

  it('refresh returns true and updates fields', () => {
    component.agInit(p({ _expanded: false, _selected: false }));
    expect(component.refresh(p({ _expanded: true, _selected: true }))).toBeTrue();
    expect(component.expanded).toBeTrue();
    expect(component.selected).toBeTrue();
  });

  it('cb-box--checked when selected=true', () => {
    component.agInit(p({ _selected: true })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue();
  });

  it('cb-box--checked absent when selected=false', () => {
    component.agInit(p({ _selected: false })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeFalsy();
  });

  it('tick SVG present when selected', () => {
    component.agInit(p({ _selected: true })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box svg'))).toBeTruthy();
  });

  it('tick SVG absent when not selected', () => {
    component.agInit(p({ _selected: false })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.cb-box svg'))).toBeNull();
  });

  it('chevron shown for parent', () => {
    component.agInit(p({ _isParent: true })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn'))).toBeTruthy();
  });

  it('chevron hidden for child', () => {
    component.agInit(p({ _isParent: false })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn'))).toBeNull();
  });

  it('chevron rotate(180deg) when expanded — pointing UP', () => {
    component.agInit(p({ _isParent: true, _expanded: true })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn svg')).styles['transform']).toBe('rotate(180deg)');
  });

  it('chevron rotate(0deg) when collapsed — pointing DOWN', () => {
    component.agInit(p({ _isParent: true, _expanded: false })); fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.chevron-btn svg')).styles['transform']).toBe('rotate(0deg)');
  });

  it('onCheckClick calls onCheck with correct uid', () => {
    const spy = jasmine.createSpy(); const params = p({ _uid: 'abc' }); (params as any).onCheck = spy;
    component.agInit(params);
    const e = new MouseEvent('click'); spyOn(e, 'stopPropagation');
    component.onCheckClick(e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('onChevronClick calls onToggle with correct uid', () => {
    const spy = jasmine.createSpy(); const params = p({ _uid: 'xyz', _isParent: true }); (params as any).onToggle = spy;
    component.agInit(params);
    const e = new MouseEvent('click'); spyOn(e, 'stopPropagation');
    component.onChevronClick(e);
    expect(e.stopPropagation).toHaveBeenCalled();
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
    await TestBed.configureTestingModule({ imports: [CommonModule, NameHeaderComponent] }).compileComponents();
    fixture   = TestBed.createComponent(NameHeaderComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => expect(component).toBeTruthy());

  it('agInit sets state',           () => { component.agInit({ state: 'some', onSelectAll: () => {} }); expect(component.state).toBe('some'); });
  it('refresh updates state',       () => { component.agInit({ state: 'none', onSelectAll: () => {} }); component.refresh({ state: 'all', onSelectAll: () => {} }); expect(component.state).toBe('all'); });
  it('refresh returns true',        () => { component.agInit({ state: 'none', onSelectAll: () => {} }); expect(component.refresh({ state: 'all', onSelectAll: () => {} })).toBeTrue(); });

  it('cb-box--checked when all',    () => { component.agInit({ state: 'all',  onSelectAll: () => {} }); fixture.detectChanges(); expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue(); });
  it('cb-box--checked when some',   () => { component.agInit({ state: 'some', onSelectAll: () => {} }); fixture.detectChanges(); expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeTrue(); });
  it('no cb-box--checked for none', () => { component.agInit({ state: 'none', onSelectAll: () => {} }); fixture.detectChanges(); expect(fixture.debugElement.query(By.css('.cb-box')).classes['cb-box--checked']).toBeFalsy(); });

  it('tick SVG when all',           () => { component.agInit({ state: 'all',  onSelectAll: () => {} }); fixture.detectChanges(); expect(fixture.debugElement.queryAll(By.css('.cb-box svg')).length).toBe(1); });
  it('dash SVG when some',          () => { component.agInit({ state: 'some', onSelectAll: () => {} }); fixture.detectChanges(); expect(fixture.debugElement.queryAll(By.css('.cb-box svg')).length).toBe(1); });
  it('no SVG when none',            () => { component.agInit({ state: 'none', onSelectAll: () => {} }); fixture.detectChanges(); expect(fixture.debugElement.queryAll(By.css('.cb-box svg')).length).toBe(0); });

  it('onClick(none) → onSelectAll(true)',  () => { const s = jasmine.createSpy(); component.agInit({ state: 'none', onSelectAll: s }); component.onClick(new MouseEvent('click')); expect(s).toHaveBeenCalledWith(true); });
  it('onClick(all)  → onSelectAll(false)', () => { const s = jasmine.createSpy(); component.agInit({ state: 'all',  onSelectAll: s }); component.onClick(new MouseEvent('click')); expect(s).toHaveBeenCalledWith(false); });
  it('onClick(some) → onSelectAll(true)',  () => { const s = jasmine.createSpy(); component.agInit({ state: 'some', onSelectAll: s }); component.onClick(new MouseEvent('click')); expect(s).toHaveBeenCalledWith(true); });
});
