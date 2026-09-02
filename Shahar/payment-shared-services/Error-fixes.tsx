// The Code Implementation
// 1. Inside the Grid Component (multi-level-customer-grid-component.ts)
// The grid needs two pieces:

// It must know the global base offset of the 100 records currently passed to it (e.g., chunkStart = 1 for the first batch, chunkStart = 101 for the second batch).

// It slices its internal this.tree array relative to that 100-item block.

// Add an @Input() chunkStart: number = 1; to the component:

@Input() chunkStart: number = 1;
@Input() totalCount: number = 0;
@Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

// Inside refresh():
private refresh(): void {
  this.totalRows = this.totalCount || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Convert global item index to local index inside the current 100-item tree
  const globalItemStart = (this.currentPage - 1) * this.pageSize + 1;
  const localIndexStart = globalItemStart - this.chunkStart;
  const localIndexEnd = localIndexStart + this.pageSize;

  // Slice locally from the 100-record buffer
  const displaySlice = this.tree.slice(localIndexStart, localIndexEnd);

  this.rowData = [...this.flattenTree(displaySlice)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.pageChange.emit({ page: 1, pageSize: this.pageSize });
}



// 2. Inside the Shell Component (legal-hold-shell.component.ts)
// The shell acts as the buffer controller. It stores the 
// currently loaded batch and evaluates whether the newly 
// selected page falls within the range:


customerChunkStart: number = 1;
customerChunkEnd: number = 100;

onGridPageChange(event: { page: number; pageSize: number }): void {
  const reqStart = (event.page - 1) * event.pageSize + 1;
  const reqEnd = event.page * event.pageSize;

  // Check if requested items already exist in the 100-item chunk
  const hasLocalData = 
    reqStart >= this.customerChunkStart && 
    reqEnd <= this.customerChunkEnd && 
    this.customerGridData.length > 0;

  if (hasLocalData) {
    // DO NOT make an API call; trigger grid's internal local slice
    if (this.customerSearchGridRef) {
      this.customerSearchGridRef.currentPage = event.page;
      this.customerSearchGridRef.pageSize = event.pageSize;
      this.customerSearchGridRef.refresh();
    }
    return;
  }

  // Crossing boundary: Calculate which 100-record window is required
  const chunkIndex = Math.floor((reqStart - 1) / 100);
  const newChunkStart = chunkIndex * 100 + 1;
  const newChunkEnd = newChunkStart + 99;

  const criteriaPayload = this.lastCustomerCriteria?.customerSearchPayload;
  if (!criteriaPayload) return;

  const payload = JSON.parse(JSON.stringify(criteriaPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(newChunkStart),
    pageEndIndex: String(newChunkEnd)
  };

  this.dataLoading = true;
  this.cdr.detectChanges();

  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      this.customerChunkStart = newChunkStart;
      this.customerChunkEnd = newChunkEnd;
      this.availableCustomerResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || this.availableCustomerResultsCount;
      this.customerGridData = response?.searchResult || [];
      this.dataLoading = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Pagination search error:', err);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}


// 3. Inside the Shell Template (legal-hold-shell.component.html)
// Pass [chunkStart]="customerChunkStart" to the grid:

<multi-level-customer-grid #customerSearchGridRef
  [multiLevelGridData]="customerGridData"
  [searchSummary]="searchSummary"
  [deselectByOcifId]="deletedProfileEcifId"
  [totalCount]="availableCustomerResultsCount"
  [chunkStart]="customerChunkStart"
  (pageChange)="onGridPageChange($event)"
  (selectionChanged)="handleSelectionChange($event)"
  (removeProfile)="handleRemoveProfile($event)">
</multi-level-customer-grid>

