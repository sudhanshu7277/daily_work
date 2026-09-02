// 1. legal-hold-shell.component.html (Lines 118–125)
// Add [totalCount] and (pageChange) to #entityAgGrid:

@if (currentTab === 'entity' && entityGridData.length && !tabSwitchFlag) {
  <multi-level-entity-grid #entityAgGrid
    [multiLevelGridData]="entityGridData"
    [searchSummary]="searchSummary"
    [deselectByOcifId]="deletedProfileEcifId"
    [totalCount]="availableEntityResultsCount"
    (pageChange)="onEntityGridPageChange($event)"
    (selectionChanged)="handleSelectionChange(selectedRows: $event)"
    (removeProfile)="handleRemoveProfile(deselectedProfile: $event)">
  </multi-level-entity-grid>
}


// 2. legal-hold-shell.component.ts
// A. Declare the state variable (around line 77):

availableEntityResultsCount: number = 0;
lastEntityCriteria: any = null;

// B. Save lastEntityCriteria in onSearch (where entity search executes, lines 254–278):

if (
  (criteria !== '' && this.currentTab === 'entity') ||
  (criteria.hasOwnProperty('searchType') && 
   (criteria.searchType === 'entity' || criteria.searchType === 'ENTITY_CUSTOMER'))
) {
  this.lastEntityCriteria = criteria; // Retain criteria for pagination!
  this.searchSummary = criteria.entityPayload?.partySearchCriteria?.entityTradeName || criteria.entityTradeName || '';
  this.currentTab = 'entity';
  this.dataLoading = true;

  this.actualCustServ.getCustomersEntityAndLegalHoldList(criteria.entityPayload).subscribe({
    next: (response: any) => {
      this.availableEntityResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || 0;
      this.entityGridData = response?.searchResult || [];
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


// C. Add onEntityGridPageChange (right below onGridPageChange, lines 734–763):

onEntityGridPageChange(event: any): void {
  const pageEvent = event?.page ? event : event?.event || event;
  const criteriaPayload = this.lastEntityCriteria?.entityPayload;
  if (!criteriaPayload) return;

  const page = pageEvent.page;
  const pageSize = pageEvent.pageSize;
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = page * pageSize;

  const payload = JSON.parse(JSON.stringify(criteriaPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  this.dataLoading = true;
  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      this.availableEntityResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || this.availableEntityResultsCount;
      this.entityGridData = response?.searchResult || [];
      this.tabSwitchFlag = false;
      this.dataLoading = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Entity pagination search error:', err);
      this.setSearchError(err);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}


// 3. multi-level-entity-grid-component.ts
// A. Add Input & Output (around line 93):

@Input() totalCount: number = 0;
@Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();


// B. Update handleResponse (lines 238–245):

private handleResponse(res: any): void {
  this.tree = res.data as EntityRowNode[];
  this.stampTree(this.tree, '');
  this.showChipsSection = true;
  this.totalRows = this.totalCount || res.totalCount || 0;
  this.isLoading = false;
  this.refresh();
}


// C. Update refresh() (lines 274–286):
// Remove this.tree.slice(...) so it renders the server-provided slice directly:

private refresh(): void {
  this.totalRows = this.totalCount || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Server already returns this page's items, render this.tree directly
  this.rowData = [...this.flattenTree(this.tree)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}


// D. Update goPage() and onPageSizeChange() (lines 369–378):


goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.pageChange.emit({ page: 1, pageSize: this.pageSize });



  // quick error fix

  @if (currentTab === 'entity' && entityGridData.length && !tabSwitchFlag) {
    <multi-level-entity-grid #entityAggGrid
      [multiLevelGridData]="entityGridData"
      [searchSummary]="searchSummary"
      [deselectByOcifId]="deletedProfileEcifId"
      [totalCount]="availableEntityResultsCount"
      (pageChange)="onEntityGridPageChange($event)"
      (selectionChanged)="handleSelectionChange($event)"
      (removeProfile)="handleRemoveProfile($event)">
    </multi-level-entity-grid>
  }
}




