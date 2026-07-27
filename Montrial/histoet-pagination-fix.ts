// The Complete Fixed history.component.ts

import { Component, ChangeDetectionStrategy, OnInit, DestroyRef, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HistoryService } from '../shared/services/history.service';
import { ConfirmationResponse, HistoryRecord } from './history.model';
import { EntityGridService } from '../shared/services/entity-grid.service';
import { LegalHoldDataService } from '../shared/services/legal-hold-data.service';
import { LegalHoldHistoryService } from '../shared/services/legal-hold-apis.service';

type SortColumn = 'profileName' | 'legalHoldName' | 'requestDate' | 'action' | 'requestStatus';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly historyService = inject(HistoryService);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isLoading = signal(false);
  readonly records = signal<HistoryRecord[]>([]);
  readonly displayedRecords = signal<HistoryRecord[]>([]);

  readonly sortColumn = signal<SortColumn | null>(null);
  readonly sortDirection = signal<SortDirection>('asc');

  readonly currentPage = signal(1);
  readonly pageSize = signal(25);
  readonly pageSizeOpts = [10, 25, 50, 100];
  readonly totalRows = signal(0);
  readonly totalPages = signal(1);
  readonly pageNumbers = signal<(number | string)[]>([]);

  readonly paginationFrom = computed(() => {
    return this.totalRows() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly paginationTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalRows());
  });

  readonly showConfirmationModal = signal(false);
  readonly confirmationLoading = signal(false);
  readonly selectedConfirmation = signal<ConfirmationResponse | null>(null);
  readonly selectedAction = signal<string>('');
  readonly selectedRecord = signal<HistoryRecord | null>(null);
  readonly showApiError = signal(false);

  ngOnInit(): void {
    this.fetchRecords();
  }

  // Calculate 1-based start/end indexes for API query
  private getPaginationIndexes() {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = this.currentPage() * this.pageSize();
    return { start, end };
  }

  fetchRecords(): void {
    this.isLoading.set(true);
    this.showApiError.set(false);

    const { start, end } = this.getPaginationIndexes();

    this.historyService.getHistoryRecords(start, end)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const fetchedRecords = response?.records || [];
          const count = response?.totalCount ?? 0;

          this.records.set(fetchedRecords);
          this.totalRows.set(count);

          // Calculate total pages using backend totalCount
          const calcPages = Math.ceil(count / this.pageSize());
          this.totalPages.set(calcPages > 0 ? calcPages : 1);

          this.applySortAndPaginate();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.showApiError.set(true);
        }
      });
  }

  private applySortAndPaginate(): void {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    let sorted = [...this.records()];

    if (col) {
      sorted.sort((a, b) => {
        let valA = (a as any)[col] ?? '';
        let valB = (b as any)[col] ?? '';

        if (col === 'requestDate') {
          valA = this.parseDateForSort(valA);
          valB = this.parseDateForSort(valB);
        }

        const cmp = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    // Set displayed records directly (backend API already paginated the data)
    this.displayedRecords.set(sorted);
    this.pageNumbers.set(this.buildPageNumbers());
  }

  updatePagination(): void {
    this.applySortAndPaginate();
  }

  // Called by (click)="goPage(...)" in HTML
  goPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.fetchRecords();
  }

  // Called by (ngModelChange) in HTML dropdown
  onPageSizeChange(): void {
    this.currentPage.set(1);
    this.fetchRecords();
  }

  private buildPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  }

  private parseDateForSort(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  }

  onSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.applySortAndPaginate();
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn() !== column) return 'none';
    return this.sortDirection();
  }

  dismissUploadError(): void {
    this.showApiError.set(false);
  }

  formatToDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Processing': return 'status-processing';
      case 'Successful': return 'status-successful';
      case 'Retrying': return 'status-retrying';
      case 'Unsuccessful': return 'status-unsuccessful';
      default: return '';
    }
  }

  isConfirmationEnabled(record: HistoryRecord): boolean {
    return record.requestStatus === 'Successful' && !record.confirmationViewed;
  }

  openConfirmation(record: HistoryRecord): void {
    if (!this.isConfirmationEnabled(record)) return;
    this.confirmationLoading.set(true);
    this.selectedAction.set(record?.action ?? '');
    this.selectedRecord.set(record);

    this.historyService.getConfirmationDetails(record)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.showApiError.set(false);
          this.showConfirmationModal.set(true);
          this.selectedConfirmation.set(response ?? null);
          this.confirmationLoading.set(false);
        },
        error: () => {
          this.confirmationLoading.set(false);
          this.showApiError.set(true);
        }
      });
  }

  closeConfirmation(): void {
    this.showConfirmationModal.set(false);
    this.selectedConfirmation.set(null);
    this.selectedAction.set('');
  }

  formatAccountList(accounts: { accountType: string; accountNumber: string }[]): string {
    if (!Array.isArray(accounts)) return '';
    return accounts.map(a => `<strong>${a.accountType}</strong> ${a.accountNumber}`).join('; ');
  }
}