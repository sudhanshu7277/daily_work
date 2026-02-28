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

  it('should initialize with mock data', () => {
    expect(component.rowData.length).toBeGreaterThan(0);
  });

  it('should apply the expanded-parent-row class correctly', () => {
    const parent = { isParent: true, isExpanded: true };
    const result = component.rowClassRules['expanded-parent-row']({ data: parent });
    expect(result).toBeTrue();
  });
});