// File 1: multi-level-hold-grid-component.ts
// 1. Add Input and Output (around lines 70–93, Image 22)

@Input() multiLevelGridData: any;
@Input() searchSummary = '';
@Input() totalCount: number = 0;

@Output() selectionChanged = new EventEmitter<EntitySelectionEvent>();
@Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();


// 2. Update handleResponse (lines 238–245, Image 26/27)

private handleResponse(res: any): void {
  this.tree = res.data as EntityRowNode[];
  this.stampTree(this.tree, '');
  this.showChipsSection = true;
  this.totalRows = this.totalCount || res.totalCount || 0;
  this.isLoading = false;
  this.refresh();
}

// 3. Update refresh() (lines 274–286, Image 28/29)

// Remove this.tree.slice(...) so the server-provided slice renders directly:

private refresh(): void {
  this.totalRows = this.totalCount || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Render server-provided rows directly
  this.rowData = [...this.flattenTree(this.tree)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}

// 4. Update goPage() and onPageSizeChange() (lines 369–378, Image 32)

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

// File 2: legal-hold-shell.component.html (Lines 124–132, Image 37)
// Update <multi-level-hold-grid> to bind [totalCount] and (pageChange) 
// while adding !dataLoading:

@if (currentTab === 'hold' && legalHoldGridData.length && !tabSwitchFlag && !dataLoading) {
  <multi-level-hold-grid #customerSearchGridRef
    [multiLevelGridData]="legalHoldGridData"
    [searchSummary]="searchSummary"
    [deselectByOcifId]="deletedProfileEcifId"
    [totalCount]="availableHoldResultsCount"
    (pageChange)="onHoldGridPageChange($event)"
    (selectionChanged)="handleSelectionChange($event)"
    (removeProfile)="handleRemoveProfile($event)">
  </multi-level-hold-grid>
}


// File 3: legal-hold-shell.component.ts
// 1. Declare State Variables (near line 77)

availableHoldResultsCount: number = 0;
lastHoldCriteria: any = null;


//2. Retain Criteria in onSearch (within the hold search branch)

if (
  (criteria !== '' && this.currentTab === 'hold') ||
  (criteria.hasOwnProperty('searchType') && criteria.searchType === 'HOLD_SEARCH')
) {
  this.lastHoldCriteria = criteria; // Persist criteria for paging
  this.currentTab = 'hold';
  this.dataLoading = true;

  const payload = criteria.holdPayload || criteria.customerSearchPayload;
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

//3. Add onHoldGridPageChange (adjacent to onEntityGridPageChange)

onHoldGridPageChange(event: { page: number; pageSize: number }): void {
  const criteriaPayload = this.lastHoldCriteria?.holdPayload || this.lastHoldCriteria?.customerSearchPayload;
  if (!criteriaPayload) return;

  const startIndex = (event.page - 1) * event.pageSize + 1;
  const endIndex = event.page * event.pageSize;

  const payload = JSON.parse(JSON.stringify(criteriaPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  this.dataLoading = true;
  this.cdr.detectChanges(); // Triggers loading spinner and hides grid immediately

  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      this.availableHoldResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) ||
        this.availableHoldResultsCount;
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