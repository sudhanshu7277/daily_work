// 1. multi-level-entity-grid-component.html (or .ts template)
// Update the items-per-page <select> (or mat-select) to capture the 
// selected value directly from the change event:

<select [value]="pageSize" (change)="onPageSizeChange($event)">
  @for (opt of pageSizeOpts; track opt) {
    <option [value]="opt">{{ opt }}</option>
  }
</select>

// 2. multi-level-entity-grid-component.ts
// Update goPage() and onPageSizeChange() so they turn on the internal 
// loader immediately and forward the correct pageSize:

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.isLoading = true;
  this.cdr.detectChanges();
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(event?: any): void {
  if (event) {
    const rawVal = event?.target?.value ?? event?.value ?? event;
    const parsed = Number(rawVal);
    if (!isNaN(parsed) && parsed > 0) {
      this.pageSize = parsed;
    }
  }
  this.currentPage = 1;
  this.isLoading = true;
  this.cdr.detectChanges();
  this.pageChange.emit({ page: 1, pageSize: this.pageSize });
}

// 3. legal-hold-shell.component.ts
// In onEntityGridPageChange(), ensure numbers are cleanly extracted and trigger 
// this.cdr.detectChanges() immediately after this.dataLoading = true:


onEntityGridPageChange(event: any): void {
  const pageEvent = event?.page ? event : event?.event || event;
  const criteriaPayload = this.lastEntityCriteria?.entityPayload;
  if (!criteriaPayload) return;

  const page = Number(pageEvent.page) || 1;
  const pageSize = Number(pageEvent.pageSize) || 10;
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = page * pageSize;

  const payload = JSON.parse(JSON.stringify(criteriaPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  // Immediate detection cycle to display the shell loading spinner instantly
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
