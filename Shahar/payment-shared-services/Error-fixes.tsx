// 1. refresh()
// When slicing what to display on the screen, calculate the 
// offset relative to the 100-item chunk:

private refresh(): void {
  this.totalRows = this.totalCount || this.tree.length || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Find index relative to the current 100-record block in memory:
  // e.g., Page 1 -> localStart = 0
  // e.g., Page 2 -> localStart = 10
  // e.g., Page 10 -> localStart = 90
  // e.g., Page 11 (after new chunk loaded) -> localStart = 0
  const localStart = ((this.currentPage - 1) * this.pageSize) % 100;
  const pageParents = this.tree.slice(localStart, localStart + this.pageSize);

  this.rowData = [...this.flattenTree(pageParents)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}


// 2. goPage(page: number)
// Check if the requested page is inside the current 100-item block or crosses the boundary:

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;

  // Which 100-item chunk does the current page belong to? (0 for pages 1-10, 1 for pages 11-20, etc.)
  const currentChunk = Math.floor(((this.currentPage - 1) * this.pageSize) / 100);
  const targetChunk = Math.floor(((page - 1) * this.pageSize) / 100);

  this.currentPage = page;

  if (currentChunk === targetChunk && this.tree.length > 0) {
    // Target page is already in our 100-item memory buffer!
    // Just slice and display locally — ZERO network calls.
    this.refresh();
  } else {
    // Target page is in another chunk (e.g., crossing from page 10 to page 11).
    // Emit to shell to fetch the required 100-item window.
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }
}


// 3. onPageSizeChange()
// If the user changes the dropdown (e.g., from 10 to 20 or 50):

onPageSizeChange(): void {
  this.currentPage = 1;
  this.refresh();
}



// Step 2: In the Shell Component (legal-hold-shell.component.ts)
// Because the grid only emits (pageChange) when it actually needs
//  a new chunk of 100, the shell simply requests the 100-item slice that contains event.page:

onGridPageChange(event: { page: number; pageSize: number }): void {
  const criteriaPayload = this.lastCustomerCriteria?.customerSearchPayload;
  if (!criteriaPayload) return;

  // Calculate the 100-item window that contains this page
  // e.g., page 11 with pageSize 10 -> item 101 -> startIndex = 101, endIndex = 200
  const chunkIndex = Math.floor(((event.page - 1) * event.pageSize) / 100);
  const startIndex = chunkIndex * 100 + 1;
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
      this.availableCustomerResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || this.availableCustomerResultsCount;
      this.customerGridData = response?.searchResult || [];
      this.dataLoading = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Customer pagination search error:', err);
      this.setSearchError(err);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}


