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
    sortable: true, // Enables up/down arrows for sorting
    unSortIcon: true, // Shows arrows even when not sorted
    width: 300,
    pinned: 'left',
    headerClass: 'profile-name-header-separator',
    cellClass: 'profile-name-cell-separator',
    cellRenderer: (params: any) => {
        // Implementation for the name and carrot icon
        const data = params.data;
        const carrot = data?.isParent ? `<span class="carrot-icon ${data.isExpanded ? 'up' : 'down'}"></span>` : '';
        return `<span>${params.value}</span> ${carrot}`;
    }
  },
  { 
    field: 'ocifId', 
    headerName: 'OCIF / Proxy ID', 
    width: 150 
  },
  { 
    field: 'status', 
    headerName: 'Legal Hold Status', 
    sortable: true, // Enables up/down arrows for sorting
    unSortIcon: true,
    width: 180,
    cellRenderer: (params: any) => {
        return params.value === 'LEGAL HOLD' 
            ? `<div class="legal-hold-pill">LEGAL HOLD</div>` 
            : 'N/A';
    }
  },
  { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
  { field: 'lifecycle', headerName: 'Customer Lifecycle Status', width: 200 },
  { field: 'role', headerName: 'Role Type', width: 120 },
  { 
    field: 'address', 
    headerName: 'Address', 
    flex: 1 // Forces the grid to occupy the whole width
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