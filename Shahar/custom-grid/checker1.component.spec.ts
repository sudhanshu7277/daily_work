import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Checker1Component } from './checker1.component';
import { Checker1Service } from './checker1.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('Checker1Component', () => {
  let component: Checker1Component;
  let fixture: ComponentFixture<Checker1Component>;
  let mockService: any;

  // Mock data to simulate the "Huge" dataset (200 records to test pagination)
  const mockData = Array.from({ length: 200 }, (_, i) => ({
    id: `TXN-${i}`,
    ddaAccount: `DDA-${i}`,
    valueDate: '2026-02-10',
    ccy: 'USD',
    amount: 1000
  }));

  beforeEach(async () => {
    mockService = {
      getLargeDataset: jest.fn().mockReturnValue(of(mockData))
    };

    await TestBed.configureTestingModule({
      imports: [Checker1Component, CommonModule, FormsModule],
      providers: [{ provide: Checker1Service, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Checker1Component);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Loading & Pagination', () => {
    it('should load data on init and calculate total pages (150 per page)', () => {
      component.ngOnInit();
      fixture.detectChanges();

      expect(mockService.getLargeDataset).toHaveBeenCalled();
      expect(component.filteredRecords.length).toBe(200);
      // 200 records / 150 size = 2 pages
      expect(component.totalPages).toBe(2);
      expect(component.pagedRecords.length).toBe(150);
    });

    it('should show loader while fetching data', () => {
      component.isLoading = false;
      component.fetchData();
      // Should be true immediately after call
      expect(component.isLoading).toBe(true);
    });

    it('should navigate to the next page and update pagedRecords', () => {
      component.ngOnInit();
      component.setPage(2);
      
      expect(component.currentPage).toBe(2);
      // Remainder of 200 - 150 = 50 records
      expect(component.pagedRecords.length).toBe(50);
    });
  });

  describe('Filtering Logic', () => {
    it('should filter records by DDA Account search query', () => {
      component.ngOnInit();
      component.searchDDA = 'DDA-10'; // Matches DDA-10, DDA-100...DDA-109
      component.applyFilters();

      expect(component.filteredRecords.every(r => r.ddaAccount.includes('DDA-10'))).toBe(true);
    });

    it('should reset to page 1 when a filter is applied', () => {
      component.ngOnInit();
      component.setPage(2);
      component.searchDDA = 'DDA-5';
      component.applyFilters();

      expect(component.currentPage).toBe(1);
    });
  });

  describe('Selection & Authorization', () => {
    it('should select only one record at a time (exclusive selection)', () => {
      component.toggleSelection('TXN-1');
      expect(component.selectedRecordId).toBe('TXN-1');

      component.toggleSelection('TXN-2');
      expect(component.selectedRecordId).toBe('TXN-2'); // Should overwrite
    });

    it('should deselect the record if the same checkbox is clicked twice', () => {
      component.toggleSelection('TXN-1');
      component.toggleSelection('TXN-1');
      expect(component.selectedRecordId).toBeNull();
    });

    it('should simulate authorization and remove the record from list', fakeAsync(() => {
      component.ngOnInit();
      component.toggleSelection('TXN-0');
      
      component.onAuthorize();
      expect(component.isAuthorizing).toBe(true);
      
      tick(1200); // Wait for the setTimeout in component
      
      expect(component.isAuthorizing).toBe(false);
      expect(component.selectedRecordId).toBeNull();
      // Verify record is gone
      const found = component.filteredRecords.find(r => r.id === 'TXN-0');
      expect(found).toBeUndefined();
      
      // Verify toast message was added
      expect(component.toasts.length).toBe(1);
      expect(component.toasts[0].type).toBe('success');
    }));
  });

  describe('Notifications', () => {
    it('should add a toast and remove it after 3 seconds', fakeAsync(() => {
      component.showNotification('Test Alert', 'error');
      expect(component.toasts.length).toBe(1);
      
      tick(3000);
      expect(component.toasts.length).toBe(0);
    }));
  });
});