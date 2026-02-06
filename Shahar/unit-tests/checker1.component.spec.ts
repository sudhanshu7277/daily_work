import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { of } from 'rxjs';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowSelectionModule } from '@ag-grid-community/selection';
import { PaginationModule } from '@ag-grid-community/pagination';
// Replace this with your actual service path
import { YourDataService } from './path-to-your-service'; 

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;

  beforeAll(() => {
    // Register all modules to ensure the grid can initialize in tests
    ModuleRegistry.registerModules([
      ClientSideRowModelModule,
      RowSelectionModule,
      PaginationModule
    ]);
  });

  beforeEach(async () => {
    // This mock prevents the "Network error" during build
    const serviceMock = {
      fetchThresholdData: jasmine.createSpy('fetchThresholdData').and.returnValue(of([])),
      // Add any other methods your component calls on init
    };

    await TestBed.configureTestingModule({
      imports: [Checker1Component],
      providers: [
        { provide: YourDataService, useValue: serviceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges(); 
    expect(component).toBeTruthy();
  });
});