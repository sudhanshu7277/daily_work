//The Complete Fixed history.component.ts
//Replace the pagination, sorting, and fetching methods in history.component.ts (lines 82–207) with this clean, direct implementation:

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
        next: (response) => {
          const fetchedRecords = response?.records || [];
          const count = response?.totalCount ?? 0;
  
          this.records.set(fetchedRecords);
          this.totalRows.set(count);
  
          // 🟢 FIX 1: Calculate total pages using backend totalCount (totalRows), not array length
          const total = Math.ceil(count / this.pageSize());
          this.totalPages.set(total > 0 ? total : 1);
  
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
        let valA: string = (a as any)[col] ?? '';
        let valB: string = (b as any)[col] ?? '';
  
        if (col === 'requestDate') {
          valA = this.parseDateForSort(valA);
          valB = this.parseDateForSort(valB);
        }
  
        const cmp = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      });
    }
  
    // 🟢 FIX 2: Do NOT slice sorted array. The backend already returned only this page's items!
    this.displayedRecords.set(sorted);
    this.pageNumbers.set(this.buildPageNumbers());
  }
  
  updatePagination(): void {
    this.applySortAndPaginate();
  }
  
  // 🟢 FIX 3: Set page & fetch directly from API without premature local update
  goPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.fetchRecords();
  }
  
  onPageSizeChange(): void {
    this.currentPage.set(1);
    this.fetchRecords();
  }

  