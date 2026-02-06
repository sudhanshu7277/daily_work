import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { of } from 'rxjs';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowSelectionModule } from '@ag-grid-community/selection';
import { PaginationModule } from '@ag-grid-community/pagination';
// Replace with your actual service path
import { DataService } from './path-to-your-service'; 

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;

  // Registering modules for the test environment
  beforeAll(() => {
    ModuleRegistry.registerModules([
      ClientSideRowModelModule,
      RowSelectionModule,
      PaginationModule
    ]);
  });

  beforeEach(async () => {
    // Jest-style mock object
    const mockDataService = {
      // Use jest.fn() to simulate the API calls that are causing your Network Error
      fetchThresholdData: jest.fn().and.returnValue(of([])),
      getIssueRecords: jest.fn().and.returnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Checker1Component], // Standalone component
      providers: [
        { provide: DataService, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // detectChanges triggers ngOnInit; because we mocked the service,
    // it will use our empty 'of([])' instead of trying to reach the internet.
    fixture.detectChanges(); 
    expect(component).toBeTruthy();
  });
});