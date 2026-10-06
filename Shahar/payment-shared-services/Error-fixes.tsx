//The Minimal, Regression-Free Change in history.component.ts
//Replace only lines 164–192 (applySortAndPaginate) in history.component.ts


private applySortAndPaginate(): void {
    const col = this.sortColumn();
    const dir = this.sortDirection();

    const calcPages = Math.ceil(this.totalRows() / this.pageSize());
    this.totalPages.set(calcPages > 0 ? calcPages : 1);

    // 1. Slice the current 10 records for the active page FIRST
    const blockOffset = (this.currentPage() - 1) * this.pageSize() - (this.loadedBlockStart() - 1);
    const startSlice = Math.max(0, blockOffset);
    let pageRecords = this.records().slice(startSlice, startSlice + this.pageSize());

    // 2. Sort ONLY the 10 records visible on this current page
    if (col) {
      pageRecords.sort((a, b) => {
        let valA = (a as any)[col] ?? '';
        let valB = (b as any)[col] ?? '';

        if (col === 'requestDate') {
          valA = this.parseDateForSort(this.getLatestTransactionDate(a));
          valB = this.parseDateForSort(this.getLatestTransactionDate(b));
        }

        const cmp = String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' });
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    // 3. Update the view signal with the sorted page records
    this.displayedRecords.set(pageRecords);
    this.pageNumbers.set(this.buildPageNumbers());
  }