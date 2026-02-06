import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { of } from 'rxjs';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowSelectionModule } from '@ag-grid-community/selection';
import { PaginationModule } from '@ag-grid-community/pagination';
import { Checker1Service } from './checker1.service'; // Adjust path if needed

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;

  beforeAll(() => {
    // Registering modules to avoid "Grid not initialized" errors during tests
    ModuleRegistry.registerModules([
      ClientSideRowModelModule,
      RowSelectionModule,
      PaginationModule
    ]);
  });
  

  beforeEach(async () => {
    // Correct Jest Mocking Syntax
    const mockDataService = {
      fetchThresholdData: jest.fn().mockReturnValue(of([])),
      getIssueRecords: jest.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Checker1Component], // Standalone component
      providers: [
        { provide: Checker1Service, useValue: mockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // This triggers ngOnInit and calls the mocked services
    fixture.detectChanges(); 
    expect(component).toBeTruthy();
  });
});