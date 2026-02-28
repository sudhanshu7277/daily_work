import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, GridReadyEvent, ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-results-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './results-grid.component.html',
  styleUrls: ['./results-grid.component.scss']
})
export class ResultsGridComponent implements OnInit {
  @Output() selectionChanged = new EventEmitter<any[]>();

  private gridApi!: GridApi;
  public rowData: any[] = [];
  public selectedRowsData: any[] = [];
  private selectionInProgress = false;

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
      field: 'legalName', headerName: 'Profile Name', width: 320, pinned: 'left', 
      sortable: true, unSortIcon: true,
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
      field: 'status', headerName: 'Legal Hold Status', width: 180, sortable: true, unSortIcon: true,
      cellRenderer: (params: any) => params.value === 'LEGAL HOLD' ? 
        `<div class="status-badge-container"><span class="status-pill-badge">LEGAL HOLD</span></div>` : 
        `<span class="na-text">N/A</span>`
    },
    { field: 'holdName', headerName: 'Legal Hold Name', width: 200 },
    { field: 'lifecycle', headerName: 'Customer Lifecycle Status', width: 220 },
    { field: 'role', headerName: 'Role Type', width: 150 },
    { field: 'address', headerName: 'Address', flex: 1 }
  ];

  ngOnInit() {
    this.generateMockData();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
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
          { ocifId: 'CH-9921-A', legalName: 'GAM Alpha Sub-Fund', isChild: true, status: 'N/A', lifecycle: 'Active', role: 'Beneficiary' },
          { ocifId: 'CH-9921-B', legalName: 'GAM Beta Sub-Fund', isChild: true, status: 'LEGAL HOLD', lifecycle: 'Active', role: 'Beneficiary' }
        ]
      },
      {
        ocifId: 'OCIF-4412',
        legalName: 'Capital One Financial Corp',
        status: 'N/A',
        holdName: 'N/A',
        lifecycle: 'Closed',
        role: 'Principal',
        address: '1680 Capital One Dr, McLean',
        isParent: false
      },
      {
        ocifId: 'OCIF-1102',
        legalName: 'Royal Bank of Canada',
        status: 'LEGAL HOLD',
        holdName: 'Project Horizon',
        lifecycle: 'Active',
        role: 'Custodian',
        address: '200 Bay St, Toronto',
        isParent: true,
        isExpanded: false,
        children: [
          { ocifId: 'CH-1102-01', legalName: 'RBC Investor Services', isChild: true, status: 'LEGAL HOLD', lifecycle: 'Active', role: 'Subsidiary' }
        ]
      }
    ];
  }

  onSelectionChanged() {
    if (this.selectionInProgress || !this.gridApi) return;
    this.selectionInProgress = true;
    const selectedNodes = this.gridApi.getSelectedNodes();
    const finalMap = new Map<string, any>();
    selectedNodes.forEach(node => { if (node.data) finalMap.set(node.data.ocifId, node.data); });

    this.gridApi.forEachNode((node: any) => {
      const wasSelected = this.selectedRowsData.some(s => s.ocifId === node.data.ocifId);
      if (node.data.isParent && node.isSelected() && !wasSelected) {
        node.data.children?.forEach((c: any) => finalMap.set(c.ocifId, c));
        this.syncVisibleCheckmarks(node, true);
      } else if (node.data.isParent && !node.isSelected() && wasSelected) {
        node.data.children?.forEach((c: any) => finalMap.delete(c.ocifId));
        this.syncVisibleCheckmarks(node, false);
      }
    });

    this.selectedRowsData = Array.from(finalMap.values());
    this.selectionChanged.emit(this.selectedRowsData);
    this.selectionInProgress = false;
  }

  private syncVisibleCheckmarks(parentNode: any, state: boolean) {
    const ids = parentNode.data.children?.map((c: any) => c.ocifId) || [];
    this.gridApi.forEachNode(node => { if (ids.includes(node.data?.ocifId)) node.setSelected(state, false); });
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
    this.gridApi.forEachNode(node => {
      if (this.selectedRowsData.some(s => s.ocifId === node.data.ocifId)) node.setSelected(true, false);
    });
  }
}