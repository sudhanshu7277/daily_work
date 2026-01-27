import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResultsGridComponent } from './results-grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

describe('ResultsGridComponent', () => {
  let component: ResultsGridComponent;
  let fixture: ComponentFixture<ResultsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsGridComponent, NoopAnimationsModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should propagate selection to children with fix signature', () => {
    const childNode = { data: { ocifId: 'C1', isChild: true }, setSelected: jasmine.createSpy() };
    const parentNode = { data: { isParent: true, children: [{ ocifId: 'C1' }] }, isSelected: () => true };

    (component as any).gridApi = {
      getSelectedNodes: () => [parentNode],
      forEachNode: (cb: any) => cb(childNode)
    } as any;

    component.onSelectionChanged();
    expect(childNode.setSelected).toHaveBeenCalledWith(true, false);
  });

  it('should apply last-child-row class only to the final child in an expanded group', () => {
    const child2 = { ocifId: 'C2', isChild: true };
    const parent = { 
      ocifId: 'P1', isParent: true, isExpanded: true, 
      children: [{ ocifId: 'C1' }, child2] 
    };
    component['allMockData'] = [parent];

    expect(component.rowClassRules['last-child-row']({ data: child2 })).toBeTrue();
  });
});







// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ResultsGridComponent } from './results-grid.component';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { TranslateModule } from '@ngx-translate/core';
// import { GridApi } from 'ag-grid-community';

// describe('ResultsGridComponent', () => {
//   let component: ResultsGridComponent;
//   let fixture: ComponentFixture<ResultsGridComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [
//         ResultsGridComponent,
//         NoopAnimationsModule,
//         TranslateModule.forRoot()
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(ResultsGridComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should initialize with empty rowData but full allMockData', () => {
//     expect(component.rowData.length).toBe(0);
//     expect(component.allMockData.length).toBeGreaterThan(0);
//   });

//   it('should populate rowData and hide loading overlay after performSearch', fakeAsync(() => {
//     const searchCriteria = { firstName: 'Asha', lastName: 'Dhola' };
//     component.performSearch(searchCriteria);
    
//     // Simulate the 600ms setTimeout in performSearch
//     tick(600);
//     fixture.detectChanges();

//     expect(component.rowData.length).toBeGreaterThan(0);
//   }));

//   it('should toggle row expansion and add child rows to the grid', () => {
//     // Manually set rowData to include a parent
//     const parentRow = component.allMockData[0]; // Corporation 2
//     component.rowData = [parentRow];
    
//     // Mock Grid API enough for the toggle function
//     const mockApi = {
//       setGridOption: jasmine.createSpy('setGridOption'),
//       getRowNode: jasmine.createSpy('getRowNode').and.returnValue({ isSelected: () => false })
//     } as any;
//     (component as any).gridApi = mockApi;

//     // Expand
//     component.toggleRowExpansion(parentRow);
//     expect(parentRow.isExpanded).toBeTrue();
//     expect(component.rowData.length).toBe(3); // Parent + 2 Children
//     expect(mockApi.setGridOption).toHaveBeenCalledWith('rowData', jasmine.any(Array));

//     // Collapse
//     component.toggleRowExpansion(parentRow);
//     expect(parentRow.isExpanded).toBeFalse();
//     expect(component.rowData.length).toBe(1);
//   });

//   it('should apply the correct CSS classes for blue separator line and child indent', () => {
//     const parentParams = { data: { isParent: true, isExpanded: true } };
//     const childParams = { data: { isChild: true } };

//     expect(component.rowClassRules['expanded-parent-row'](parentParams)).toBeTrue();
//     expect(component.rowClassRules['grid-child-row'](childParams)).toBeTrue();
//   });

//   it('should deselect a specific row when deselectRow is called', () => {
//     const mockNode = { 
//       data: { ocifId: '1000-12341' }, 
//       setSelected: jasmine.createSpy('setSelected') 
//     };
    
//     const mockApi = {
//       forEachNode: (callback: Function) => callback(mockNode)
//     } as any;
//     (component as any).gridApi = mockApi;

//     component.deselectRow({ ocifId: '1000-12341' });
//     expect(mockNode.setSelected).toHaveBeenCalledWith(false);
//   });

//   describe('Selection Logic', () => {
//     it('should select children when parent is selected', () => {
//       const childData = { ocifId: 'child-1', isChild: true };
//       const parentData = { ocifId: 'parent-1', isParent: true, children: [childData] };
      
//       const childNode = { data: childData, setSelected: jasmine.createSpy('setSelected') };
//       const parentNode = { data: parentData, isSelected: () => true };

//       const mockApi = {
//         getSelectedNodes: () => [parentNode],
//         forEachNode: (callback: Function) => callback(childNode)
//       } as any;
//       (component as any).gridApi = mockApi;

//       component.onSelectionChanged();
//       // Second argument 'false' for clearSelection as per your implementation
//       expect(childNode.setSelected).toHaveBeenCalledWith(true, false);
//     });
//   });
// });


