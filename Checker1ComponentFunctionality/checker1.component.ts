import { Component, OnInit, TemplateRef } from '@angular/core';
import { Checker1Service } from './checker1.service';
import { PaymentRecord } from './payment-record.model';
import { ColDef, GridApi, GridReadyEvent, RowSelectedEvent } from 'ag-grid-community';

@Component({
  selector: 'app-checker1',
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.css']
})
export class Checker1Component implements OnInit {

  columnDefs: ColDef[] = [];
  rowData: PaymentRecord[] = [];
  gridApi!: GridApi;

  selectedRecord: PaymentRecord | null = null;

  // Filters bind variables
  filterPaymentDate: string = '';
  filterEventValueDate: string = '';
  filterCurrency: string = '';

  isAuthorizeEnabled: boolean = false;

  modalOpen: boolean = false;
  modalRecord!: PaymentRecord;

  constructor(private service: Checker1Service) {}

  ngOnInit() {
    this.configureColumns();
    this.fetchData();
  }

  configureColumns() {
    this.columnDefs = [
      { headerName: '', checkboxSelection: true, width: 40, headerCheckboxSelection: true, suppressMenu: true },
      { field: 'ddaAccount', headerName: 'DDA A/C', sortable: true, filter: true, resizable: true },
      { field: 'accountNumber', headerName: 'Account Number', sortable: true, filter: true, resizable: true },
      { field: 'eventValueDate', headerName: 'Event Value Date', sortable: true, filter: 'agDateColumnFilter', resizable: true,
        valueFormatter: this.dateFormatter},
      { field: 'paymentDate', headerName: 'Payment Date', sortable: true, filter: 'agDateColumnFilter', resizable: true,
        valueFormatter: this.dateFormatter},
      { field: 'paymentAmountCurrency', headerName: 'Currency', sortable: true, filter: true, resizable: true, width: 100},
      { field: 'paymentAmount', headerName: 'Payment Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter},
      { headerName: 'Choice 1', field: 'statusChoice1', width: 80, cellRenderer: this.statusCellRenderer, filter: false },
      { headerName: 'Choice 2', field: 'statusChoice2', width: 80, cellRenderer: this.statusCellRenderer, filter: false },
      { field: 'dolNo', headerName: 'DOL No', sortable: true, filter: true, resizable: true },
      { field: 'eventBalance', headerName: 'Event Balance', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter},
      { field: 'netPaymentAmount', headerName: 'Net Payment Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter},
      { field: 'realTimeBalance', headerName: 'Real-Time Balance', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter},
      { field: 'usdAmount', headerName: 'USD Amount', sortable: true, filter: 'agNumberColumnFilter', resizable: true,
        valueFormatter: this.currencyFormatter},
      { field: 'issueName', headerName: 'Issue Name', sortable: true, filter: true, resizable: true },
      {
        headerName: 'Actions',
        width: 100,
        cellRenderer: (params: any) => {
          const icon = document.createElement('span');
          icon.classList.add('edit-icon');
          icon.title = 'Edit Record';
          icon.innerHTML = '&#9998;';  // Pencil unicode
          icon.addEventListener('click', () => this.openEditModal(params.data));
          return icon;
        },
        filter: false,
        sortable: false,
        resizable: false
      }
    ];
  }

  fetchData() {
    this.service.getPayments().subscribe(data => {
      this.rowData = data;
      this.applyFilters();  // apply filters initially if any
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
    // Deep clone to avoid on-grid changes until saved
    this.modalRecord = JSON.parse(JSON.stringify(data));
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';  // Prevent background scroll
  }

  closeModal() {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  saveModal() {
    // Update grid row with edited modalRecord values
    if (!this.modalRecord) return;
    const rowNode = this.gridApi.getRowNode(this.modalRecord.id.toString());
    if(rowNode) {
      rowNode.setData(this.modalRecord);
    } else {
      // Find and update in rowData fallback
      const index = this.rowData.findIndex(r => r.id === this.modalRecord.id);
      if (index !== -1) {
        this.rowData[index] = this.modalRecord;
        this.gridApi.setRowData(this.rowData);
      }
    }
    this.closeModal();
  }

  statusCellRenderer(params: any) {
    const isStatusGreen = params.value === true;
    const el = document.createElement('span');
    el.classList.add('status-circle');
    el.style.backgroundColor = isStatusGreen ? 'green' : 'red';
    return el;
  }

  dateFormatter(params: any) {
    if (!params.value) return '';
    const date = new Date(params.value);
    return date.toLocaleDateString();
  }

  currencyFormatter(params: any) {
    if (params.value == null) return '';
    return params.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  // Filter handlers

  applyFilters() {
    if (!this.gridApi) return;

    this.gridApi.setQuickFilter(''); // reset quick filter

    this.gridApi.setFilterModel(null); // clear ag-grid filters

    // Custom filters: Filter by PaymentDate, EventValueDate, Currency manually
    let filtered = this.rowData;

    if (this.filterPaymentDate) {
      filtered = filtered.filter(r =>
        new Date(r.paymentDate).toDateString() === new Date(this.filterPaymentDate).toDateString()
      );
    }
    if (this.filterEventValueDate) {
      filtered = filtered.filter(r =>
        new Date(r.eventValueDate).toDateString() === new Date(this.filterEventValueDate).toDateString()
      );
    }
    if (this.filterCurrency && this.filterCurrency !== 'All') {
      filtered = filtered.filter(r => r.paymentAmountCurrency === this.filterCurrency);
    }

    this.gridApi.setRowData(filtered);
  }

  clearFilters() {
    this.filterPaymentDate = '';
    this.filterEventValueDate = '';
    this.filterCurrency = 'All';
    this.fetchData();
  }

  // Authorize button operation (example: set authorized flag and display alert)
  authorizeSelected() {
    if (!this.selectedRecord) return;

    this.selectedRecord.authorized = true;

    // Update row data and refresh grid
    const idx = this.rowData.findIndex(r => r.id === this.selectedRecord!.id);
    if (idx !== -1) {
      this.rowData[idx] = this.selectedRecord!;
      this.gridApi.setRowData(this.rowData);
    }

    alert(`Record with DDA A/C ${this.selectedRecord.ddaAccount} has been authorized.`);
  }

}