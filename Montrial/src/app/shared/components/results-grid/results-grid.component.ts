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

  // on selection changed function start

 onSelectionChanged() {
  // 1. Guard against recursive calls and ensure API is ready
  if (this.selectionInProgress || !this.gridApi) return;
  this.selectionInProgress = true;

  try {
    // 2. Identify the nodes currently selected in the UI
    const selectedNodes = this.gridApi.getSelectedNodes();
    
    // 3. Sync Children with Parents
    // We iterate through all nodes to ensure children match their parent's state
    this.gridApi.forEachNode((node: any) => {
      if (node.data && node.data.isParent) {
        const parentIsSelected = node.isSelected();
        
        // Find all children for this specific parent
        // Note: Using childrenAfterFilter ensures we only touch what the user sees
        const children = node.childrenAfterFilter || node.allLeafChildren;
        
        if (children && children.length > 0) {
          children.forEach((childNode: any) => {
            // Only update if the child state is different from the parent
            // 'true' for suppressEvents prevents the lag/infinite loop
            if (childNode.isSelected() !== parentIsSelected) {
              childNode.setSelected(parentIsSelected, false, true);
            }
          });
        }
      }
    });

    // 4. Update the Data Payloads
    const allSelectedData = this.gridApi.getSelectedNodes().map(node => node.data);

    // BACKGROUND PAYLOAD: Contains everything (Parents + Children) for the API
    this.selectedRowsData = allSelectedData;

    // UI PANEL DATA: Filtered to show ONLY Parents in the Selection Panel
    this.displayRowsForPanel = allSelectedData.filter(data => data && data.isParent);

    // 5. Emit the filtered list to your Selection Panel Component
    this.selectionChanged.emit(this.displayRowsForPanel);

  } catch (error) {
    console.error("Selection sync failed:", error);
  } finally {
    // 6. Always reset the flag to allow future selections
    this.selectionInProgress = false;
  }
}
// on selection changed function end

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

onRowGroupOpened(params: any) {
  const isExpanded = params.node.expanded;
  const rowNode = params.node;

  // 1. Tag the parent data so the grid knows it's active
  if (rowNode.data) {
    rowNode.data.isActiveParent = isExpanded;
  }

  // 2. Identify and tag the children
  // This ensures they stay white and indented regardless of grid internal logic
  if (rowNode.allLeafChildren) {
    rowNode.allLeafChildren.forEach((childNode: any) => {
      if (childNode.data) {
        childNode.data.isGroupChild = isExpanded;
      }
    });
  }

  // 3. REFRESH ONLY: Use refreshCells to avoid the checkbox 'unselect' bug.
  // This updates the UI without destroying the DOM elements.
  params.api.refreshCells({
    rowNodes: [rowNode, ...rowNode.allLeafChildren],
    force: true
  });
}

// Updated getRowClass to use our new manual tags
public getRowClass = (params: any) => {
  const classes = [];
  
  if (params.data?.isActiveParent) {
    classes.push('figma-parent-expanded');
  }
  
  if (params.data?.isGroupChild) {
    classes.push('figma-child-row');
  }

  return classes.join(' ');
};
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