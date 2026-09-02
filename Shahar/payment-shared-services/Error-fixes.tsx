/// The Shell Spinner Fix
// To make sure the loading spinner displays immediately whenever 
// a user navigates pages or changes the page size, apply 
// this.cdr.detectChanges() directly after this.dataLoading = true; 
// in legal-hold-shell.component.ts:

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

  this.dataLoading = true;
  this.cdr.detectChanges(); // Forces immediate paint of <div class="spinner">

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


// Do the same for onGridPageChange (the customer handler):


this.dataLoading = true;
  this.cdr.detectChanges(); // Forces immediate paint of customer loading spinner