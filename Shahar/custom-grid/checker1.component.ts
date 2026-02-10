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
  // Data Containers
  private allRecords: any[] = [];         // Master copy from API
  public filteredRecords: any[] = [];    // Copy after filters are applied
  public pagedRecords: any[] = [];       // Current 150 records visible on screen
  
  // UI State
  public isLoading: boolean = false;      // Get API loader
  public isAuthorizing: boolean = false;  // Action loader
  public selectedRecordId: string | null = null;
  public toasts: any[] = [];

  // Pagination State
  public currentPage: number = 1;
  public pageSize: number = 150;
  public totalPages: number = 0;

  // Filter Models
  public searchDDA: string = '';
  public filterCCY: string = '';
  public currencies: string[] = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'];

  constructor(private checkerService: Checker1Service) {}

  ngOnInit(): void {
    this.fetchData();
  }

  /**
   * Simulates GET API call via the service
   */
  fetchData(): void {
    this.isLoading = true;
    this.checkerService.getLargeDataset()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.allRecords = data;
          this.applyFilters();
        },
        error: (err) => {
          this.showNotification('Error fetching data from server', 'error');
          console.error(err);
        }
      });
  }

  /**
   * Filters the master dataset based on user input
   */
  applyFilters(): void {
    this.filteredRecords = this.allRecords.filter(item => {
      const matchDDA = item.ddaAccount.toLowerCase().includes(this.searchDDA.toLowerCase());
      const matchCCY = this.filterCCY ? item.ccy === this.filterCCY : true;
      return matchDDA && matchCCY;
    });

    this.currentPage = 1; // Reset to page 1 on search
    this.calculatePagination();
  }

  /**
   * Calculates total pages and slices the data for the current view
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRecords.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRecords = this.filteredRecords.slice(start, end);
  }

  /**
   * Navigation for pagination
   */
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
      // Smooth scroll grid to top on page change
      const scrollEl = document.querySelector('.scroll-container');
      if (scrollEl) scrollEl.scrollTop = 0;
    }
  }

  /**
   * Exclusive single-selection checkbox logic
   */
  toggleSelection(id: string): void {
    this.selectedRecordId = this.selectedRecordId === id ? null : id;
  }

  /**
   * Simulates the Authorize API call
   */
  onAuthorize(): void {
    if (!this.selectedRecordId) return;

    this.isAuthorizing = true;
    const recordToAuth = this.selectedRecordId;

    // Simulate API Delay
    setTimeout(() => {
      this.showNotification(`Record ${recordToAuth} authorized successfully!`, 'success');
      
      // Remove authorized record from local state
      this.allRecords = this.allRecords.filter(r => r.id !== recordToAuth);
      this.applyFilters();
      
      this.isAuthorizing = false;
      this.selectedRecordId = null;
    }, 1200);
  }

  /**
   * Custom Toast Notification Logic
   */
  showNotification(message: string, type: 'success' | 'error'): void {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }

  // Math helper for template usage
  get Math() {
    return Math;
  }
}