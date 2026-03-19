import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColDef, GridReadyEvent } from 'ag-grid-community';
import { LegalHoldDataService } from '../../services/legal-hold-data.service';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();

  private gridApi!: GridApi;
  public rowData: any[] = [];
  public pageSize = 10;
  private allData: any[] = [];
  private selectionInProgress = false;

  public columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      pinned: 'left',
      width: 450,
      // Removed default checkboxSelection to indent it manually
      cellRenderer: (params: any) => this.profileNameRenderer(params)
    },
    { field: 'ocifId', headerName: 'Proxy OCIF ID', width: 150 },
    {
      field: 'legalHoldStatus',
      headerName: 'Legal Hold Status',
      width: 180,
      cellRenderer: (params: any) => {
        if (params.value === 'LEGAL HOLD') return '<span class="status-pill">LEGAL HOLD</span>';
        return params.value || 'N/A';
      }
    },
    { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
    { field: 'lifecycle', headerName: 'Customer Lifecycle Status', width: 200 },
    { field: 'role', headerName: 'Role Type', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  constructor(private legalHoldDataService: LegalHoldDataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.allData = this.legalHoldDataService.getMockData();
    this.assignLevels(this.allData);
    this.refreshGrid();
  }

  private assignLevels(data: any[], level = 0) {
    data.forEach(item => {
      item.level = level;
      item.isSelected = item.isSelected || false;
      item.isExpanded = item.isExpanded || false;
      if (item.children?.length) this.assignLevels(item.children, level + 1);
    });
  }

  private buildVisibleRows(data: any[], visible: any[] = []) {
    data.forEach(item => {
      visible.push(item);
      if (item.isParent && item.isExpanded && item.children?.length) {
        this.buildVisibleRows(item.children, visible);
      }
    });
    return visible;
  }

  public refreshGrid() {
    this.rowData = [...this.buildVisibleRows(this.allData)];
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  // FIX: Creating a DOM element prevents the "parameter 1 is not of type Node" error
  private profileNameRenderer(params: any): HTMLElement {
    const eGui = document.createElement('div');
    if (!params.data) return eGui;

    const { level, isParent, isExpanded, isSelected } = params.data;
    const indent = (level || 0) * 32;

    eGui.className = 'unified-profile-cell';
    eGui.style.paddingLeft = `${indent}px`;
    eGui.style.display = 'flex';
    eGui.style.alignItems = 'center';

    const checkboxClass = isSelected ? 'custom-checkbox checked' : 'custom-checkbox';
    const chevron = isParent ? (isExpanded ? '▲' : '▼') : '';

    eGui.innerHTML = `
      <div class="${checkboxClass}">${isSelected ? '✓' : ''}</div>
      <span class="chevron-toggle" style="width: 20px; cursor: pointer; color: #004c97; margin-right: 8px;">${chevron}</span>
      <span class="profile-name-text" style="font-weight: 600;">${params.value}</span>
    `;

    return eGui;
  }

  // Handle manual selection logic
  private toggleSelection(data: any) {
    data.isSelected = !data.isSelected;
    if (data.isParent) {
      this.propagateDown(data.children || [], data.isSelected);
    }
    this.refreshGrid();
    this.selectionChanged.emit(this.rowData.filter(r => r.isSelected));
  }

  private propagateDown(children: any[], selected: boolean) {
    children.forEach(child => {
      child.isSelected = selected;
      if (child.children?.length) this.propagateDown(child.children, selected);
    });
  }

  onCellClicked(params: any) {
    const event = window.event as any;
    const target = event?.target as HTMLElement;

    if (target.classList.contains('custom-checkbox')) {
      this.toggleSelection(params.data);
      return;
    }

    if (params.data?.isParent && (target.classList.contains('chevron-toggle') || params.colDef.field === 'profileName')) {
      params.data.isExpanded = !params.data.isExpanded;
      this.refreshGrid();
    }
  }

  public getRowClass = (params: any) => {
    if (!params.data) return '';
    const { level, isParent, isExpanded } = params.data;
    const classes = [];
    if (level > 0) classes.push('indented-child-row');
    if (level === 0 && isParent && isExpanded) classes.push('blue-sandwich-parent');
    
    // Closure logic
    const nextNode = params.api.getDisplayedRowAtIndex(params.node.rowIndex + 1);
    if (level > 0 && (!nextNode || nextNode.data.level === 0)) {
      classes.push('sandwich-bottom-border');
    }
    return classes.join(' ');
  };

  // Missing methods from your HTML errors:
  onSelectionChanged() { 
    // Handled via custom checkbox toggle, but keeping for grid consistency
  }

  onPaginationChanged() {
    // Logic for updating your custom "Showing X results" label
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.refreshGrid();
  }
}
// html//

<div class="grid-card-container grid-container-with-footer">
  <ag-grid-angular
    class="ag-theme-alpine bmo-grid"
    [rowData]="rowData"
    [columnDefs]="columnDefs"
    [rowSelection]="'multiple'"
    [pagination]="true"
    [paginationPageSize]="pageSize"
    [suppressPaginationPanel]="true"
    [suppressRowClickSelection]="true"
    [getRowClass]="getRowClass"
    (gridReady)="onGridReady($event)"
    (selectionChanged)="onSelectionChanged()"
    (paginationChanged)="onPaginationChanged()"
    (cellClicked)="onCellClicked($event)">
  </ag-grid-angular>
</div>
// end of html//

//scss code //
::ng-deep .ag-theme-alpine.bmo-grid {
  /* Remove Vertical separators between columns */
  .ag-header-cell::after, .ag-cell::after {
    display: none !important;
  }

  /* Blue Sandwich Visuals */
  .blue-sandwich-parent {
    background-color: #E8F4FD !important;
    border-top: 2px solid #004c97 !important;
  }

  .indented-child-row {
    background-color: #ffffff !important;
    border-bottom: 1px solid #f2f2f2 !important;
  }

  .sandwich-bottom-border {
    border-bottom: 2px solid #004c97 !important;
  }

  /* Custom checkbox styling to allow indentation */
  .custom-checkbox {
    width: 18px;
    height: 18px;
    border: 1.5px solid #004c97;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
    background: white;
    cursor: pointer;
    font-size: 10px;
    color: white;

    &.checked {
      background: #004c97;
    }
  }

  .status-pill {
    background-color: #1e1e1e;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }
}
//enc of scss//