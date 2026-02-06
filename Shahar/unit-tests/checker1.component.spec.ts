import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowSelectionModule } from '@ag-grid-community/selection';
import { of } from 'rxjs';
// Import your actual service here
import { YourDataService } from '../../services/your-data.service'; 

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  beforeAll(() => {
    // Register AG Grid modules once for the entire test suite
    ModuleRegistry.registerModules([
      ClientSideRowModelModule,
      RowSelectionModule
    ]);
  });

  beforeEach(async () => {
    // Create a mock to prevent "Network error"
    mockService = {
      // Replace 'getData' with the actual method name your component calls
      getData: jasmine.createSpy('getData').and.returnValue(of([])),
      // Add any other methods called on init
      fetchThresholdData: jasmine.createSpy('fetchThresholdData').and.returnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [
        Checker1Component, // Standalone component
        AgGridModule
      ],
      providers: [
        { provide: YourDataService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // This will now pass without a Network Error because of the mock
    fixture.detectChanges(); 
    expect(component).toBeTruthy();
  });
});