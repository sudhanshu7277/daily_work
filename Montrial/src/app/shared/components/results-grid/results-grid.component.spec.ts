import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsGridComponent } from './results-grid.component';

describe('ResultsGridComponent', () => {
  let component: ResultsGridComponent;
  let fixture: ComponentFixture<ResultsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ResultsGridComponent] }).compileComponents();
    fixture = TestBed.createComponent(ResultsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should verify Profile Name has sortable enabled', () => {
    const profileCol = component.columnDefs.find(c => c.field === 'legalName');
    expect(profileCol?.sortable).toBeTrue();
  });

  it('should toggle expanded-parent-row class', () => {
    const parentRow = { isParent: true, isExpanded: true };
    const result = component.rowClassRules['expanded-parent-row']({ data: parentRow });
    expect(result).toBeTrue();
  });
});