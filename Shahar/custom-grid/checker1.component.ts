import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Checker1Service } from './checker1.service';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-checker3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checker3.component.html',
  styleUrls: ['./checker3.component.scss']
})
export class Checker3Component implements OnInit, OnDestroy {
  public allRecords: any[] = [];
  public filteredRecords: any[] = [];
  public pagedRecords: any[] = [];
  
  public isLoading: boolean = false;
  public isAuthorizing: boolean = false;
  public selectedRecordId: string | null = null;
  public toasts: any[] = [];

  // Edit State
  public editingRecord: any = null;

  // Pagination & Sort State
  public currentPage: number = 1;
  public pageSize: number = 100;
  public totalPages: number = 0;
  public jumpToPageValue: number = 1;
  public pageSizes: number[] = [10, 50, 100, 500];
  public sortConfig = { column: '', direction: 'asc' };

  // Filter Models
  public searchGlobal: string = '';
  public filterCCY: string = '';
  public filterDate: string = ''; 
  public currencies: string[] = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'];

  // Debounce Logic
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private checkerService: Checker1Service) {}

  ngOnInit(): void {
    this.fetchData();
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onSearchChange(value: string): void {
    this.searchGlobal = value;
    this.searchSubject.next(value);
  }

  fetchData(): void {
    this.isLoading = true;
    this.checkerService.getLargeDataset()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.allRecords = data;
          this.applyFilters();
        },
        error: () => this.showNotification('Error fetching data', 'error')
      });
  }

  applyFilters(): void {
    const query = this.searchGlobal.toLowerCase();
    this.filteredRecords = this.allRecords.filter(item => {
      const matchCCY = this.filterCCY ? item.ccy === this.filterCCY : true;
      const itemDate = new Date(item.valueDate).toISOString().split('T')[0];
      const matchDate = this.filterDate ? itemDate === this.filterDate : true;
      const matchGlobal = Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      );
      return matchCCY && matchDate && matchGlobal;
    });

    this.currentPage = 1;
    if (this.sortConfig.column) this.sortData(this.sortConfig.column, true);
    this.calculatePagination();
  }

  resetFilters(): void {
    this.searchGlobal = '';
    this.filterCCY = '';
    this.filterDate = '';
    this.sortConfig = { column: '', direction: 'asc' };
    this.applyFilters();
  }

  // --- Edit & Numeric Validation ---
  openEdit(row: any, event: Event): void {
    event.stopPropagation();
    this.editingRecord = JSON.parse(JSON.stringify(row));
  }

  validateAmountInput(event: KeyboardEvent): void {
    const pattern = /[0-9.]/;
    if (!pattern.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
    }
  }

  saveEdit(): void {
    const val = Number(this.editingRecord.amount);
    if (isNaN(val) || val <= 0) {
      this.showNotification('Please enter a valid positive amount', 'error');
      return;
    }
    const idx = this.allRecords.findIndex(r => r.id === this.editingRecord.id);
    if (idx !== -1) {
      this.allRecords[idx] = { ...this.editingRecord, amount: val };
      this.showNotification('Record updated successfully', 'success');
      this.applyFilters();
      this.closeEdit();
    }
  }

  closeEdit(): void { this.editingRecord = null; }

  // --- Core Grid Logic ---
  sortData(column: string, isInternal = false): void {
    if (!isInternal) {
      this.sortConfig.direction = (this.sortConfig.column === column && this.sortConfig.direction === 'asc') ? 'desc' : 'asc';
      this.sortConfig.column = column;
    }
    const dir = this.sortConfig.direction === 'asc' ? 1 : -1;
    this.filteredRecords.sort((a, b) => (a[column] < b[column] ? -1 * dir : a[column] > b[column] ? 1 * dir : 0));
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRecords.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRecords = this.filteredRecords.slice(start, start + this.pageSize);
    this.jumpToPageValue = this.currentPage;
  }

  setPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.calculatePagination();
  }

  toggleSelection(row: any, id: string): void {
    this.selectedRecordId = this.selectedRecordId === id ? null : id;
  }

  onAuthorize(): void {
    if (!this.selectedRecordId) return;
    this.isAuthorizing = true;
    setTimeout(() => {
      this.allRecords = this.allRecords.filter(r => r.id !== this.selectedRecordId);
      this.applyFilters();
      this.isAuthorizing = false;
      this.selectedRecordId = null;
      this.showNotification('Authorized successfully', 'success');
    }, 1200);
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    setTimeout(() => this.toasts = this.toasts.filter(t => t.id !== id), 3000);
  }
}