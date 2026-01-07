import { Component, OnInit } from '@angular/core';
import { Checker1Service, PaymentRecord } from './checker1.service';
import { ColDef, GridApi, GridReadyEvent, RowSelectedEvent } from 'ag-grid-community';

@Component({
  selector: 'app-checker1',
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.css']
})
export class Checker1Component implements OnInit {

  columnDefs: ColDef[] = [];
  rowData: PaymentRecord[] = [];
  allRowData: PaymentRecord[] = []; // preserve all rows for filtering
  gridApi!: GridApi;

  filterPaymentDate: string = '';
  filterEventValueDate: string = '';
  filterCurrency: string = 'All';

  selectedRecord: PaymentRecord | null = null;
  isAuthorizeEnabled = false;

  modalOpen = false;
  modalRecord!: PaymentRecord;

  constructor(private service: Checker1Service) {}

  ngOnInit(): void {
    this.setupColumnDefs();
    this.loadData();
  }

  setupColumnDefs() {
    this.columnDefs = [
      { headerName: '', checkboxSelection: true, width: 40, headerCheckboxSelection: true, suppressMenu: true },
      { field: 'ddaAccount', headerName: 'DDA A/C', sortable: true, filter: 'agTextColumnFilter', resizable: true },
      { field: 'accountNumber', headerName: 'Account Number', sortable: true, filter: 'agTextColumnFilter', resizable: true },
      { field: 'eventValueDate', headerName: 'Event Value Date', sortable: true, filter: 'agDateColumnFilter', resizable: true, 
        valueFormatter: this.dateFormatter },
      { field: 'paymentDate', headerName: 'Payment Date', sortable: true, filter: 'agDateColumnFilter', resizable: true,
        valueFormatter: this.dateFormatter },
      { field: 'paymentAmountCurrency', headerName: 'Currency', sortable: true, filter: 'agTextColumnFilter', width: 100, resizable: true },
      { field: 'paymentAmount', headerName: 'Payment Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter },
      { headerName: 'Choice 1', field: 'statusChoice1', width: 80, cellRenderer: this.statusCellRenderer, filter: false },
      { headerName: 'Choice 2', field: 'statusChoice2', width: 80, cellRenderer: this.statusCellRenderer, filter: false },
      { field: 'dolNo', headerName: 'DOL No', sortable: true, filter: 'agTextColumnFilter', resizable: true },
      { field: 'eventBalance', headerName: 'Event Balance', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter },
      { field: 'netPaymentAmount', headerName: 'Net Payment Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter },
      { field: 'realTimeBalance', headerName: 'Real-Time Balance', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter },
      { field: 'usdAmount', headerName: 'USD Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter },
      { field: 'issueName', headerName: 'Issue Name', sortable: true, filter: 'agTextColumnFilter', resizable: true },
      {
        headerName: 'Actions',
        width: 100,
        cellRenderer: (params: any) => {
          const icon = document.createElement('span');
          icon.classList.add('edit-icon');
          icon.title = 'Edit Record';
          icon.innerHTML = '&#9998;';  // Pencil icon
          icon.style.cursor = 'pointer';
          icon.addEventListener('click', () => this.openEditModal(params.data));
          return icon;
        },
        filter: false,
        sortable: false,
        resizable: false
      }
    ];
  }

  loadData() {
    this.service.getPayments().subscribe(data => {
      this.allRowData = data;
      this.rowData = [...this.allRowData];
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onRowSelected(event: RowSelectedEvent) {
    const selectedRows = this.gridApi.getSelectedRows();
    this.isAuthorizeEnabled = selectedRows.length === 1;
    this.selectedRecord = selectedRows.length === 1 ? selectedRows[0] : null;
  }

  openEditModal(data: PaymentRecord) {
    this.modalRecord = JSON.parse(JSON.stringify(data)); // Deep copy to avoid direct mutation
    this.modalOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  closeModal() {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  saveModal() {
    if (!this.modalRecord) return;

    // Find index of record in allRowData and update
    const idx = this.allRowData.findIndex(r => r.id === this.modalRecord.id);
    if (idx !== -1) {
      this.allRowData[idx] = { ...this.modalRecord };
    }

    // Refresh grid with updated data (consider filters)
    this.applyFilters();
    this.closeModal();
  }

  // Status cell renderer for green/red circles
  statusCellRenderer(params: any) {
    const el = document.createElement('span');
    el.classList.add('status-circle');
    el.style.backgroundColor = params.value ? 'green' : 'red';
    return el;
  }

  dateFormatter(params: any) {
    if (!params.value) return '';
    return new Date(params.value).toLocaleDateString();
  }

  currencyFormatter(params: any) {
    if (params.value == null) return '';
    return params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  applyFilters() {
    if (!this.gridApi) return;

    let filteredData = [...this.allRowData];

    if (this.filterPaymentDate) {
      filteredData = filteredData.filter(r =>
        new Date(r.paymentDate).toDateString() === new Date(this.filterPaymentDate).toDateString()
      );
    }
    if (this.filterEventValueDate) {
      filteredData = filteredData.filter(r =>
        new Date(r.eventValueDate).toDateString() === new Date(this.filterEventValueDate).toDateString()
      );
    }
    if (this.filterCurrency && this.filterCurrency !== 'All') {
      filteredData = filteredData.filter(r => r.paymentAmountCurrency === this.filterCurrency);
    }

    // Update grid data
    this.gridApi.setRowData(filteredData);

    // Clear any selection and disable Authorize button
    this.gridApi.deselectAll();
    this.isAuthorizeEnabled = false;
    this.selectedRecord = null;
  }

  clearFilters() {
    this.filterPaymentDate = '';
    this.filterEventValueDate = '';
    this.filterCurrency = 'All';
    if (this.gridApi) {
      this.gridApi.setRowData(this.allRowData);
      this.gridApi.deselectAll();
    }
    this.isAuthorizeEnabled = false;
    this.selectedRecord = null;
  }

  authorizeSelected() {
    if (!this.selectedRecord) return;

    // For demo: mark record as authorized and show alert
    const idx = this.allRowData.findIndex(r => r.id === this.selectedRecord!.id);
    if (idx !== -1) {
      this.allRowData[idx].authorized = true;
    }

    alert(`Record with DDA A/C ${this.selectedRecord.ddaAccount} has been authorized.`);

    this.applyFilters(); // Refresh to update grid
  }
}