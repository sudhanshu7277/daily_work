import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-results-grid',
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent implements OnInit {
  private gridApi!: GridApi;
  private isSyncing = false; // Guard to prevent infinite loops
  public rowData: any[] = [];
  private masterData = MOCK_RECURSIVE_DATA;

  public columnDefs: ColDef[] = [
    { field: 'select', checkboxSelection: true, headerCheckboxSelection: true, width: 50, pinned: 'left' },
    {
      field: 'profileName',
      headerName: 'Profile Name',
      minWidth: 450,
      cellRenderer: (params: any) => this.profileNameRenderer(params)
    },
    { field: 'legalHoldStatus', headerName: 'Legal Hold Status' }
  ];

  ngOnInit() {
    this.refreshGrid();
  }

  // --- RECURSIVE ENGINE: Flattens the tree for the grid display ---
  private flatten(data: any[]): any[] {
    let result: any[] = [];
    data.forEach(item => {
      result.push(item);
      if (item.isParent && item.isExpanded && item.children) {
        result = [...result, ...this.flatten(item.children)];
      }
    });
    return result;
  }

  refreshGrid() {
    this.rowData = this.flatten(this.masterData);
    if (this.gridApi) this.gridApi.setRowData([...this.rowData]);
  }

  // --- FIGMA UI: Indentation & Depth Lines ---
  private profileNameRenderer(params: any) {
    const { level, isParent, isExpanded, profileName } = params.data;
    const indent = (level || 0) * 24;
    
    let depthLines = '';
    for (let i = 1; i <= (level || 0); i++) {
      depthLines += `<div class="depth-line" style="left: ${(i * 24) - 12}px"></div>`;
    }

    const chevron = isParent 
      ? `<span class="bmo-thin-carrot ${isExpanded ? 'up' : 'down'}"></span>` 
      : '<span class="spacer"></span>';

    return `
      <div class="name-cell-wrapper" style="padding-left: ${indent}px">
        ${depthLines}
        <span class="profile-text">${profileName}</span>
        ${chevron}
      </div>
    `;
  }

  // --- RECURSIVE SELECTION: Select All Children + Auto-Select Parent ---
  onSelectionChanged() {
    if (this.isSyncing || !this.gridApi) return;
    this.isSyncing = true;

    this.gridApi.forEachNode((node) => {
      if (node.data.children && node.data.children.length > 0) {
        const childNodes = node.data.children
          .map((c: any) => this.gridApi.getRowNode(c.ocifId))
          .filter((n: any) => n != null);

        if (childNodes.length === 0) return;
        const allSelected = childNodes.every(n => n.isSelected());

        if (node.isSelected() && !allSelected) {
          childNodes.forEach(n => n.setSelected(true, false));
        } else if (allSelected && !node.isSelected()) {
          node.setSelected(true, false);
        } else if (!allSelected && node.isSelected()) {
          node.setSelected(false, false);
        }
      }
    });

    this.isSyncing = false;
  }

  // --- BLUE SANDWICH CLASS RULES ---
  public getRowClass = (params: any) => {
    const { level, isParent, isExpanded } = params.data;
    const classes = [];

    if (level === 0 && isParent && isExpanded) classes.push('blue-sandwich-parent');
    if (level > 0) classes.push('is-child-row');

    const next = this.gridApi?.getDisplayedRowAtIndex(params.node.rowIndex + 1);
    const isLast = !next || next.data.level < level || (level > 0 && next.data.level === 0);

    if (level > 0 && isLast) classes.push('sandwich-bottom-border');
    
    return classes.join(' ');
  };

  onCellClicked(params: any) {
    if (params.colDef?.field === 'profileName' && params.data.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.refreshGrid();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.refreshGrid();
  }
}


////// X BUTTON STYLES

::ng-deep .ag-theme-alpine.bmo-grid {
  /* FIGMA: Level 0 Expanded Parent */
  .ag-row.blue-sandwich-parent {
    background-color: #E8F4FD !important;
    border-top: 2px solid #004c97 !important;
    z-index: 10;
  }

  /* FIGMA: Level 1+ Child Rows */
  .ag-row.is-child-row {
    background-color: #ffffff !important;
    border-top: none !important;

    .name-cell-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .depth-line {
        position: absolute;
        top: 0; bottom: 0; width: 1px;
        background-color: #E0E0E0; /* Vertical depth guide */
      }
    }
  }

  /* FIGMA: Closing the Sandwich Cluster */
  .ag-row.sandwich-bottom-border {
    border-bottom: 2px solid #004c97 !important;
  }

  /* DARK BLUE THIN CARROT */
  .bmo-thin-carrot {
    width: 8px; height: 8px;
    border-top: 1.5px solid #004c97;
    border-right: 1.5px solid #004c97;
    display: inline-block;
    margin-left: 10px;
    transition: transform 0.2s;
    &.down { transform: rotate(135deg); }
    &.up { transform: rotate(-45deg); margin-top: 5px; }
  }

  .ag-checkbox-input-wrapper.ag-checked::after { color: #004c97 !important; }
}
  // CLOSE ICON HTML 

<div class="pill-container">
  <div class="close-circle">
    <span class="x-symbol">×</span>
  </div>
</div>

&times; (×)