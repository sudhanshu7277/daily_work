import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef, RowClassRules } from 'ag-grid-community';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { LegalHoldDataService } from '../../services/legal-hold-data.service';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, AgGridAngular, 
    MatFormFieldModule, MatSelectModule, MatIconModule, MatButtonModule, TranslateModule
  ],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();
  
  private gridApi!: GridApi;
  public rowData: any[] = [];
  public showChipsSection = false;
  public selectedFilterIds: string[] = [];

  public filterOptions = [
    { id: 'ocifId', label: 'OCIF / Proxy ID' },
    { id: 'status', label: 'Legal Hold Status' },
    { id: 'holdName', label: 'Legal Hold Name' },
    { id: 'lifecycle', label: 'Customer Lifecycle Status' },
    { id: 'role', label: 'Role Type' },
    { id: 'address', label: 'Address' }
  ];

  // Restoring Row Class Rules for styling parent/child rows dynamically
  public rowClassRules: RowClassRules = {
    'grid-parent-row': (params) => params.data.isParent === true,
    'grid-child-row': (params) => params.data.isChild === true,
  };

  constructor(
    private legalHoldDataService: LegalHoldDataService, 
    private cdr: ChangeDetectorRef
  ) {
    this.selectedFilterIds = this.filterOptions.map(opt => opt.id);
  }

  ngOnInit(): void {}

  get activeFilters() {
    return this.filterOptions.filter(opt => this.selectedFilterIds.includes(opt.id));
  }

// results-grid.component.ts
public columnDefs: ColDef[] = [
  { 
    headerName: '', 
    checkboxSelection: true, 
    width: 50, 
    pinned: 'left', 
    headerCheckboxSelection: true 
  },
  { 
    field: 'legalName', 
    headerName: 'Profile Name', 
    sortable: true, 
    unSortIcon: true, // Required for the up/down arrows in Figma
    width: 300,
    pinned: 'left',
    headerClass: 'profile-name-header',
    cellClass: 'profile-name-cell'
  },
  { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
  { 
    field: 'status', 
    headerName: 'Legal Hold Status', 
    sortable: true, 
    unSortIcon: true, // Required for sorting arrows
    width: 180,
    cellRenderer: (params: any) => {
      return params.value === 'LEGAL HOLD' 
        ? `<div class="status-pill-blue">LEGAL HOLD</div>` 
        : 'N/A';
    }
  },
  { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
  { field: 'lifecycle', headerName: 'Customer Lifecycle Status', width: 200 },
  { field: 'role', headerName: 'Role Type', width: 150 },
  { 
    field: 'address', 
    headerName: 'Address', 
    flex: 1 // This forces the grid to occupy 100% of the UI width
  }
];

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  public onFilterChange() {
    this.filterOptions.forEach(opt => {
      this.gridApi.setColumnVisible(opt.id, this.selectedFilterIds.includes(opt.id));
    });
    setTimeout(() => this.gridApi.sizeColumnsToFit());
  }

  public removeFilter(id: string) {
    this.selectedFilterIds = this.selectedFilterIds.filter(fId => fId !== id);
    this.onFilterChange();
  }

  public performSearch(criteria: any): void {
    this.rowData = this.legalHoldDataService.postApiSearchResult(criteria);
    this.showChipsSection = this.rowData.length > 0;
    this.cdr.detectChanges();
  }

  public deselectRow(item: any): void {
    this.gridApi.forEachNode(node => {
      if (node.data.ocifId === item.ocifId) node.setSelected(false);
    });
  }

  public onSelectionChanged() {
    this.selectionChanged.emit(this.gridApi.getSelectedRows());
  }

  private toggleExpand(row: any) {
    row.isExpanded = !row.isExpanded;
    if (row.isExpanded) {
      const idx = this.rowData.findIndex(r => r.ocifId === row.ocifId);
      this.rowData.splice(idx + 1, 0, ...row.children);
    } else {
      const childIds = row.children.map((c: any) => c.ocifId);
      this.rowData = this.rowData.filter(r => !childIds.includes(r.ocifId));
    }
    this.rowData = [...this.rowData];
  }
}



// pagination code below html, ts, scss


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

// scss code below 

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