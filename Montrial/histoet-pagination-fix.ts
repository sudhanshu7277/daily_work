// Option B: Complete Code for Client-Side Pagination

fetchRecords(): void {
    this.isLoading.set(true);
    this.showApiError.set(false);
  
    this.historyService.getHistoryRecords()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const allRecords = Array.isArray(response) ? response : (response?.records || []);
  
          this.records.set(allRecords);
          this.totalRows.set(allRecords.length); // Total is full dataset length
  
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
  
    // Calculate total pages based on complete dataset
    const total = Math.ceil(sorted.length / this.pageSize());
    this.totalPages.set(total > 0 ? total : 1);
  
    // 🟢 Slice local array for active page view
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
  
    this.displayedRecords.set(sorted.slice(start, end));
    this.pageNumbers.set(this.buildPageNumbers());
  }
  
  goPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.applySortAndPaginate(); // Local slice
  }
  
  onPageSizeChange(): void {
    this.currentPage.set(1);
    this.applySortAndPaginate(); // Local slice
  }