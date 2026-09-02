// 1. multi-level-hold-grid-component.ts
// A. Add Input and Output (lines ~70–94)

@Input() multiLevelGridData: any;
@Input() searchSummary = '';
@Input() totalCount: number = 0;

@Output() selectionChanged = new EventEmitter<EntitySelectionEvent>();
@Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();


//B. Update handleResponse (lines ~238–245)
// Bind totalRows to this.totalCount:

private handleResponse(res: any): void {
  this.tree = res.data as EntityRowNode[];
  this.stampTree(this.tree, '');
  this.showChipsSection = true;
  this.totalRows = this.totalCount || res.totalCount || 0;
  this.isLoading = false;
  this.refresh();
}


// C. Update refresh() (lines ~274–286)
// Remove this.tree.slice(...) so the server-provided slice is rendered directly:

private refresh(): void {
  this.totalRows = this.totalCount || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Render server-provided rows directly
  this.rowData = [...this.flattenTree(this.tree)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}

//D. Update goPage() and onPageSizeChange() (lines ~369–378)
// Emit the pagination events to the shell:

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

//2. legal-hold-shell.component.html (Lines ~124–133)
// Replace the hold grid tag with the exact input/output bindings:

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

//3. legal-hold-shell.component.ts
// A. State variables declaration (near line 77)

availableHoldResultsCount: number = 0;
lastHoldCriteria: any = null;

//B. Save criteria & count in onSearch (inside the hold branch)

if (
  (criteria !== '' && this.currentTab === 'hold') ||
  (criteria.hasOwnProperty('searchType') && criteria.searchType === 'HOLD_SEARCH') ||
  criteria.hasOwnProperty('legalHoldSearchPayload') ||
  criteria.hasOwnProperty('legalHoldPayload') ||
  criteria.hasOwnProperty('holdPayload')
) {
  this.lastHoldCriteria = criteria; // Persist criteria for pagination
  this.currentTab = 'hold';
  this.dataLoading = true;

  const payload = criteria.legalHoldSearchPayload || criteria.legalHoldPayload || criteria.holdPayload || criteria;

  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
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


//C. Add onHoldGridPageChange (adjacent to onEntityGridPageChange)
// Calculate 0-based indexes for this API endpoint:

onHoldGridPageChange(event: { page: number; pageSize: number }): void {
  const criteriaPayload = 
    this.lastHoldCriteria?.legalHoldSearchPayload || 
    this.lastHoldCriteria?.legalHoldPayload || 
    this.lastHoldCriteria?.holdPayload || 
    this.lastHoldCriteria?.customerSearchPayload;

  if (!criteriaPayload) return;

  // 0-based indexing for Legal Hold API (0-10, 10-20, etc.)
  const startIndex = (event.page - 1) * event.pageSize;
  const endIndex = startIndex + event.pageSize;

  const payload = JSON.parse(JSON.stringify(criteriaPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  this.dataLoading = true;
  this.cdr.detectChanges(); // Immediately triggers loading spinner and hides grid

  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      this.availableHoldResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) ||
        this.availableHoldResultsCount;
      this.legalHoldGridData = response?.searchResult || [];
      this.dataLoading = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Legal Hold pagination search error:', err);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}

