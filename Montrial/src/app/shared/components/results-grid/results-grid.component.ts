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


// GROUPING CODE START

// results-grid.component.ts

public getRowClass = (params: any) => {
  const classes = [];

  // 1. Logic for Parent Row Background & Top Border
  if (params.node && params.node.expanded) {
    classes.push('expanded-parent-row');
  }

  // 2. Logic for Child Row Indentation
  if (params.data && params.data.isChild) {
    classes.push('child-row');
    
    // Logic for Group Bottom Border (Dark Blue line at the very end)
    const rowIndex = params.node.rowIndex;
    const nextNode = params.api.getDisplayedRowAtIndex(rowIndex + 1);
    if (!nextNode || !nextNode.data || !nextNode.data.isChild) {
      classes.push('last-child-item');
    }
  }

  return classes.join(' ');
};

// This ensures the blue background and borders toggle immediately
onRowGroupOpened(params: any) {
  params.api.redrawRows(); 
}

// GROUPING CODE END


// pagination code below html, ts, scss

@if (rowData && rowData.length > 0) {
  <div class="grid-container-with-footer">
    <ag-grid-angular
      style="width: 100%; height: 500px;"
      class="ag-theme-alpine bmo-grid"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      [pagination]="true"
      [paginationPageSize]="pageSize"
      [suppressPaginationPanel]="true"
      (gridReady)="onGridReady($event)"
      (paginationChanged)="onPaginationChanged()">
    </ag-grid-angular>

    <div class="custom-pagination-bar">
      <div class="pag-section pag-left">
        Showing <b>{{totalResults}}</b> results
      </div>

      <div class="pag-section pag-center">
        <button class="icon-btn" (click)="prevPage()" [disabled]="currentPage === 1">
          <mat-icon>chevron_left</mat-icon>
        </button>
        
        <span class="page-text">
          Page <b>{{currentPage}}</b> of <b>{{totalPages}}</b>
        </span>

        <button class="icon-btn" (click)="nextPage()" [disabled]="currentPage === totalPages">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <div class="pag-section pag-right">
        <span>Rows per page:</span>
        <select class="page-dropdown" (change)="onPageSizeChange($event)">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>
  </div>
}

// ts code below

// Properties to track pagination state
public gridApi: any;
public totalResults = 0;
public currentPage = 1;
public totalPages = 1;
public pageSize = 10;
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

// Navigation Methods
nextPage() { this.gridApi.paginationGoToNextPage(); }
prevPage() { this.gridApi.paginationGoToPreviousPage(); }

onPageSizeChange(event: any) {
  const newSize = Number(event.target.value);
  this.pageSize = newSize;
  // Modern API fix for v30+
  this.gridApi.setGridOption('paginationPageSize', newSize);
}

// scss code below 

.grid-container-with-footer {
  border: 1px solid #e2e2e2;
  background: #fff;
}

.custom-pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e2e2e2;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #333;

  .pag-section {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .pag-left { justify-content: flex-start; }
  .pag-center { justify-content: center; gap: 16px; }
  .pag-right { justify-content: flex-end; gap: 8px; }

  b { font-weight: 600; }

  .icon-btn {
    background: white;
    border: 1px solid #dcdcdc;
    border-radius: 4px;
    padding: 2px;
    cursor: pointer;
    display: flex;
    color: #007da3; // Theme Blue

    &:disabled {
      color: #ccc;
      cursor: not-allowed;
      border-color: #f2f2f2;
    }

    mat-icon { font-size: 20px; width: 20px; height: 20px; }
  }

  .page-dropdown {
    border: none;
    font-weight: 600;
    background: transparent;
    cursor: pointer;
    outline: none;
    font-size: 14px;
    color: #333;
  }
}