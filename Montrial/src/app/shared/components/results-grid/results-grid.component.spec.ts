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

  it('should deselect rows based on IDs provided from shell', () => {
    const mockApi = jasmine.createSpyObj('GridApi', ['forEachNode']);
    (component as any).gridApi = mockApi;
    component.deselectRows(['OCIF-123']);
    expect(mockApi.forEachNode).toHaveBeenCalled();
  });

  it('should apply expanded-parent-row class correctly', () => {
    const parent = { isParent: true, isExpanded: true };
    const result = component.rowClassRules['expanded-parent-row']({ data: parent });
    expect(result).toBeTrue();
  });
});