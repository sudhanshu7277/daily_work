import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResultsGridComponent } from './results-grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('ResultsGridComponent', () => {
  let component: ResultsGridComponent;
  let fixture: ComponentFixture<ResultsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResultsGridComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize with all filters selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedFilterIds.length).toBe(component.filterOptions.length);
  });

  it('should filter rowData correctly when searching by OCIF ID', fakeAsync(() => {
    // Setup: Mock data with two different items
    (component as any).allMockData = [
      { legalName: 'Jane Doe', ocifId: '123' },
      { legalName: 'John Smith', ocifId: '999' }
    ];
  
    component.performSearch({ ocifId: '999' });
    tick(600);
    fixture.detectChanges();
    expect(component.rowData.length).toBe(1);
    expect(component.rowData[0].legalName).toBe('John Smith');
  }));
  
  it('should show the no-rows overlay when no matches are found', fakeAsync(() => {
    component.performSearch({ legalName: 'Non-Existent User' });
    tick(600);
    fixture.detectChanges();
    expect(component.rowData.length).toBe(0);
    const gridApiSpy = (component as any).gridApi;
    expect(gridApiSpy.showNoRowsOverlay).toHaveBeenCalled;
  }));

  it('should show summary and chips immediately after performSearch succeeds', fakeAsync(() => {
    let header = fixture.debugElement.query(By.css('.header-section'));
    let chips = fixture.debugElement.query(By.css('.chips-row'));
    expect(header).toBeNull();
    expect(chips).toBeNull();
    component.performSearch({ firstName: 'Jane' });
    tick(600);
    fixture.detectChanges();
    header = fixture.debugElement.query(By.css('.header-section'));
    chips = fixture.debugElement.query(By.css('.chips-row'));
    expect(header).not.toBeNull();
    expect(chips).not.toBeNull();
    expect(component.rowData.length).toBeGreaterThan(0);
  }));

  it('should update column visibility when removeFilter is called', () => {
    const gridApiSpy = (component as any).gridApi;
    const setColumnVisibleSpy = spyOn(gridApiSpy, 'setColumnVisible');
    const idToRemove = 'address';
    component.removeFilter(idToRemove);
    expect(component.selectedFilterIds).not.toContain(idToRemove);
    expect(setColumnVisibleSpy).toHaveBeenCalledWith(idToRemove, false);
  });

  it('should render the correct number of chips based on activeFilters', fakeAsync(() => {
    component.performSearch({});
    tick(600);
    fixture.detectChanges();
    const chipElements = fixture.debugElement.queryAll(By.css('.bmo-pill'));
    expect(chipElements.length).toBe(component.selectedFilterIds.length);
  }));

  it('should reset all filters and columns when resetFilters is clicked', () => {
    const gridApiSpy = (component as any).gridApi;
    const setColumnVisibleSpy = spyOn(gridApiSpy, 'setColumnVisible');
    component.selectedFilterIds = ['ocifId'];
    component.resetFilters();
    expect(component.selectedFilterIds.length).toBe(component.filterOptions.length);
    expect(setColumnVisibleSpy).toHaveBeenCalledWith('address', true);
  });

  it('should call setSelected(false) on the correct node when deselectRow is triggered', () => {
    const gridApiSpy = (component as any).gridApi;
    const mockNode = { 
      data: { ocifId: '123' }, 
      setSelected: jasmine.createSpy('setSelected') 
    };

    spyOn(gridApiSpy, 'forEachNode').and.callFake((callback: Function) => {
      callback(mockNode);
    });

    component.deselectRow({ ocifId: '123' });
    expect(mockNode.setSelected).toHaveBeenCalledWith(false);
  });
});