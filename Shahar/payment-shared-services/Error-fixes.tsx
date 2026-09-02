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