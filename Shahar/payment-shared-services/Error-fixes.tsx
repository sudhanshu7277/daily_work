// Step 1: Update multi-level-grid.mapper.ts
//Only modify lines 122–126 to use 1000 (or availableResultsCount if 
// valid) instead of slicing data.length:


export const mapMultiLevelApiResponse = (res: any): { totalCount: number; data: any[] } => {
  const results = res?.searchResult ?? res?.searchResults ?? (Array.isArray(res) ? res : []);
  const data = results.map((p: any) => mapPlayer(p));
  
  // Use 1000 as configured for server-side testing
  const serverCount = Number(res?.responsePaginationInfo?.availableResultsCount);
  const totalCount = (!isNaN(serverCount) && serverCount > 1) ? serverCount : 1000;

  return { totalCount, data };
};


// Step 2: Update multi-level-customer-grid.component.ts
// 1. Add inputs & output (around line 93):


@Input() totalCount: number = 1000;
@Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();


// 2. Update handleResponse() (lines 238–245):

// Keep currentPage unch


private handleResponse(res: any): void {
  this.tree = res.data as EntityRowNode[];
  this.stampTree(this.tree, '');
  this.showChipsSection = true;
  this.totalRows = this.totalCount || res.totalCount || 1000;
  this.isLoading = false;
  this.refresh();
}


// 3. Update refresh() (lines 274–285):

 // Stop client-side slicing of this.tree because the API now returns
 //  the current page's slice:


 private refresh(): void {
  // Use server total rows
  this.totalRows = this.totalCount || 1000;
  this.totalPages = Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  this.pageNumbers = this.buildPageNumbers();
  
  // Render current server-provided page directly
  this.rowData = [...this.flattenTree(this.tree)];
  this.syncHeaderCheckbox();
  this.cdr.detectChanges();
}


// 4. Update goPage() and onPageSizeChange() (lines 369–378):

// Emit the pagination request to the shell:

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}


// Step 3: Wire Event in legal-hold-shell.component.html
// Add the (pageChange) binding to your customer grid:

<multi-level-customer-grid
  [multiLevelGridData]="customerGridData"
  [totalCount]="1000"
  (pageChange)="onGridPageChange($event)"
  (selectionChanged)="onSelectionChange($event)">
</multi-level-customer-grid>


// Step 4: Handle Pagination in legal-hold-shell.component.ts
// Add the page-fetch handler to call the service with the matching payload indices:


// Add handler in legal-hold-shell.component.ts
onGridPageChange(event: { page: number; pageSize: number }): void {
  const startIndex = (event.page - 1) * event.pageSize + 1;
  const endIndex = event.page * event.pageSize;

  // Clone active payload and attach requested indices
  const payload = JSON.parse(JSON.stringify(this.lastSearchCriteria?.customerSearchPayload || {}));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: "true",
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  this.dataLoading = true;
  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      this.customerGridData = response;
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



// new changes

// 1. In legal-hold-shell.component.html (Fix Image 83)
// Change line 8 from (pageChange)="onGridPageChange(event: $event)" to:

<multi-level-customer-grid #customerSearchGridRef
  [multiLevelGridData]="customerGridData"
  [searchSummary]="searchSummary"
  [deselectByOcifId]="deletedProfileEcifId"
  [totalCount]="availableCustomerResultsCount"
  (pageChange)="onGridPageChange($event)"
  (selectionChanged)="handleSelectionChange($event)"
  (removeProfile)="handleRemoveProfile($event)">
</multi-level-customer-grid>


// 2. In legal-hold-shell.component.ts
// Ensure lastSearchCriteria is stored during search, and update onGridPageChange:

// Property declarations
availableCustomerResultsCount: number = 0;
lastCustomerCriteria: any = null;

// Inside onSearch(criteria: any):
// Where customer search is triggered (around lines 305-315 from Image 85):
if ((criteria !== '' && this.currentTab === 'customer') || 
    (criteria.hasOwnProperty('searchType') && criteria.searchType === 'SEARCH_CUSTOMER')) {
  
  this.lastCustomerCriteria = criteria; // Save search criteria for pagination!

  const party = criteria.customerSearchPayload?.partySearchCriteria;
  this.searchSummary = [party?.firstName, party?.middleName, party?.lastName].filter(Boolean).join(' ') || criteria.firstName || '';
  this.currentTab = 'customer';
  this.dataLoading = true;

  // Ensure requestPaginationInfo has defaults if not set
  if (!criteria.customerSearchPayload.requestPaginationInfo) {
    criteria.customerSearchPayload.requestPaginationInfo = {
      returnAvailableResultCount: 'true',
      pageStartIndex: '1',
      pageEndIndex: '10'
    };
  }

  this.actualCustServ.getCustomersEntityAndLegalHoldList(criteria.customerSearchPayload).subscribe({
    next: (response: any) => {
      console.log('response : ', response);
      this.availableCustomerResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || 0;
      this.customerGridData = response?.searchResult || [];
      this.dataLoading = false;
      this.tabSwitchFlag = false;
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      console.error('Error: ', error);
      this.tabSwitchFlag = true;
      this.setSearchError(error);
      this.dataLoading = false;
      this.cdr.detectChanges();
    }
  });
}


// Add the onGridPageChange method to LegalHoldShellComponent:


onGridPageChange(event: { page: number; pageSize: number }): void {
  if (!this.lastCustomerCriteria?.customerSearchPayload) return;

  const startIndex = (event.page - 1) * event.pageSize + 1;
  const endIndex = event.page * event.pageSize;

  // Deep clone payload to avoid mutating base criteria
  const payload = JSON.parse(JSON.stringify(this.lastCustomerCriteria.customerSearchPayload));
  payload.requestPaginationInfo = {
    returnAvailableResultCount: 'true',
    pageStartIndex: String(startIndex),
    pageEndIndex: String(endIndex)
  };

  this.dataLoading = true;
  this.actualCustServ.getCustomersEntityAndLegalHoldList(payload).subscribe({
    next: (response: any) => {
      this.availableCustomerResultsCount = Number(response?.responsePaginationInfo?.availableResultsCount) || this.availableCustomerResultsCount;
      this.customerGridData = response?.searchResult || [];
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


// 3. In multi-level-customer-grid.component.ts
//Ensure lines 369–378 emit the page changes properly:

goPage(page: number): void {
  if (page < 1 || page > this.totalPages || page === this.currentPage) return;
  this.currentPage = page;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}

onPageSizeChange(): void {
  this.currentPage = 1;
  this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
}


// And in ngOnChanges (Image 51, lines 162–170):

//Ensure incoming data updates refresh the grid smoothly:

if (changes['multiLevelGridData'] && this.multiLevelGridData) {
  const curr = changes['multiLevelGridData'].currentValue;
  if (curr) {
    this.isLoading = true;
    this.loaderError = false;
    this.handleResponse(this.mapApiResponse(curr));
    this.syncColumns();
  }
}


// And in multi-level-grid.mapper.ts (lines 122–126):
//Use the real availableResultsCount:

export const mapMultiLevelApiResponse = (res: any): { totalCount: number; data: any[] } => {
  const results = res?.searchResult ?? res?.searchResults ?? (Array.isArray(res) ? res : []);
  const data = results.map((p: any) => mapPlayer(p));
  
  const serverCount = Number(res?.responsePaginationInfo?.availableResultsCount);
  const totalCount = (!isNaN(serverCount) && serverCount > 0) ? serverCount : data.length;

  return { totalCount, data };
};





