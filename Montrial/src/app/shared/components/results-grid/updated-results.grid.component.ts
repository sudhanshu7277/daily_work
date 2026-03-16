import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, RowNode } from 'ag-grid-community';

@Component({
  selector: 'app-results-grid',
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent implements OnInit {
  private gridApi!: GridApi;
  private isSyncing = false;
  
  public rowData: any[] = [];
  public allMockData: any[] = []; // Source tree from your service
  public selectedRowsData: any[] = [];

  @Output() selectionChanged = new EventEmitter<any[]>();

  public columnDefs: ColDef[] = [
    { 
      headerName: '', 
      checkboxSelection: true, 
      headerCheckboxSelection: true, 
      width: 50, 
      pinned: 'left',
      // Figma: Only show checkboxes for root level (Level 0)
      cellRenderer: (params: any) => params.data?.level === 0 ? null : '' 
    },
    {
      field: 'profileName',
      headerName: 'Profile Name',
      minWidth: 450,
      pinned: 'left',
      cellRenderer: (params: any) => this.profileNameRenderer(params)
    },
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    { field: 'legalHoldStatus', headerName: 'Status', width: 150 },
    { field: 'lifecycle', headerName: 'Lifecycle', width: 150 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  ngOnInit() {
    this.refreshGrid();
  }

  // --- RECURSIVE ENGINE: Supports n-levels ---
  private flattenData(data: any[], level: number = 0): any[] {
    if (!data || !Array.isArray(data)) return [];
    let result: any[] = [];

    data.forEach(item => {
      item.level = level; 
      result.push(item);

      // If item has children and is expanded, unroll next level
      if (item.children?.length > 0 && item.isExpanded) {
        result = [...result, ...this.flattenData(item.children, level + 1)];
      }
    });
    return result;
  }

  public refreshGrid() {
    this.rowData = [...this.flattenData(this.allMockData)];
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  // --- FIGMA RENDERER: Dynamic Indent + Guide Lines ---
  private profileNameRenderer(params: any): string {
    if (!params.data) return '';
    const { level, isExpanded, children } = params.data;
    const hasChildren = children?.length > 0;
    
    const indent = (level || 0) * 24; // 24px per Figma
    
    // Generate vertical guide lines for nested hierarchy
    let depthLines = '';
    for (let i = 1; i <= (level || 0); i++) {
      depthLines += `<div class="depth-line" style="left: ${(i * 24) - 12}px;"></div>`;
    }

    const chevron = hasChildren 
      ? `<span class="bmo-thin-carrot ${isExpanded ? 'up' : 'down'}"></span>` 
      : '';

    return `
      <div class="name-cell-wrapper" style="padding-left: ${indent}px">
        ${depthLines}
        <span class="${level === 0 ? 'grid-parent-text' : 'grid-child-text'}">${params.value || ''}</span>
        ${chevron}
      </div>
    `;
  }

  // --- SELECTION SYNC: Recursive across all levels ---
  onSelectionChanged() {
    if (this.isSyncing || !this.gridApi) return;
    this.isSyncing = true;

    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedIds = new Set(selectedNodes.map(n => n.data.ocifId));

    this.allMockData.forEach(root => {
      this.syncSelectionRecursive(root, selectedIds.has(root.ocifId));
    });
    
    this.selectedRowsData = this.getSelectedRowsFromTree(this.allMockData);
    this.selectionChanged.emit(this.selectedRowsData);
    this.isSyncing = false;
  }

  private syncSelectionRecursive(node: any, isSelected: boolean) {
    node.selected = isSelected;
    if (node.children) {
      node.children.forEach((child: any) => {
        this.syncSelectionRecursive(child, isSelected);
        const gridNode = this.gridApi.getRowNode(child.ocifId);
        if (gridNode) {
          gridNode.setSelected(isSelected, false);
        }
      });
    }
  }

  private getSelectedRowsFromTree(data: any[]): any[] {
    let selected: any[] = [];
    data.forEach(item => {
      if (item.selected) selected.push(item);
      if (item.children) {
        selected = [...selected, ...this.getSelectedRowsFromTree(item.children)];
      }
    });
    return selected;
  }

  // --- VISUAL: Blue Sandwich Classes ---
  public getRowClass = (params: any) => {
    if (!params.data) return '';
    const { level, isExpanded, children } = params.data;
    const classes = [];

    // Expanded Level 0 gets the Thick Blue Top
    if (level === 0 && children?.length > 0 && isExpanded) {
      classes.push('blue-sandwich-parent');
    }

    // Nested rows (L1+) get white background
    if (level > 0) {
      classes.push('sandwich-child-row');
    }

    // Border Closure Logic
    // const next = this.gridApi?.getDisplayedRowAtIndex(params.node.rowIndex + 1);
    const next = params.api.getDisplayedRowAtIndex(params.node.rowIndex + 1);
    const isEndOfCluster = level > 0 && (!next || next.data.level === 0 || next.data.level < level);
    
    if (isEndOfCluster) {
      classes.push('sandwich-bottom-border');
    }

    return classes.join(' ');
  };

  onCellClicked(params: any) {
    if (params.colDef.field === 'profileName' && params.data.children?.length > 0) {
      params.data.isExpanded = !params.data.isExpanded;
      this.refreshGrid();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.refreshGrid();
  }
}



/// scss code below////


::ng-deep .bmo-grid {
  /* FIGMA: 2px Dark Blue Header */
  .ag-row.blue-sandwich-parent {
    background-color: #E8F4FD !important;
    border-top: 2px solid #004c97 !important;
    z-index: 10;
  }

  /* FIGMA: Guide Line Container */
  .name-cell-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    
    .depth-line {
      position: absolute;
      top: 0; bottom: 0; width: 1px;
      background-color: #E0E0E0; // Grey Guide Line
    }
  }

  /* FIGMA: Body Background */
  .ag-row.sandwich-child-row {
    background-color: #ffffff !important;
    border-top: none !important;
  }

  /* FIGMA: 2px Dark Blue Bottom Border Closure */
  .ag-row.sandwich-bottom-border {
    border-bottom: 2px solid #004c97 !important;
  }

  /* FIGMA: Thin Dark Blue Carrot (Chevron) */
  .bmo-thin-carrot {
    width: 8px; height: 8px;
    border-top: 1.5px solid #004c97;
    border-right: 1.5px solid #004c97;
    display: inline-block;
    transition: transform 0.2s ease;
    margin-left: 10px;
    &.down { transform: rotate(135deg); }
    &.up { transform: rotate(-45deg); margin-top: 4px; }
  }

  .grid-parent-text { font-weight: 600; color: #000; }
  .grid-child-text { font-weight: 400; color: #333; }
  .ag-checkbox-input-wrapper.ag-checked::after { color: #004c97 !important; }
}

// end of scss code //