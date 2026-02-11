import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from './checker1.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  const mockData = Array.from({ length: 200 }, (_, i) => ({ id: `T${i}`, ddaAccount: `DDA${i}`, ccy: 'USD', amount: i }));

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

  it('should filter globally and reset correctly', () => {
    component.searchGlobal = 'DDA199';
    component.applyFilters();
    expect(component.filteredRecords.length).toBe(1);
    component.resetFilters();
    expect(component.filteredRecords.length).toBe(200);
    expect(component.searchGlobal).toBe('');
  });

  it('should sort data by amount', () => {
    component.sortData('amount'); // Ascending
    expect(component.filteredRecords[0].amount).toBe(0);
    component.sortData('amount'); // Descending
    expect(component.filteredRecords[0].amount).toBe(199);
  });

  it('should handle authorization and cleanup timers', fakeAsync(() => {
    component.toggleSelection(mockData[0], 'T0');
    component.onAuthorize();
    tick(1200); // API
    tick(3000); // Toast
    flush();
    expect(component.isAuthorizing).toBe(false);
  }));
});