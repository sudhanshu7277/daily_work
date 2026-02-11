import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from './checker1.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  const mockData = Array.from({ length: 250 }, (_, i) => ({ 
    id: `TXN${i}`, ddaAccount: `DDA-ACC-${i}`, ccy: 'USD', amount: i * 10, valueDate: new Date() 
  }));

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

  it('should filter globally across multiple fields', () => {
    component.searchGlobal = 'TXN150';
    component.applyFilters();
    expect(component.filteredRecords.length).toBe(1);
    expect(component.filteredRecords[0].id).toBe('TXN150');
  });

  it('should reset all states when resetFilters is called', () => {
    component.searchGlobal = 'some-query';
    component.filterCCY = 'EUR';
    component.resetFilters();
    expect(component.searchGlobal).toBe('');
    expect(component.filterCCY).toBe('');
    expect(component.filteredRecords.length).toBe(250);
  });

  it('should handle multi-column sorting', () => {
    component.sortData('amount'); // Ascending
    expect(component.filteredRecords[0].amount).toBe(0);
    component.sortData('amount'); // Descending
    expect(component.filteredRecords[0].amount).toBe(2490);
  });

  it('should manage exclusive selection with two arguments', () => {
    const row = mockData[0];
    component.toggleSelection(row, row.id);
    expect(component.selectedRecordId).toBe('TXN0');
    component.toggleSelection(row, row.id); // Toggle off
    expect(component.selectedRecordId).toBeNull();
  });

  it('should execute authorization simulation and clear timers', fakeAsync(() => {
    component.toggleSelection(mockData[5], 'TXN5');
    component.onAuthorize();
    tick(1200); // Wait for mock API
    tick(3000); // Wait for Toast dismiss
    flush(); 
    expect(component.isAuthorizing).toBe(false);
    expect(component.selectedRecordId).toBeNull();
  }));
});