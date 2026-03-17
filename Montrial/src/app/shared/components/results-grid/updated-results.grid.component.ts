import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';
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
    CommonModule, FormsModule, AgGridAngular, MatFormFieldModule,
    MatSelectModule, MatIconModule, MatButtonModule, TranslateModule
  ],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();

  private gridApi!: GridApi;
  showChipsSection: boolean = false;
  allMockData: any;
  rowData: any[] = [];
  selectedFilterIds: any[] = [];
  selectionInProgress = false;
  public selectedRowsData: any[] = [];
  public totalResults = 0;
  public currentPage = 1;
  public totalPages = 1;
  public pageSize = 10;
  public displayRowsForPanel: any[] = [];

  public rowClassRules = {
    'expanded-parent-row': (params: any) => params.data.isParent && params.data.isExpanded,
    'last-child-row': (params: any) => {
      if (params.data.isChild) return false;
      const parent = this.allMockData.find((p: any) => p.children?.some((c: any) => c.ocifId === params.data.ocifId));
      return !!(parent && parent.isExpanded &&
        parent.children[parent.children.length - 1].ocifId === params.data.ocifId);
    }
  };

  public noRowsTemplate = '<span>No results to display. Please perform a search.</span>';
  public loadingTemplate = '<span class="ag-overlay-loading-center">Searching profiles...</span>';

  columnDefs: ColDef[] = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
      cellRenderer: (params: any) => params.data.isChild ? '' : null
    },
    {
      headerName: 'Profile Name',
      field: 'profileName',
      sortable: true,
      cellStyle: (params: any) => ({
        'padding-left': `${(params.data?.level || 0) * 32}px !important`
      }),
      // Your existing chevron logic stays untouched — indentation is added on top
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        const chevron = params.data.isParent 
          ? (params.node.expanded ? '▲' : '▼') 
          : '';
        return `<span style="display:flex;align-items:center;">${chevron} ${params.value || params.data.profileName}</span>`;
      }
    },
    { headerName: 'Proxy OCIF ID', field: 'ocifId', sortable: true },
    {
      headerName: 'Legal Hold Status',
      field: 'legalHoldStatus',
      sortable: true,
      cellRenderer: (params: any) => {
        if (params.value === 'LEGAL HOLD') {
          return '<span class="status-pill-blue">LEGAL HOLD</span>';
        }
        return params.value || 'N/A';
      }
    },
    { headerName: 'Legal Hold Name', field: 'legalHoldName' },
    { headerName: 'Customer Lifecycle Status', field: 'customerLifecycleStatus' },
    { headerName: 'Role Type', field: 'roleType' },
    { headerName: 'Address', field: 'address' }
  ];

  constructor(private legalHoldDataService: LegalHoldDataService) {}

  ngOnInit() {
    this.loadMockData();
  }

  private loadMockData() {
    this.allMockData = this.legalHoldDataService.getMockData(); // your existing service call
    this.assignLevels(this.allMockData); // ← DYNAMIC INDENTATION MAGIC
    this.rowData = [...this.allMockData];
  }

  private assignLevels(data: any[], level: number = 0) {
    data.forEach(item => {
      item.level = level;
      if (item.children?.length) this.assignLevels(item.children, level + 1);
    });
  }

  // === YOUR EXISTING METHODS (100% untouched) ===
  toggleRowExpansion(parent: any) {
    this.gridApi.setGridOption('rowData', [...this.rowData]);
    this.gridApi.forEachNode((node: any) => {
      if (node.data.ocifId === parent.ocifId) node.setExpanded(!node.expanded);
    });
  }

  private findParentNode(childNode: any): any {
    let foundParent = null;
    this.gridApi.forEachNode((node: any) => {
      if (node.data?.isParent && node.data.children?.some((c: any) => c.ocifId === childNode.data.ocifId)) {
        foundParent = node;
      }
    });
    return foundParent;
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

  // === NEW HIERARCHICAL SELECTION (exactly what you asked for) ===
  onSelectionChanged() {
    if (this.selectionInProgress) return;
    this.selectionInProgress = true;

    try {
      this.gridApi.forEachNode((node: any) => {
        if (node.isSelected()) {
          if (node.data.isParent) this.propagateSelectionToDescendants(node, true);
          this.propagateSelectionToAncestors(node, true);
        } else if (node.data.isParent) {
          this.propagateSelectionToDescendants(node, false);
        }
      });

      this.selectedRowsData = this.gridApi.getSelectedRows();
      this.selectionChanged.emit(this.selectedRowsData);
    } finally {
      this.selectionInProgress = false;
    }
  }

  private propagateSelectionToDescendants(parentNode: any, selected: boolean) {
    this.gridApi.forEachNode((node: any) => {
      if (node !== parentNode && this.isDescendant(node.data, parentNode.data)) {
        node.setSelected(selected, false);
      }
    });
  }

  private isDescendant(childData: any, parentData: any): boolean {
    if (!parentData.children) return false;
    for (const c of parentData.children) {
      if (c.ocifId === childData.ocifId || this.isDescendant(childData, c)) return true;
    }
    return false;
  }

  private propagateSelectionToAncestors(node: any, selected: boolean) {
    let parentNode = this.findParentNode(node);
    while (parentNode) {
      if (selected) parentNode.setSelected(true, false);
      parentNode = this.findParentNode(parentNode);
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
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
    (paginationChanged)="onPaginationChanged()">
  </ag-grid-angular>
</div>

// end of html//

//scss code //

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