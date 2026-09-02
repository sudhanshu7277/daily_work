// File 1: multi-level-entity-grid-component.ts
// 1. Add Input and Output Properties (around lines 70–94)

@Input() deselectByOcifId: any = null;
@Input() totalCount: number = 0;
@Output() removeProfile = new EventEmitter<any>();
@Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

// 2. Update handleResponse (lines 238–245)

// Bind the incoming count to this.totalRows instead of relying solely on the payload length:

private handleResponse(res: any): void {
  this.tree = res.data as EntityRowNode[];
  this.stampTree(this.tree, '');
  this.showChipsSection = true;
  this.totalRows = this.totalCount || res.totalCount || 0;
  this.isLoading = false;
  this.refresh();
}


// 3. Update refresh() (lines 274–285)

// Remove this.tree.slice(...). The API provides the active page slice 
// directly, which prevents local array truncation issues when switching page sizes:

private refresh(): void {
  this.totalRows = this.totalCount || 0;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();

  // Render server-provided rows directly
  this.rowData = [...this.flattenTree(this.tree)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}


// 4. Update goPage() and onPageSizeChange() (lines 369–378)

// Emit page events to legal-hold-shell so it fetches the requested slice from the service:

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.pageChange.emit({ page: 1, pageSize: this.pageSize });
}

// File 2: legal-hold-shell.component.html
// Update the <multi-level-entity-grid> element binding in the template:

@if (currentTab === 'entity' && entityGridData && entityGridData.length && !tabSwitchFlag) {
  <multi-level-entity-grid #entitySearchGridRef
    [multiLevelGridData]="entityGridData"
    [searchSummary]="searchSummary"
    [deselectByOcifId]="deletedProfileEcifId"
    [totalCount]="availableEntityResultsCount"
    (pageChange)="onEntityGridPageChange($event)"
    (selectionChanged)="handleSelectionChange($event)"
    (removeProfile)="handleRemoveProfile($event)">
  </multi-level-entity-grid>
}

// File 3: legal-hold-shell.component.ts
// 1. Declare Entity Pagination State (lines ~76–79)

availableEntityResultsCount: number = 0;
lastEntityCriteria: any = null;

// 2. Persist Entity Criteria in onSearch(criteria: any) (lines 254–278)

if (
  (criteria !== '' && this.currentTab === 'entity') ||
  (criteria.hasOwnProperty('searchType') && 
   (criteria.searchType === 'entity' || criteria.searchType === 'ENTITY_CUSTOMER'))
) {
  this.lastEntityCriteria = criteria; // Persist criteria specifically for entity paging
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

// 3. Add onEntityGridPageChange (adjacent to onGridPageChange)

onEntityGridPageChange(event: { page: number; pageSize: number }): void {
  const criteriaPayload = this.lastEntityCriteria?.entityPayload;
  if (!criteriaPayload) return;

  const startIndex = (event.page - 1) * event.pageSize + 1;
  const endIndex = event.page * event.pageSize;

  // Deep clone payload so baseline criteria remains immutable
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

