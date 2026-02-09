import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Scoped ag-Grid Imports (v29.2.0 compatible)
import { AgGridModule } from '@ag-grid-community/angular';
import { 
  GridApi, 
  GridReadyEvent, 
  SelectionChangedEvent, 
  ColDef, 
  Module 
} from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.scss']
})
export class Checker1Component implements OnInit {
  // Required for @ag-grid-community scoped packages
  public modules: Module[] = [ClientSideRowModelModule];
  
  public gridApi!: GridApi;
  public selectedRecord: any = null;
  public rowData: any[] = [];

  // Default Column Behavior
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  public columnDefs: ColDef[] = [
    { 
      headerName: '', 
      checkboxSelection: true, 
      width: 50, 
      pinned: 'left',
      headerCheckboxSelection: false 
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'issueName', headerName: 'Issue Name', flex: 1 },
    { field: 'ddaAccount', headerName: 'DDA Account', width: 150 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 150,
      valueFormatter: p => p.value ? p.value.toLocaleString() : '0' 
    }
  ];

  ngOnInit() {
    this.rowData = [
      { id: 101, issueName: 'Equity Settlement A', ddaAccount: 'DDA-77000', amount: 550987979 },
      { id: 102, issueName: 'Fixed Income B', ddaAccount: 'DDA-77001', amount: 1200 },
      { id: 103, issueName: 'Trade Ref #9928', ddaAccount: 'DDA-77005', amount: 45000 }
    ];
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    // Ensures columns fill the available width on load
    this.gridApi.sizeColumnsToFit();
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    // Captures the first selected row data
    const selectedRows = this.gridApi.getSelectedRows();
    this.selectedRecord = selectedRows.length > 0 ? selectedRows[0] : null;
  }

  onAuthorize() {
    if (this.selectedRecord) {
      // Logic for authorization
      console.log('Authorizing:', this.selectedRecord);
      this.gridApi.deselectAll();
      this.selectedRecord = null;
    }
  }

  onQuickFilterChanged(event: any) {
    this.gridApi.setQuickFilter(event.target.value);
  }
}