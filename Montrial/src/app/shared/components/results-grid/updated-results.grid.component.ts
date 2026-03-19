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
  private allData: any[] = [];
  private selectionInProgress = false;

  public columnDefs: ColDef[] = [
    {
      headerName: 'Profile Name',
      field: 'profileName',
      pinned: 'left',
      width: 450,
      // We handle the checkbox manually inside this renderer
      cellRenderer: (params: any) => this.profileNameRenderer(params)
    },
    { headerName: 'Proxy OCIF ID', field: 'ocifId', width: 150 },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      width: 180,
      cellRenderer: (params: any) => params.value === 'LEGAL HOLD'
        ? '<span class="status-pill">LEGAL HOLD</span>'
        : (params.value || 'N/A')
    },
    { headerName: 'Legal Hold Name', field: 'holdName', width: 200 },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle', width: 200 },
    { headerName: 'Role Type', field: 'role', width: 150 },
    { headerName: 'Address', field: 'address', flex: 1 }
  ];

  ngOnInit() {
    // In a real app, this would come from your service
    this.allData = this.getMockData(); 
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

  private profileNameRenderer(params: any): string {
    if (!params.data) return '';
    const { level, isParent, isExpanded, isSelected } = params.data;
    
    // Figma Indent: 32px per level
    const indent = (level || 0) * 32;

    // Checkbox HTML
    const checkboxClass = isSelected ? 'custom-checkbox checked' : 'custom-checkbox';
    const checkboxHtml = `<div class="${checkboxClass}">${isSelected ? '✓' : ''}</div>`;

    // Chevron HTML
    const chevronHtml = isParent 
      ? `<span class="bmo-thin-carrot ${isExpanded ? 'up' : 'down'}"></span>` 
      : '<span style="width: 20px; display: inline-block;"></span>';

    return `
      <div class="unified-profile-cell" style="padding-left: ${indent}px">
        ${checkboxHtml}
        ${chevronHtml}
        <span class="profile-name-text">${params.value}</span>
      </div>
    `;
  }

  onCellClicked(params: any) {
    const event = window.event as any;
    const target = event?.target as HTMLElement;

    // 1. Handle Custom Checkbox Click
    if (target.classList.contains('custom-checkbox')) {
      params.data.isSelected = !params.data.isSelected;
      this.syncAndPropagate();
      return;
    }

    // 2. Handle Expansion Toggle
    if (params.colDef.field === 'profileName' && params.data?.isParent) {
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

    // Closure Logic for the Blue Sandwich
    const nextNode = params.api.getDisplayedRowAtIndex(params.node.rowIndex + 1);
    const isEndOfCluster = level > 0 && (!nextNode || nextNode.data.level === 0);
    
    if (isEndOfCluster) classes.push('sandwich-bottom-border');

    return classes.join(' ');
  };

  private syncAndPropagate() {
    // Implement your existing forceDown / forceUp logic here to maintain tree selection
    this.refreshGrid();
    this.selectionChanged.emit(this.rowData.filter(r => r.isSelected));
  }

  onGridReady(params: GridReadyEvent) { this.gridApi = params.api; }
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
  /* Remove Vertical Column Dividers per Figma */
  .ag-header-cell::after, .ag-cell::after { display: none !important; }
  .ag-row { border-bottom: 1px solid #f2f2f2 !important; }

  /* Blue Sandwich Header */
  .blue-sandwich-parent {
    background-color: #E8F4FD !important;
    border-top: 2px solid #004c97 !important;
  }

  /* Child Row Body */
  .indented-child-row {
    background-color: #ffffff !important;
  }

  /* Blue Sandwich Bottom Border */
  .sandwich-bottom-border {
    border-bottom: 2px solid #004c97 !important;
  }

  /* Custom Checkbox within Cell */
  .custom-checkbox {
    width: 18px; height: 18px;
    border: 1.5px solid #004c97;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    cursor: pointer;
    margin-right: 12px;
    font-size: 10px;
    color: white;
    &.checked { background: #004c97; }
  }

  /* Figma Thin Carrot */
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

  .profile-name-text { font-weight: 600; color: #000; }

  .status-pill {
    background-color: #1e1e1e;
    color: #fff;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }
}
//enc of scss//