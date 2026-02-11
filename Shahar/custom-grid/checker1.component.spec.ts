import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from './checker1.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  const mockData = Array.from({ length: 10 }, (_, i) => ({ id: `TXN${i}`, ddaAccount: `ACC${i}`, ccy: 'USD', amount: 100 * i }));

  beforeEach(async () => {
    const mockService = { getLargeDataset: () => of(mockData) };
    await TestBed.configureTestingModule({
      imports: [Checker1Component, FormsModule],
      providers: [{ provide: Checker1Service, useValue: mockService }]
    }).compileComponents();
    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should filter data and sort', () => {
    component.searchGlobal = 'ACC5';
    component.applyFilters();
    expect(component.filteredRecords.length).toBe(1);
    
    component.resetFilters();
    component.sortData('amount'); // Asc
    expect(component.filteredRecords[0].amount).toBe(0);
  });

  it('should handle authorization and clear timers', fakeAsync(() => {
    component.toggleSelection(mockData[0], 'TXN0');
    component.onAuthorize();
    tick(1200); // Wait for API
    flush();    // Clear Toast Timers
    expect(component.isAuthorizing).toBe(false);
    expect(component.selectedRecordId).toBeNull();
  }));
});