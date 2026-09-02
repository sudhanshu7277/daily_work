/// Step 1: Update legal-hold-shell.component.html
// Add !dataLoading directly to the Entity Grid @if check 
// (and ensure it sits inside the results container):


@if (currentTab === 'entity' && entityGridData.length && !tabSwitchFlag && !dataLoading) {
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


// Step 2: Ensure Immediate Detection in onEntityGridPageChange
// In legal-hold-shell.component.ts, verify this.dataLoading = true; 
// triggers change detection immediately before making the HTTP call:

onEntityGridPageChange(event: { page: number; pageSize: number }): void {
  if (!this.lastEntityCriteria?.entityPayload) return;
  const startIndex = (event.page - 1) * event.pageSize + 1;
  const endIndex = event.page * event.pageSize;
  const payload = JSON.parse(JSON.stringify(this.lastEntityCriteria.entityPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  // Hides the grid and reveals the loading spinner immediately
  this.dataLoading = true;
  this.cdr.detectChanges();

  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      this.availableEntityResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) ||
        this.availableEntityResultsCount;
      this.entityGridData = response?.searchResult || [];
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

