import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColDef, GridReadyEvent } from 'ag-grid-community';

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
  public allData: any[] = [];

  public columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      pinned: 'left',
      width: 450,
      // No checkboxSelection: true here; we build it manually below
      cellRenderer: (params: any) => this.profileNameRenderer(params)
    },
    { field: 'ocifId', headerName: 'Proxy OCIF ID', width: 150 },
    {
      field: 'legalHoldStatus',
      headerName: 'Status',
      width: 150,
      cellRenderer: (params: any) => params.value === 'LEGAL HOLD' 
        ? '<span class="status-pill">LEGAL HOLD</span>' : 'N/A'
    },
    { field: 'lifecycle', headerName: 'Lifecycle', width: 200 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  ngOnInit() {
    // Assuming you populate allData here from your service
    this.assignLevels(this.allData);
    this.refreshGrid();
  }

  // RECURSIVE ENGINE
  private assignLevels(data: any[], level = 0) {
    data.forEach(item => {
      item.level = level;
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

  // FIGMA RENDERER: Combined Checkbox + Text
  private profileNameRenderer(params: any): HTMLElement {
    const eGui = document.createElement('div');
    if (!params.data) return eGui;

    const { level, isParent, isExpanded, isSelected } = params.data;
    const indent = (level || 0) * 32;

    eGui.className = 'unified-profile-cell';
    eGui.style.paddingLeft = `${indent}px`;
    eGui.style.display = 'flex';
    eGui.style.alignItems = 'center';

    const checkboxHtml = `
      <div class="custom-checkbox ${isSelected ? 'checked' : ''}">
        ${isSelected ? '✓' : ''}
      </div>`;

    const chevronHtml = isParent 
      ? `<span class="bmo-thin-carrot ${isExpanded ? 'up' : 'down'}"></span>` 
      : '<span style="width: 20px; display: inline-block;"></span>';

    eGui.innerHTML = `
      ${checkboxHtml}
      ${chevronHtml}
      <span class="profile-name-text" style="font-weight: 600;">${params.value || ''}</span>
    `;

    return eGui;
  }

  onCellClicked(params: any) {
    const event = window.event as any;
    const target = event?.target as HTMLElement;

    // Handle Manual Checkbox Toggle
    if (target.classList.contains('custom-checkbox')) {
      params.data.isSelected = !params.data.isSelected;
      this.refreshGrid(); // Update UI
      this.selectionChanged.emit(this.rowData.filter(r => r.isSelected));
      return;
    }

    // Handle Expansion
    if (params.colDef.field === 'profileName' && params.data?.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.refreshGrid();
    }
  }

  public getRowClass = (params: any) => {
    if (!params.data) return '';
    const { level, isParent, isExpanded } = params.data;
    const classes = [];
    
    if (level === 0 && isParent && isExpanded) classes.push('blue-sandwich-parent');
    if (level > 0) classes.push('indented-child-row');

    const next = params.api.getDisplayedRowAtIndex(params.node.rowIndex + 1);
    if (level > 0 && (!next || next.data.level === 0)) classes.push('sandwich-bottom-border');

    return classes.join(' ');
  };

  // Stubs to clear HTML errors
  onSelectionChanged() {}
  onPaginationChanged() {}

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
  /* Remove vertical lines between columns */
  .ag-header-cell::after, .ag-cell::after {
    display: none !important;
  }

  .ag-row { border-bottom: 1px solid #f2f2f2 !important; }

  /* Blue Sandwich Visuals */
  .blue-sandwich-parent {
    background-color: #E8F4FD !important;
    border-top: 2px solid #004c97 !important;
  }

  .indented-child-row { background-color: #ffffff !important; }

  .sandwich-bottom-border {
    border-bottom: 2px solid #004c97 !important;
  }

  /* Custom Checkbox that indents */
  .custom-checkbox {
    width: 18px; height: 18px;
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
    &.checked { background: #004c97; }
  }

  /* Thin Carrot */
  .bmo-thin-carrot {
    width: 8px; height: 8px;
    border-top: 1.5px solid #004c97;
    border-right: 1.5px solid #004c97;
    display: inline-block;
    transition: 0.2s;
    margin-right: 10px;
    &.down { transform: rotate(135deg); }
    &.up { transform: rotate(-45deg); margin-top: 4px; }
  }
  
  .status-pill {
    background: #1e1e1e; color: #fff;
    padding: 2px 8px; border-radius: 4px; font-weight: 700;
  }
}
//enc of scss//