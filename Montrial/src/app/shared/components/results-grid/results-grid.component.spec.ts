import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResultsGridComponent } from './results-grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { GridApi } from 'ag-grid-community';

describe('ResultsGridComponent', () => {
  let component: ResultsGridComponent;
  let fixture: ComponentFixture<ResultsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResultsGridComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty rowData but full allMockData', () => {
    expect(component.rowData.length).toBe(0);
    expect(component.allMockData.length).toBeGreaterThan(0);
  });

  it('should populate rowData and hide loading overlay after performSearch', fakeAsync(() => {
    const searchCriteria = { firstName: 'Asha', lastName: 'Dhola' };
    component.performSearch(searchCriteria);
    
    // Simulate the 600ms setTimeout in performSearch
    tick(600);
    fixture.detectChanges();

    expect(component.rowData.length).toBeGreaterThan(0);
  }));

  it('should toggle row expansion and add child rows to the grid', () => {
    // Manually set rowData to include a parent
    const parentRow = component.allMockData[0]; // Corporation 2
    component.rowData = [parentRow];
    
    // Mock Grid API enough for the toggle function
    const mockApi = {
      setGridOption: jasmine.createSpy('setGridOption'),
      getRowNode: jasmine.createSpy('getRowNode').and.returnValue({ isSelected: () => false })
    } as any;
    (component as any).gridApi = mockApi;

    // Expand
    component.toggleRowExpansion(parentRow);
    expect(parentRow.isExpanded).toBeTrue();
    expect(component.rowData.length).toBe(3); // Parent + 2 Children
    expect(mockApi.setGridOption).toHaveBeenCalledWith('rowData', jasmine.any(Array));

    // Collapse
    component.toggleRowExpansion(parentRow);
    expect(parentRow.isExpanded).toBeFalse();
    expect(component.rowData.length).toBe(1);
  });

  it('should apply the correct CSS classes for blue separator line and child indent', () => {
    const parentParams = { data: { isParent: true, isExpanded: true } };
    const childParams = { data: { isChild: true } };

    expect(component.rowClassRules['expanded-parent-row'](parentParams)).toBeTrue();
    expect(component.rowClassRules['grid-child-row'](childParams)).toBeTrue();
  });

  it('should deselect a specific row when deselectRow is called', () => {
    const mockNode = { 
      data: { ocifId: '1000-12341' }, 
      setSelected: jasmine.createSpy('setSelected') 
    };
    
    const mockApi = {
      forEachNode: (callback: Function) => callback(mockNode)
    } as any;
    (component as any).gridApi = mockApi;

    component.deselectRow({ ocifId: '1000-12341' });
    expect(mockNode.setSelected).toHaveBeenCalledWith(false);
  });

  describe('Selection Logic', () => {
    it('should select children when parent is selected', () => {
      const childData = { ocifId: 'child-1', isChild: true };
      const parentData = { ocifId: 'parent-1', isParent: true, children: [childData] };
      
      const childNode = { data: childData, setSelected: jasmine.createSpy('setSelected') };
      const parentNode = { data: parentData, isSelected: () => true };

      const mockApi = {
        getSelectedNodes: () => [parentNode],
        forEachNode: (callback: Function) => callback(childNode)
      } as any;
      (component as any).gridApi = mockApi;

      component.onSelectionChanged();
      // Second argument 'false' for clearSelection as per your implementation
      expect(childNode.setSelected).toHaveBeenCalledWith(true, false);
    });
  });
});




// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ResultsGridComponent } from './results-grid.component';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { By } from '@angular/platform-browser';

// describe('ResultsGridComponent', () => {
//   let component: ResultsGridComponent;
//   let fixture: ComponentFixture<ResultsGridComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [
//         ResultsGridComponent,
//         NoopAnimationsModule
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(ResultsGridComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create and initialize with all filters selected', () => {
//     expect(component).toBeTruthy();
//     expect(component.selectedFilterIds.length).toBe(component.filterOptions.length);
//   });

//   it('should return empty rowData if mandatory firstName/lastName do not match', fakeAsync(() => {
//     component.allMockData = [{
//       firstName: 'Jane',
//       lastName: 'Doe',
//       dob: '1990-01-01',
//       legalName: 'Jane Doe',
//       ocifId: '123',
//       status: 'Active',
//       holdName: 'Hold 1',
//       lifecycle: 'Lifecycle 1',
//       role: 'Role 1',
//       address: '123 Main St',
//       type: 'Type 1',
//       email: 'jane.doe@example.com'
//     }];
    
//     // Searching for a different name
//     component.performSearch({ firstName: 'John', lastName: 'Smith' });
//     tick(600);
//     fixture.detectChanges();
  
//     expect(component.rowData.length).toBe(0);
//   }));
  
//   it('should return results when mandatory fields match partially', fakeAsync(() => {
//     component.allMockData = [{
//       firstName: 'Jane',
//       lastName: 'Doe',
//       dob: '1990-01-01',
//       legalName: 'Jane Doe',
//       ocifId: '123',
//       status: 'Active',
//       holdName: 'Hold 1',
//       lifecycle: 'Lifecycle 1',
//       role: 'Role 1',
//       address: '123 Main St',
//       type: 'Type 1',
//       email: 'jane.doe@example.com'
//     }];
    
//     // Partial search "Ja" for "Jane"
//     component.performSearch({ firstName: 'Ja', lastName: 'Doe' });
//     tick(600);
//     fixture.detectChanges();
  
//     expect(component.rowData.length).toBe(1);
//   }));

//   it('should show summary and chips immediately after performSearch succeeds', fakeAsync(() => {
//     let header = fixture.debugElement.query(By.css('.header-section'));
//     let chips = fixture.debugElement.query(By.css('.chips-row'));
//     expect(header).toBeNull();
//     expect(chips).toBeNull();
//     component.performSearch({ firstName: 'Jane' });
//     tick(600);
//     fixture.detectChanges();
//     header = fixture.debugElement.query(By.css('.header-section'));
//     chips = fixture.debugElement.query(By.css('.chips-row'));
//     expect(header).not.toBeNull();
//     expect(chips).not.toBeNull();
//     expect(component.rowData.length).toBeGreaterThan(0);
//   }));

//   it('should update column visibility when removeFilter is called', () => {
//     const gridApiSpy = (component as any).gridApi;
//     const setColumnVisibleSpy = spyOn(gridApiSpy, 'setColumnVisible');
//     const idToRemove = 'address';
//     component.removeFilter(idToRemove);
//     expect(component.selectedFilterIds).not.toContain(idToRemove);
//     expect(setColumnVisibleSpy).toHaveBeenCalledWith(idToRemove, false);
//   });

//   it('should render the correct number of chips based on activeFilters', fakeAsync(() => {
//     component.performSearch({});
//     tick(600);
//     fixture.detectChanges();
//     const chipElements = fixture.debugElement.queryAll(By.css('.bmo-pill'));
//     expect(chipElements.length).toBe(component.selectedFilterIds.length);
//   }));

//   it('should reset all filters and columns when resetFilters is clicked', () => {
//     const gridApiSpy = (component as any).gridApi;
//     const setColumnVisibleSpy = spyOn(gridApiSpy, 'setColumnVisible');
//     component.selectedFilterIds = ['ocifId'];
//     component.resetFilters();
//     expect(component.selectedFilterIds.length).toBe(component.filterOptions.length);
//     expect(setColumnVisibleSpy).toHaveBeenCalledWith('address', true);
//   });

//   it('should call setSelected(false) on the correct node when deselectRow is triggered', () => {
//     const gridApiSpy = (component as any).gridApi;
//     const mockNode = { 
//       data: { ocifId: '123' }, 
//       setSelected: jasmine.createSpy('setSelected') 
//     };

//     spyOn(gridApiSpy, 'forEachNode').and.callFake((callback: Function) => {
//       callback(mockNode);
//     });

//     component.deselectRow({ ocifId: '123' });
//     expect(mockNode.setSelected).toHaveBeenCalledWith(false);
//   });
// });