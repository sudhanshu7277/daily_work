// The Only Two Fixes Needed
//1. Spinner Visibility: Trigger Change Detection Immediately
// In legal-hold-shell.component.ts, when onEntityGridPageChange starts, this.dataLoading = true is set, but Angular doesn't paint the shell spinner because change detection isn't triggered before the asynchronous HTTP request begins.

// Add this.cdr.detectChanges() right after this.dataLoading = true:


onEntityGridPageChange(event: { page: number; pageSize: number }): void {
  const criteriaPayload = this.lastEntityCriteria?.entityPayload;
  if (!criteriaPayload) return;

  const startIndex = (event.page - 1) * event.pageSize + 1;
  const endIndex = event.page * event.pageSize;

  const payload = JSON.parse(JSON.stringify(criteriaPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  // Turn on loading and force view update so spinner paints immediately
  this.dataLoading = true;
  this.cdr.detectChanges();

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


// 2. Grid-Level Spinner (Inside multi-level-entity-grid-component.ts)
// In multi-level-entity-grid-component.ts, set this.isLoading = true 
// and call this.cdr.detectChanges() inside goPage() and onPageSizeChange():


goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.isLoading = true;
  this.cdr.detectChanges();
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.isLoading = true;
  this.cdr.detectChanges();
  this.pageChange.emit({ page: 1, pageSize: this.pageSize });
}


