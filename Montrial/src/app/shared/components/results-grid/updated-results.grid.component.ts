// results-grid.component.ts
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  // Ensure this points to your LegalHoldDataService.mockData
  public allMockData: any[] = []; 

  constructor(private sanitizer: DomSanitizer) {}

  public columnDefs: ColDef[] = [
    { 
      headerName: '', 
      checkboxSelection: true, 
      headerCheckboxSelection: true, 
      width: 50, 
      pinned: 'left',
      cellRenderer: (params: any) => params.data.isChild ? '' : null 
    },
    {
      field: 'profileName',
      headerName: 'Profile Name',
      width: 350,
      pinned: 'left',
      cellRenderer: (params: any) => this.profileNameRenderer(params)
    },
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    { 
      field: 'legalHoldStatus', 
      headerName: 'Legal Hold Status',
      cellRenderer: (params: any) => this.legalHoldStatusRenderer(params)
    }
    // ... rest of your columns (Address, Role, etc.)
  ];

  // --- THE ENGINE: Recursive Flattening for Pagination ---
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

  public refreshGrid() {
    this.rowData = [...this.flatten(this.allMockData)];
    if (this.gridApi) {
      // Latest AG Grid uses setGridOption for rowData
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  // --- THE UI: Sanitized Multi-Level Renderer ---
  private profileNameRenderer(params: any): SafeHtml {
    const { level, isParent, isExpanded, isChild } = params.data;
    const indent = (level || 0) * 24;
    
    // Figma Vertical Depth Lines
    let depthLines = '';
    for (let i = 1; i <= (level || 0); i++) {
      depthLines += `<div class="depth-line" style="left: ${(i * 24) - 12}px"></div>`;
    }

    const carrot = isParent 
      ? `<span class="bmo-thin-carrot ${isExpanded ? 'up' : 'down'}"></span>` 
      : '';

    const html = `
      <div class="name-cell-wrapper" style="padding-left: ${indent}px">
        ${depthLines}
        <span class="${isChild ? 'grid-child-text' : 'grid-parent-text'}">${params.value}</span>
        ${carrot}
      </div>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private legalHoldStatusRenderer(params: any): SafeHtml {
    const val = params.value || 'N/A';
    if (val === 'LEGAL HOLD') {
      return this.sanitizer.bypassSecurityTrustHtml(`
        <div class="status-badge-container">
          <span class="status-pill-badge-legal-hold">LEGAL HOLD</span>
        </div>`);
    }
    return val;
  }

  // --- THE LOGIC: Recursive Cluster Selection ---
  onSelectionChanged() {
    if (this.isSyncing || !this.gridApi) return;
    this.isSyncing = true;

    this.gridApi.forEachNode((node: RowNode) => {
      const data = node.data;
      if (data.children && data.children.length > 0) {
        const childNodes = data.children
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

  public getRowClass = (params: any) => {
    const { level, isParent, isExpanded, isChild } = params.data;
    const classes = [];

    if (level === 0 && isParent && isExpanded) classes.push('blue-sandwich-parent');
    if (isChild) classes.push('sandwich-child-row');

    // Closure logic: Find the last item in the expanded cluster
    const nextNode = this.gridApi?.getDisplayedRowAtIndex(params.node.rowIndex + 1);
    const isLast = !nextNode || nextNode.data.level < level || (level > 0 && nextNode.data.level === 0);

    if (level > 0 && isLast) classes.push('sandwich-bottom-border');
    
    return classes.join(' ');
  };

  onCellClicked(params: any) {
    if (params.colDef.field === 'profileName' && params.data.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.refreshGrid();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.refreshGrid();
  }
}

////// scss code below

::ng-deep .bmo-grid {
  /* THE BLUE SANDWICH TOP */
  .ag-row.blue-sandwich-parent {
    background-color: #E8F4FD !important;
    border-top: 2px solid #004c97 !important;
    z-index: 10;
  }

  /* CHILD ROWS & DEPTH TRACKERS */
  .ag-row.sandwich-child-row {
    background-color: #ffffff !important;
    .name-cell-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      .depth-line {
        position: absolute;
        top: 0; bottom: 0; width: 1px;
        background-color: #E0E0E0; /* Grey tracker line */
      }
    }
  }

  /* THE BLUE SANDWICH BOTTOM */
  .ag-row.sandwich-bottom-border {
    border-bottom: 2px solid #004c97 !important;
  }

  /* FIGMA THIN CARROT */
  .bmo-thin-carrot {
    width: 7px; height: 7px;
    border-top: 1.5px solid #004c97;
    border-right: 1.5px solid #004c97;
    display: inline-block;
    transition: 0.2s ease;
    margin-left: 10px;
    &.down { transform: rotate(135deg); }
    &.up { transform: rotate(-45deg); margin-top: 4px; }
  }

  .ag-checkbox-input-wrapper.ag-checked::after { color: #004c97 !important; }
}


.npmrc details

registry=https://bmostaging.jfrog.io/artifactory/api/npm/BMOHC-NPM-Engineering-Virtual/
strict-ssl=false

# Authentication - Replace THE_TOKEN_BELOW with your actual Identity Token from JFrog
//bmostaging.jfrog.io/artifactory/api/npm/BMOHC-NPM-Engineering-Virtual/:_authToken=THE_TOKEN_BELOW

# Proxy settings (based on your internal configuration)
proxy=http://sjain70:Up32dt72779511@@EBCSWG.bmogc.net:8080
https-proxy=http://sjain70:Up32dt72779511@@EBCSWG.bmogc.net:8080