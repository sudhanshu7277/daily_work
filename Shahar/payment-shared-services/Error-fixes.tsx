// 1. In multi-level-customer-grid-component.ts
//A. In refresh()
// Slice the exact 10, 20, or 50 items for the active currentPage out of this.tree:


private refresh(): void {
  this.totalRows = this.totalCount || this.tree.length || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  const pageSlice = this.tree.slice(start, end);
  this.rowData = [...this.flattenTree(pageSlice)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}


// B. In goPage(page: number)
// Check if the requested range is already loaded into this.tree:

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;

  const neededStartIndex = (page - 1) * this.pageSize;
  this.currentPage = page;

  // If the required records are already in memory (e.g., pages 1-10 or going back to page 1):
  if (neededStartIndex < this.tree.length) {
    this.refresh();
  } else {
    // We reached the end of cached records (e.g., clicking page 11). Fetch next batch from server.
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }
}


// C. In onPageSizeChange()
// When density changes (10, 20, 50), reset to page 1 and slice locally:

onPageSizeChange(): void {
  this.currentPage = 1;
  this.refresh();
}


//D. In ngOnChanges()
// Ensure incoming new records append or initialize this.tree:

ngOnChanges(changes: SimpleChanges): void {
  if (this.preserveGrid) {
    this.preserveGrid = false;
    return;
  }

  if (changes['multiLevelGridData'] && this.multiLevelGridData) {
    this.isLoading = true;
    this.loadError = false;
    this.handleResponse(this.mapApiResponse(this.multiLevelGridData));
    this.syncColumns();
  }
}


// 2. In legal-hold-shell.component.ts
// When an initial search runs, initialize customerGridData. When a pagination fetch runs, append the new 100 records to customerGridData:

// A. Initial Search (onSearch)

this.actualCustServ.getCustomersEntityAndLegalHoldList(criteria.customerSearchPayload).subscribe({
  next: (response: any) => {
    this.availableCustomerResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || 0;
    // Initial search: load first batch (1-100)
    this.customerGridData = response?.searchResult || [];
    this.tabSwitchFlag = false;
    this.dataLoading = false;
    this.cdr.detectChanges();
  },
  error: (err: any) => {
    this.setSearchError(err);
    this.dataLoading = false;
    this.cdr.detectChanges();
  }
});


// B. Paginated Chunk Fetch (onGridPageChange)
// Always request the next 100 records starting from wherever your current data ends:


onGridPageChange(event: { page: number; pageSize: number }): void {
  const criteriaPayload = this.lastCustomerCriteria?.customerSearchPayload;
  if (!criteriaPayload) return;

  // Fetch next chunk of 100 starting directly after what we already hold
  const startIndex = this.customerGridData.length + 1;
  const endIndex = startIndex + 99;

  const payload = JSON.parse(JSON.stringify(criteriaPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  this.dataLoading = true;
  this.cdr.detectChanges();

  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      const newRecords = response?.searchResult || [];
      // Append the new 100 records to existing data cache
      this.customerGridData = [...this.customerGridData, ...newRecords];
      this.dataLoading = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Customer pagination error:', err);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}


