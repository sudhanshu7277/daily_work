<div class="grid-container" *ngIf="rowData && rowData.length > 0">
  
  <ag-grid-angular
    style="width: 100%; height: 500px;"
    class="ag-theme-alpine bmo-grid"
    [columnDefs]="columnDefs"
    [rowData]="rowData"
    [gridOptions]="gridOptions"
    (gridReady)="onGridReady($event)"
    (paginationChanged)="onPaginationChanged()">
  </ag-grid-angular>

  <div class="custom-pagination">
    <div class="pag-left">
      Showing <b>{{totalResults}}</b> results
    </div>
    <div class="pag-center">
      <button class="pag-btn" (click)="onBtPrevious()" [disabled]="currentPage === 1">
        <mat-icon>chevron_left</mat-icon>
      </button>
      <span class="pag-info">
        Page <b>{{currentPage}}</b> of <b>{{totalPages}}</b>
      </span>
      <button class="pag-btn" (click)="onBtNext()" [disabled]="currentPage === totalPages">
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
    <div class="pag-right">
      <span>Rows per page:</span>
      <select class="page-size-select" (change)="onPageSizeChanged($event)">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
  </div>
</div>

// Add these variables
public totalResults = 0;
public currentPage = 1;
public totalPages = 1;

// Update gridOptions
this.gridOptions = {
  pagination: true,
  paginationPageSize: 10,
  suppressPaginationPanel: true, // This hides the ugly default bar
};

onGridReady(params: any) {
  this.gridApi = params.api;
  this.updatePaginationValues();
}

onPaginationChanged() {
  this.updatePaginationValues();
}

updatePaginationValues() {
  if (this.gridApi) {
    this.totalResults = this.gridApi.getDisplayedRowCount();
    this.currentPage = this.gridApi.paginationGetCurrentPage() + 1;
    this.totalPages = this.gridApi.paginationGetTotalPages();
  }
}

onBtNext() { this.gridApi.paginationGoToNextPage(); }
onBtPrevious() { this.gridApi.paginationGoToPreviousPage(); }

onPageSizeChanged(event: any) {
  const value = (event.target as HTMLSelectElement).value;
  this.gridApi.paginationSetPageSize(Number(value));
}


.custom-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #fff;
  border: 1px solid #e2e2e2;
  border-top: none; /* Seamlessly connects to the grid */
  font-size: 14px;
  font-family: 'Open Sans', sans-serif;

  .pag-left b { font-weight: 600; }

  .pag-center {
    display: flex;
    align-items: center;
    gap: 12px;

    .pag-btn {
      background: none;
      border: 1px solid #dcdcdc;
      border-radius: 4px;
      padding: 2px;
      cursor: pointer;
      display: flex;
      color: #007da3; /* Theme Blue */

      &:disabled {
        color: #ccc;
        cursor: not-allowed;
      }
    }
  }

  .pag-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .page-size-select {
      border: none;
      font-weight: 600;
      background: transparent;
      outline: none;
      cursor: pointer;
    }
  }
}