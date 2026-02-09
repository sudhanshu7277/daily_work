import { Component, OnInit } from '@angular/common';
import { CommonModule } from '@angular/common';

// 1. Correct Scoped Imports (Matches your package.json)
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
  styleUrls: ['./checker1.component.scss'] // FIXED: Plural and Array
})
export class Checker1Component implements OnInit {
  // 2. Required for @ag-grid-community/core approach
  public modules: Module[] = [ClientSideRowModelModule];
  
  public gridApi!: GridApi;
  public rowData: any[] = [];
  public selectedRecord: any = null;

  // 3. Column Definitions
  public columnDefs: ColDef[] = [
    { 
      headerName: '', 
      checkboxSelection: true, 
      width: 50, 
      pinned: 'left' 
    },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'issueName', headerName: 'Issue Name', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'ddaAccount', headerName: 'DDA Account', filter: 'agTextColumnFilter' },
    { field: 'account', headerName: 'Account' },
    { field: 'valueDate', headerName: 'Value Date', filter: 'agDateColumnFilter' },
    { field: 'ccy', headerName: 'CCY', width: 80 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      valueFormatter: params => params.value?.toLocaleString() 
    }
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
  };

  constructor() {}

  ngOnInit(): void {
    // Mock data for the dev environment
    this.rowData = [
      { id: 1001, issueName: 'Equity Settlement #99', ddaAccount: 'DDA-77000', account: '4455-001', valueDate: '02/10/2026', ccy: 'USD', amount: 55600 },
      { id: 1002, issueName: 'Fixed Income #45', ddaAccount: 'DDA-77001', account: '4455-002', valueDate: '02/11/2026', ccy: 'CAD', amount: 1200 }
    ];
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    const selectedRows = this.gridApi.getSelectedRows();
    // 4. Enables the "Authorize" button when a row is checked
    this.selectedRecord = selectedRows.length > 0 ? selectedRows[0] : null;
  }

  onAuthorizeSelected(): void {
    if (this.selectedRecord) {
      console.log('Authorizing record:', this.selectedRecord);
      // Integration logic goes here
      this.gridApi.deselectAll();
      this.selectedRecord = null;
    }
  }
}