import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsGridComponent } from './results-grid.component';

describe('ResultsGridComponent', () => {
  let component: ResultsGridComponent;
  let fixture: ComponentFixture<ResultsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with nested mock rows', () => {
    expect(component.rowData.length).toBeGreaterThan(0);
    expect(component.rowData.some((row) => row.level > 0)).toBeTrue();
    expect(component['nodeById'].get('DEEP-2')?.level).toBe(4);
  });

  it('should clear all selected rows when deselectRows is called', () => {
    const firstRow = component.rowData[0];
    const secondRow = component.rowData[1];

    component['selectedIds'].add(firstRow.id);
    component['selectedIds'].add(secondRow.id);
    component.deselectRows([firstRow.id, secondRow.id]);

    expect(component['selectedIds'].size).toBe(0);
  });

  it('should select a full cluster when a parent is selected', () => {
    const parentId = 'C2-001';
    component['updateClusterSelection'](parentId, true);

    const descendants = component['descendantsById'].get(parentId) as string[];
    const selectedIds = component['selectedIds'] as Set<string>;

    expect(selectedIds.has(parentId)).toBeTrue();
    expect(descendants.every((id) => selectedIds.has(id))).toBeTrue();
  });

  it('should auto-select parent when all descendants are selected', () => {
    const parentId = 'C2-001';
    const descendants = component['descendantsById'].get(parentId) as string[];
    const selectedIds = component['selectedIds'] as Set<string>;

    descendants.forEach((id) => selectedIds.add(id));
    component['syncAncestorSelection'](descendants[descendants.length - 1]);

    expect(selectedIds.has(parentId)).toBeTrue();
  });
});
