import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColDef } from 'ag-grid-community';
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
  rowData: any[] = [];
  pageSize = 10;
  private allData: any[] = []; // keeps the full nested tree

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 200,
      pinned: 'left',
      cellStyle: (params: any) => ({
        'padding-left': `${(params.data?.level || 0) * 32}px !important`
      })
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const level = params.data.level ?? 0;
        const chevron = params.data.isParent 
          ? (params.data.isExpanded ? '▲' : '▼') 
          : '';
        return `<span style="padding-left: ${level * 32}px; display: flex; align-items: center; font-weight: 600; cursor: pointer;">${chevron} ${params.value}</span>`;
      }
    },
    { headerName: 'Proxy OCIF ID', field: 'ocifId', sortable: true },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      cellRenderer: (params: any) => params.value === 'LEGAL HOLD' 
        ? '<span class="status-pill">LEGAL HOLD</span>' 
        : (params.value || 'N/A')
    },
    { headerName: 'Legal Hold Name', field: 'holdName' },
    { headerName: 'Customer Lifecycle Status', field: 'lifecycle' },
    { headerName: 'Role Type', field: 'role' },
    { headerName: 'Address', field: 'address' }
  ];

  constructor(private legalHoldDataService: LegalHoldDataService) {}

  ngOnInit() {

    this.allData = this.legalHoldDataService.getMockData();
    this.assignLevels(this.allData);
    this.rowData = this.buildVisibleRows(this.allData);
  }

  private assignLevels(data: any[], level = 0) {
    data.forEach(item => {
      item.level = level;
      item.isSelected = false;           // ← for hierarchical selection
      item.isExpanded = item.isExpanded ?? false;
      if (item.children?.length) {
        this.assignLevels(item.children, level + 1);
      }
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

 onGridReady(params: any) {
    this.gridApi = params.api;
  }

 onCellClicked(params: any) {
    if (params.colDef.field === 'profileName' && params.data?.isParent) {
      params.data.isExpanded = !params.data.isExpanded;
      this.rowData = this.buildVisibleRows(this.allData);
      this.gridApi.setRowData(this.rowData);
    }
  }

  public getRowClass = (params: any) => params.data?.level > 0 ? 'indented-child-row' : '';

 onSelectionChanged() {
    if (this.selectionInProgress) return;
    this.selectionInProgress = true;

    this.syncAndPropagate();

    this.selectionInProgress = false;
    this.selectionChanged.emit(this.gridApi.getSelectedRows());
  }


  private syncAndPropagate() {
    // 1. Sync current grid selection to our data model
    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) item.isSelected = node.isSelected();
    });

    // 2. Force down (parent selected → all kids)
    this.forceDown(this.allData);

    // 3. Force up (any kid selected → parent selected)
    this.forceUp(this.allData);

    // 4. Rebuild visible rows + re-apply selection to grid
    this.rowData = this.buildVisibleRows(this.allData);
    this.gridApi.setRowData(this.rowData);

    this.gridApi.forEachNode((node: any) => {
      const item = this.findItemByOcifId(this.allData, node.data.ocifId);
      if (item) node.setSelected(item.isSelected, false);
    });
  }

  private findItemByOcifId(data: any[], ocifId: string): any {
    for (const item of data) {
      if (item.ocifId === ocifId) return item;
      if (item.children) {
        const found = this.findItemByOcifId(item.children, ocifId);
        if (found) return found;
      }
    }
    return null;
  }

  private forceDown(data: any[]) {
    data.forEach(item => {
      if (item.isParent && item.isSelected) {
        this.propagateDown(item.children || [], true);
      }
    });
  }

  private propagateDown(children: any[], selected: boolean) {
    children.forEach(child => {
      child.isSelected = selected;
      if (child.isParent) this.propagateDown(child.children || [], selected);
    });
  }


  private forceUp(data: any[]) {
    data.forEach(item => {
      if (item.isParent) {
        item.isSelected = this.hasAnyDescendantSelected(item);
      }
    });
  }


  private hasAnyDescendantSelected(item: any): boolean {
    if (!item.children?.length) return item.isSelected;
    return item.children.some((child: any) =>
      child.isSelected || this.hasAnyDescendantSelected(child)
    );
  }
}


 onPaginationChanged() { this.updatePaginationInfo(); }
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
    this.pageSize = newSize;
    this.gridApi.setGridOption('paginationPageSize', newSize);
  }

  onRowGroupOpened(params: any) {
    if (params.node && params.node.data) {
      params.node.data.isGroupOpen = params.node.expanded;
    }
    params.api.refreshCells({ rowNodes: [params.node], force: true });
  }

  public getRowClass = (params: any) => {
    const classes: string[] = [];
    if (params.data?.isParent && params.data.isExpanded) classes.push('blue-sandwich-parent');
    if (params.data?.isChild) {
      classes.push('sandwich-child-row');
      const rowIndex = params.node.rowIndex;
      const nextNode = params.api.getDisplayedRowAtIndex(rowIndex + 1);
      if (!nextNode || (nextNode.data && nextNode.data.isParent)) {
        classes.push('sandwich-bottom-border');
      }
    }
    return classes.join(' ');
  };
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
    (paginationChanged)="onPaginationChanged()">
  </ag-grid-angular>
</div>

// end of html//

//scss code //

::ng-deep .ag-theme-alpine.bmo-grid {
  .status-pill {
    background-color: #1e1e1e;
    color: #ffffff;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .indented-child-row {
    background-color: #f0f7ff !important;
    border-bottom: 1px solid #e5e5e5 !important;
  }

  .ag-cell[col-id="profileName"] {
    white-space: nowrap !important;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Chevrons match Figma size & weight */
  .ag-cell[col-id="profileName"] span {
    font-size: 14px;
    line-height: 1;
  }
}

/* === HIERARCHY STYLING FOR INDENTED RECORDS === */
.ag-theme-alpine.bmo-grid .sandwich-child-row {
  background-color: #f0f7ff !important;     /* light blue bg for all indented children */
  border-bottom: 1px solid #e5e5e5 !important; /* light grey border */
  position: relative;
}

.ag-theme-alpine.bmo-grid .sandwich-child-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #d0e6ff; /* subtle blue left accent for indent feel */
}

.ag-theme-alpine.bmo-grid .blue-sandwich-parent {
  background-color: #f8fbff !important;     /* very light blue tint on expanded parents */
  border-bottom: 1px solid #e5e5e5 !important;
}

/* Last child gets extra clean bottom border */
.ag-theme-alpine.bmo-grid .sandwich-bottom-border {
  border-bottom: 1px solid #d1d1d1 !important;
}

//enc of scss//