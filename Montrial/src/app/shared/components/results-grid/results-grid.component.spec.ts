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
    expect(component.rowData.some((row) => row.depth > 0)).toBeTrue();
  });

  it('should clear all selected rows when deselectRows is called', () => {
    const firstRow = component.rowData[0];
    const secondRow = component.rowData[1];

    component['selectedIds'].add(firstRow.id);
    component['selectedIds'].add(secondRow.id);
    component.deselectRows([firstRow.id, secondRow.id]);

    expect(component['selectedIds'].size).toBe(0);
  });
});
