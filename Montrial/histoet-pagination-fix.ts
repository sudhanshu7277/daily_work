// 1. Update fetchRecords()

fetchRecords(): void {
    this.isLoading.set(true);
    this.showApiError.set(false);
  
    // Call API without page indexes
    this.historyService.getHistoryRecords()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const allRecords = Array.isArray(response) 
            ? response 
            : (response?.records || []);
  
          this.records.set(allRecords);
          this.totalRows.set(allRecords.length); // Sets total to full dataset count
  
          this.applySortAndPaginate();
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.showApiError.set(true);
        }
      });
  }

  // 2. Update applySortAndPaginate()

  private applySortAndPaginate(): void {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    let sorted = [...this.records()];
  
    // 1. Sort
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
  
    // 2. Calculate Total Pages based on full dataset
    const calcTotal = Math.ceil(sorted.length / this.pageSize());
    this.totalPages.set(calcTotal > 0 ? calcTotal : 1);
  
    // 3. Slice array for active page view
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
  
    this.displayedRecords.set(sorted.slice(start, end));
    this.pageNumbers.set(this.buildPageNumbers());
  }

  // 3. Update goPage()

  goPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.applySortAndPaginate();
  }

  // 4. Update onPageSizeChange()

  onPageSizeChange(): void {
    this.currentPage.set(1);
    this.applySortAndPaginate();
  }