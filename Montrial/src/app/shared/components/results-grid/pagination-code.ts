@if (rowData && rowData.length > 0) {
  <div class="grid-wrapper">
    <ag-grid-angular
      style="width: 100%; height: 500px;"
      class="ag-theme-alpine bmo-grid"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      [pagination]="true"
      [paginationPageSize]="10"
      [suppressPaginationPanel]="true" 
      (gridReady)="onGridReady($event)"
      (paginationChanged)="onPaginationChanged()">
    </ag-grid-angular>

    <div class="custom-pagination">
      <div class="pag-left">
        Showing <b>{{totalResults}}</b> results
      </div>

      <div class="pag-center">
        <button class="pag-btn" (click)="prevPage()" [disabled]="currentPage === 1">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <span class="pag-info">
          Page <b>{{currentPage}}</b> of <b>{{totalPages}}</b>
        </span>
        <button class="pag-btn" (click)="nextPage()" [disabled]="currentPage === totalPages">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <div class="pag-right">
        <span>Rows per page:</span>
        <select (change)="onPageSizeChange($event)">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  </div>
}

// ts code below

private gridApi: any;
public totalResults = 0;
public currentPage = 1;
public totalPages = 1;

onGridReady(params: any) {
  this.gridApi = params.api;
  this.updatePaginationInfo();
}

onPaginationChanged() {
  this.updatePaginationInfo();
}

updatePaginationInfo() {
  if (this.gridApi) {
    this.totalResults = this.gridApi.getDisplayedRowCount();
    this.currentPage = this.gridApi.paginationGetCurrentPage() + 1;
    this.totalPages = this.gridApi.paginationGetTotalPages() || 1;
  }
}

nextPage() { this.gridApi.paginationGoToNextPage(); }
prevPage() { this.gridApi.paginationGoToPreviousPage(); }
onPageSizeChange(event: any) {
  const newSize = Number(event.target.value);
  this.gridApi.paginationSetPageSize(newSize);
}

//scss code below

.grid-wrapper {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  overflow: hidden;
}

.custom-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #ffffff;
  border-top: 1px solid #e2e2e2;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #333;

  .pag-center {
    display: flex;
    align-items: center;
    gap: 15px;

    .pag-btn {
      background: none;
      border: 1px solid #dcdcdc;
      border-radius: 4px;
      padding: 2px;
      cursor: pointer;
      display: flex;
      color: #007da3; // Your theme blue

      &:disabled {
        color: #ccc;
        cursor: not-allowed;
        border-color: #eee;
      }
    }
  }

  .pag-right select {
    border: none;
    font-weight: 600;
    background: transparent;
    cursor: pointer;
    outline: none;
    margin-left: 5px;
  }
}