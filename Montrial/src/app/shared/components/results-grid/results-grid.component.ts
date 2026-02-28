import { Component, EventEmitter, Output, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss'],
  encapsulation: ViewEncapsulation.None // Essential for overriding Ag-Grid internal borders
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();

  private gridApi!: GridApi;
  public rowData: any[] = [];
  public selectedRowsData: any[] = [];
  
  public rowClassRules = {
    'expanded-parent-row': (params: any) => params.data.isParent && params.data.isExpanded,
    'last-child-row': (params: any) => {
      if (!params.data.isChild) return false;
      const parent = this.rowData.find(p => p.isParent && p.children?.some((c: any) => c.ocifId === params.data.ocifId));
      return !!(parent?.isExpanded && parent.children[parent.children.length - 1].ocifId === params.data.ocifId);
    }
  };

  columnDefs: ColDef[] = [
    { 
      headerName: '', checkboxSelection: true, width: 50, pinned: 'left',
      cellRenderer: (params: any) => params.data.isChild ? '' : null 
    },
    { 
      field: 'legalName', 
      headerName: 'Profile Name', 
      width: 350, 
      pinned: 'left',
      sortable: true,
      headerClass: 'profile-name-header', // For the vertical line
      cellClass: 'profile-name-cell',   // For the vertical line
      cellRenderer: (params: any) => {
        const data = params.data;
        const textClass = data.isChild ? 'grid-child-text' : 'grid-parent-text';
        const carrotHtml = data.isParent ? `<span class="bmo-thin-carrot ${data.isExpanded ? 'up' : 'down'}"></span>` : '';
        return `<div class="name-cell-wrapper"><span class="${textClass}">${params.value}</span>${carrotHtml}</div>`;
      },
      onCellClicked: (params: any) => { if (params.data.isParent) this.toggleRowExpansion(params.data); }
    },
    { field: 'ocifId', headerName: 'OCIF / Proxy ID', width: 150 },
    { 
      field: 'status', 
      headerName: 'Legal Hold Status', 
      width: 180, 
      sortable: true,
      cellRenderer: (params: any) => params.value === 'LEGAL HOLD' ? 
        `<div class="status-badge-container"><span class="status-pill-badge">LEGAL HOLD</span></div>` : 
        `<span class="na-text">N/A</span>`
    },
    { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
    { field: 'lifecycle', headerName: 'Customer Lifecycle Status', width: 220 },
    { field: 'role', headerName: 'Role Type', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 } // Flex ensures it fills the remaining width
  ];

  ngOnInit() {
    this.generateMockData();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    
    // Watch for window resize to maintain full width
    window.addEventListener('resize', () => {
      setTimeout(() => this.gridApi?.sizeColumnsToFit(), 100);
    });
  }

  toggleRowExpansion(parent: any) {
    parent.isExpanded = !parent.isExpanded;
    if (parent.isExpanded) {
      const idx = this.rowData.indexOf(parent);
      this.rowData.splice(idx + 1, 0, ...parent.children);
    } else {
      this.rowData = this.rowData.filter(r => !parent.children.includes(r));
    }
    this.gridApi.setGridOption('rowData', [...this.rowData]);
  }

  private generateMockData() {
    this.rowData = [
      {
        ocifId: 'OCIF-9921',
        legalName: 'BMO Global Asset Management',
        status: 'LEGAL HOLD',
        holdName: 'Project North Star',
        lifecycle: 'Active - Retention',
        role: 'Custodian',
        address: '100 King St W, Toronto',
        isParent: true,
        isExpanded: false,
        children: [
          { ocifId: 'CH-9921-A', legalName: 'GAM Alpha Sub-Fund', isChild: true, status: 'N/A' },
          { ocifId: 'CH-9921-B', legalName: 'GAM Beta Sub-Fund', isChild: true, status: 'LEGAL HOLD' }
        ]
      },
      {
        ocifId: 'OCIF-4412',
        legalName: 'Capital One Financial Corp',
        status: 'N/A',
        isParent: false,
        address: 'McLean, Virginia'
      }
    ];
  }

  onSelectionChanged() {
    const nodes = this.gridApi.getSelectedNodes();
    this.selectedRowsData = nodes.map(n => n.data);
    this.selectionChanged.emit(this.selectedRowsData);
  }
}