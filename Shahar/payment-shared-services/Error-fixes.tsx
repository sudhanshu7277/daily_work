// The Complete Verification & Fix
// 1. legal-hold-shell.component.html (Lines 124–133)
// Update the hold block to use direct bindings:

@if (currentTab === 'hold' && legalHoldGridData.length && !tabSwitchFlag && !dataLoading) {
  <multi-level-hold-grid #legalHoldGridRef
    [multiLevelGridData]="legalHoldGridData"
    [searchSummary]="searchSummary"
    [deselectByOcifId]="deletedProfileEcifId"
    [totalCount]="availableHoldResultsCount"
    (pageChange)="onHoldGridPageChange($event)"
    (selectionChanged)="handleSelectionChange($event)"
    (removeProfile)="handleRemoveProfile($event)">
  </multi-level-hold-grid>
}


// 2. legal-hold-shell.component.ts
// A. In onSearch (where this.currentTab === 'hold' is handled):
// Ensure this.lastHoldCriteria is assigned and 
// availableHoldResultsCount captures the total count from the response:

if (
  (criteria !== '' && this.currentTab === 'hold') ||
  (criteria.hasOwnProperty('searchType') && criteria.searchType === 'HOLD_SEARCH')
) {
  this.lastHoldCriteria = criteria; // Must be stored
  this.searchSummary = criteria.searchSummary || '';
  this.currentTab = 'hold';
  this.dataLoading = true;

  // Resolve the exact payload property from the criteria object
  const searchPayload = criteria.holdPayload || criteria.legalHoldPayload || criteria.customerSearchPayload || criteria;

  this.actualCustServ.getCustomersEntityAndLegalHoldList(searchPayload).subscribe({
    next: (response: any) => {
      this.availableHoldResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || 0;
      this.legalHoldGridData = response?.searchResult || [];
      this.tabSwitchFlag = false;
      this.dataLoading = false;
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      this.setSearchError(error);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}


// B. Pagination handler onHoldGridPageChange:
//Handle payload resolution defensively:

onHoldGridPageChange(event: { page: number; pageSize: number }): void {
  const criteriaPayload = 
    this.lastHoldCriteria?.holdPayload || 
    this.lastHoldCriteria?.legalHoldPayload || 
    this.lastHoldCriteria?.customerSearchPayload;

  if (!criteriaPayload) {
    console.error('Missing hold search payload in lastHoldCriteria:', this.lastHoldCriteria);
    return;
  }

  const startIndex = (event.page - 1) * event.pageSize + 1;
  const endIndex = event.page * event.pageSize;

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
      this.availableHoldResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || this.availableHoldResultsCount;
      this.legalHoldGridData = response?.searchResult || [];
      this.dataLoading = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Hold pagination search error:', err);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}

//3. multi-level-hold-grid-component.ts
// Verify these 4 areas match:

@Input() totalCount: number = 0;
@Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

//handleResponse (Line ~240):

this.totalRows = this.totalCount || res.totalCount || 0;

// refresh (Line ~274):

private refresh(): void {
  this.totalRows = this.totalCount || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Render server records directly — do NOT call this.tree.slice()
  this.rowData = [...this.flattenTree(this.tree)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}

//goPage & onPageSizeChange (Line ~370):

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

