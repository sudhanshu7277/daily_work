import { Component, OnInit } from '@angular/core';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowSelectedEvent,
} from 'ag-grid-community';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Checker1Service, PaymentRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.css'],
})
export class Checker1Component implements OnInit {
  columnDefs: ColDef[] = [];
  rowData: PaymentRecord[] = [];
  allRowData: PaymentRecord[] = [];
  gridApi!: GridApi;

  // Filters
  filterPaymentDate = '';
  filterEventValueDate = '';
  filterCurrency = 'All';

  // Selection
  selectedRecord: PaymentRecord | null = null;
  isAuthorizeEnabled = false;

  // Modal Reactive Form
  modalOpen = false;
  form!: FormGroup;

  constructor(private service: Checker1Service, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.setupColumnDefs();
    this.buildForm();
    this.loadData();
  }

  setupColumnDefs() {
    this.columnDefs = [
      {
        headerName: '',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 40,
        suppressMenu: true,
      },
      { field: 'ddaAccount', headerName: 'DDA A/C', sortable: true, filter: true, resizable: true },
      { field: 'accountNumber', headerName: 'Account Number', sortable: true, filter: true, resizable: true },
      {
        field: 'eventValueDate',
        headerName: 'Event Value Date',
        sortable: true,
        filter: 'agDateColumnFilter',
        resizable: true,
        valueFormatter: this.dateFormatter,
      },
      {
        field: 'paymentDate',
        headerName: 'Payment Date',
        sortable: true,
        filter: 'agDateColumnFilter',
        resizable: true,
        valueFormatter: this.dateFormatter,
      },
      {
        field: 'paymentAmountCurrency',
        headerName: 'Currency',
        sortable: true,
        filter: true,
        width: 100,
        resizable: true,
      },
      {
        field: 'paymentAmount',
        headerName: 'Payment Amount',
        sortable: true,
        filter: 'agNumberColumnFilter',
        resizable: true,
        valueFormatter: this.currencyFormatter,
      },
      {
        headerName: 'Choice 1',
        field: 'statusChoice1',
        width: 80,
        cellRenderer: this.statusCellRenderer,
        filter: false,
      },
      {
        headerName: 'Choice 2',
        field: 'statusChoice2',
        width: 80,
        cellRenderer: this.statusCellRenderer,
        filter: false,
      },
      { field: 'dolNo', headerName: 'DOL No', sortable: true, filter: true, resizable: true },
      {
        field: 'eventBalance',
        headerName: 'Event Balance',
        sortable: true,
        filter: 'agNumberColumnFilter',
        resizable: true,
        valueFormatter: this.currencyFormatter,
      },
      {
        field: 'netPaymentAmount',
        headerName: 'Net Payment Amount',
        sortable: true,
        filter: 'agNumberColumnFilter',
        resizable: true,
        valueFormatter: this.currencyFormatter,
      },
      {
        field: 'realTimeBalance',
        headerName: 'Real-Time Balance',
        sortable: true,
        filter: 'agNumberColumnFilter',
        resizable: true,
        valueFormatter: this.currencyFormatter,
      },
      {
        field: 'usdAmount',
        headerName: 'USD Amount',
        sortable: true,
        filter: 'agNumberColumnFilter',
        resizable: true,
        valueFormatter: this.currencyFormatter,
      },
      { field: 'issueName', headerName: 'Issue Name', sortable: true, filter: true, resizable: true },
      {
        headerName: 'Actions',
        width: 100,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: any) => {
          const icon = document.createElement('span');
          icon.classList.add('edit-icon');
          icon.title = 'Edit Record';
          icon.innerHTML = '&#9998;';
          icon.style.cursor = 'pointer';
          icon.addEventListener('click', () => this.openEditModal(params.data));
          return icon;
        },
      },
    ];
  }

  buildForm() {
    // Initialize the reactive form with controls and empty default values
    this.form = this.fb.group({
      ddaAccount: [''],
      accountNumber: [''],
      eventValueDate: [''],
      paymentDate: [''],
      paymentAmountCurrency: ['USD'],
      paymentAmount: [0],
      statusChoice1: [false],
      statusChoice2: [false],
      dolNo: [''],
      eventBalance: [{ value: 0, disabled: true }],
      netPaymentAmount: [{ value: 0, disabled: true }],
      realTimeBalance: [{ value: 0, disabled: true }],
      usdAmount: [{ value: 0, disabled: true }],
      issueName: [''],
      // Add other fields here if needed mirroring your screenshots (e.g branchName etc)
      messageIdentifier: [''], // example for custom modal fields beyond grid columns
      chargeDrawer: [''],
      product: [''],
      // Add more from your modal form as necessary
    });
  }

  loadData() {
    this.service.getPayments().subscribe((data) => {
      this.allRowData = data;
      this.rowData = [...this.allRowData]; // initial load all data
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
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';

    // Patch form with data, convert dates to yyyy-MM-dd string for <input type=date>
    this.form.patchValue({
      ...data,
      eventValueDate: this.formatForDateInput(data.eventValueDate),
      paymentDate: this.formatForDateInput(data.paymentDate),
    });
  }

  closeModal() {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  saveModal() {
    if (!this.form.valid) return;

    // clone form value
    const formValue = this.form.getRawValue();

    // convert date strings back to Date objects
    formValue.eventValueDate = new Date(formValue.eventValueDate);
    formValue.paymentDate = new Date(formValue.paymentDate);

    // Find the index of the edited record and update allRowData
    const idx = this.allRowData.findIndex((r) => r.id === this.selectedRecord?.id);
    if (idx !== -1) {
      this.allRowData[idx] = { ...this.allRowData[idx], ...formValue };
    }

    this.applyFilters();

    this.closeModal();
  }

  applyFilters() {
    if (!this.gridApi) return;

    let filteredData = [...this.allRowData];

    if (this.filterPaymentDate) {
      filteredData = filteredData.filter(
        (r) =>
          new Date(r.paymentDate).toDateString() ===
          new Date(this.filterPaymentDate).toDateString()
      );
    }
    if (this.filterEventValueDate) {
      filteredData = filteredData.filter(
        (r) =>
          new Date(r.eventValueDate).toDateString() ===
          new Date(this.filterEventValueDate).toDateString()
      );
    }
    if (this.filterCurrency && this.filterCurrency !== 'All') {
      filteredData = filteredData.filter(
        (r) => r.paymentAmountCurrency === this.filterCurrency
      );
    }

    this.gridApi.setRowData(filteredData);

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

    const idx = this.allRowData.findIndex((r) => r.id === this.selectedRecord!.id);
    if (idx !== -1) {
      this.allRowData[idx].authorized = true;
    }

    alert(`Record with DDA A/C ${this.selectedRecord.ddaAccount} has been authorized.`);
    this.applyFilters();
  }

  statusCellRenderer(params: any) {
    const circle = document.createElement('span');
    circle.classList.add('status-circle');
    circle.style.backgroundColor = params.value ? 'green' : 'red';
    return circle;
  }

  dateFormatter(params: any) {
    if (!params.value) return '';
    const d = new Date(params.value);
    return d.toLocaleDateString();
  }

  currencyFormatter(params: any) {
    if (params.value == null) return '';
    return params.value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private formatForDateInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }
}