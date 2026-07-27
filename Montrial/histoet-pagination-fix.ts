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
  
          // 🟢 FIX 1: Retrieve totalCount from backend response. 
          // Fallback to response.totalRecords, response.count, or fallback if omitted.
          const totalCount = response?.totalCount 
                          ?? response?.totalRecords 
                          ?? response?.total 
                          ?? response?.count 
                          ?? 100; // Replace fallback if your API uses another property name
  
          this.records.set(fetchedRecords);
          this.totalRows.set(totalCount);
  
          // 🟢 FIX 2: Calculate totalPages dynamically based on TOTAL database records
          const calcPages = Math.ceil(totalCount / this.pageSize());
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
  
    // Local column sorting for current page view
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
  
    // Display the fetched page records directly (backend handles page slicing)
    this.displayedRecords.set(sorted);
    
    // Rebuild page numbers dynamically (e.g. 1, 2, 3, 4...)
    this.pageNumbers.set(this.buildPageNumbers());
  }
  
  // 🟢 FIX 3: Next/Previous & Page Click handler
  goPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.fetchRecords(); // Fetch new range from backend API
  }
  
  // 🟢 FIX 4: Items per page dropdown change handler
  onPageSizeChange(): void {
    this.currentPage.set(1); // Reset to page 1 on page size change
    this.fetchRecords();     // Re-fetch page 1 with new page size range
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