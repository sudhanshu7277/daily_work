import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Checker1Service } from './checker1.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.scss']
})
export class Checker1Component implements OnInit {
  private allRecords: any[] = [];
  public filteredRecords: any[] = [];
  public pagedRecords: any[] = [];
  
  public isLoading: boolean = false;
  public isAuthorizing: boolean = false;
  public selectedRecordId: string | null = null;
  public toasts: any[] = [];

  // Advanced Pagination State
  public currentPage: number = 1;
  public pageSize: number = 100;
  public totalPages: number = 0;
  public jumpToPageValue: number = 1;
  public pageSizes: number[] = [10, 50, 100, 500];
  
  // Sort State
  public sortConfig = { column: '', direction: 'asc' };

  // Filter Models
  public searchGlobal: string = '';
  public filterCCY: string = '';
  public currencies: string[] = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'];

  constructor(private checkerService: Checker1Service) {}

  ngOnInit(): void {
    this.fetchData();
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
        error: () => this.showNotification('System error fetching data.', 'error')
      });
  }

  applyFilters(): void {
    const query = this.searchGlobal.toLowerCase();
    this.filteredRecords = this.allRecords.filter(item => {
      const matchCCY = this.filterCCY ? item.ccy === this.filterCCY : true;
      const matchGlobal = Object.values(item).some(val => 
        String(val).toLowerCase().includes(query)
      );
      return matchCCY && matchGlobal;
    });

    this.currentPage = 1;
    if (this.sortConfig.column) this.sortData(this.sortConfig.column, true);
    this.calculatePagination();
  }

  resetFilters(): void {
    this.searchGlobal = '';
    this.filterCCY = '';
    this.sortConfig = { column: '', direction: 'asc' };
    this.applyFilters();
  }

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
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRecords = this.filteredRecords.slice(start, start + this.pageSize);
    this.jumpToPageValue = this.currentPage;
  }

  setPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.calculatePagination();
    const el = document.querySelector('.scroll-container');
    if (el) el.scrollTop = 0;
  }

  toggleSelection(row: any, id: string): void {
    this.selectedRecordId = this.selectedRecordId === id ? null : id;
  }

  onAuthorize(): void {
    if (!this.selectedRecordId) return;
    this.isAuthorizing = true;
    setTimeout(() => {
      this.showNotification(`Authorized Successfully: ${this.selectedRecordId}`, 'success');
      this.allRecords = this.allRecords.filter(r => r.id !== this.selectedRecordId);
      this.applyFilters();
      this.isAuthorizing = false;
      this.selectedRecordId = null;
    }, 1200);
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    setTimeout(() => this.toasts = this.toasts.filter(t => t.id !== id), 3000);
  }
}