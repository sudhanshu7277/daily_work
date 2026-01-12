import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DataService, GridRowData } from './data.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

type ToastType = 'success' | 'warning' | 'error';

@Component({
  selector: 'app-checker2',
  standalone: true,
  imports: [CommonModule, AgGridModule, ReactiveFormsModule],
  templateUrl: './checker2.component.html',
  styleUrls: ['./checker2.component.scss']
})
export class Checker2Component implements OnInit, OnDestroy {
  public gridApi!: GridApi;
  private destroy$ = new Subject<void>();
  
  // Notification & Loading State
  public isNotificationVisible = false;
  public notificationMessage = '';
  public toastType: ToastType = 'success';
  public isSaving = false;
  public isModalVisible = false;

  // Grid Config
  public paginationPageSize = 20; 
  public totalRecords = 0;
  public currencies: string[] = [];
  public selectedRow: GridRowData | null = null;

  public filterForm!: FormGroup;
  public editForm!: FormGroup;

  public columnDefs: ColDef[] = [
    { field: 'id', width: 80, checkboxSelection: true, pinned: 'left' },
    { field: 'issueName', headerName: 'Issue Name', minWidth: 200 },
    { field: 'ddaAccount', headerName: 'DDA Account' },
    { field: 'accountNumber', headerName: 'Account No' },
    { 
      field: 'eventValueDate', 
      headerName: 'Value Date', 
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString() : '' 
    },
    { field: 'paymentAmountCurrency', headerName: 'CCY', width: 90 }, // Restored CCY Column
    { field: 'paymentAmount', headerName: 'Amount', valueFormatter: p => p.value?.toLocaleString() },
    { field: 'statusChoice1', headerName: 'S1', width: 80, cellRenderer: (p: any) => this.circleRenderer(p.value) },
    { field: 'statusChoice2', headerName: 'S2', width: 80, cellRenderer: (p: any) => this.circleRenderer(p.value) },
    {
      headerName: 'Actions', width: 100, pinned: 'right',
      cellRenderer: () => `<button class="action-btn-edit" style="background:#007bff; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">Edit</button>`,
      onCellClicked: (params) => this.openEditModal(params.data)
    }
  ];

  public defaultColDef: ColDef = { flex: 1, resizable: true, sortable: true, filter: true };

  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({ 
      search: [''], 
      dateFilter: [null], 
      currencyFilter: ['ALL'] 
    });

    this.editForm = this.fb.group({
      id: [null], ddaAccount: ['', Validators.required], accountNumber: ['', Validators.required],
      paymentAmount: [0, Validators.required], issueName: ['', Validators.required],
      statusChoice1: [false], statusChoice2: [false]
    });
  }

  ngOnInit() {
    this.dataService.getCurrencies().subscribe(list => this.currencies = list);

    // Watch all filters (Search, Date, Currency)
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(values => this.applyFilters(values));
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.loadData();
  }

  loadData() {
    this.gridApi?.showLoadingOverlay();
    this.dataService.getData().subscribe(data => {
      this.gridApi?.setGridOption('rowData', data);
      this.totalRecords = data.length;
      this.gridApi?.hideOverlay();
    });
  }

  applyFilters(values: any) {
    if (!this.gridApi) return;

    // 1. Quick Filter (Search)
    this.gridApi.setGridOption('quickFilterText', values.search);

    // 2. Column-specific filters
    const filterModel: any = {};

    if (values.currencyFilter !== 'ALL') {
      filterModel.paymentAmountCurrency = {
        filterType: 'text', type: 'equals', filter: values.currencyFilter
      };
    }

    if (values.dateFilter) {
      filterModel.eventValueDate = {
        filterType: 'date', type: 'equals', dateFrom: values.dateFilter
      };
    }

    this.gridApi.setFilterModel(filterModel);
  }

  onAuthorize() {
    if (this.selectedRow && !this.isSaving) {
      this.isSaving = true;
      this.dataService.updateRow({ ...this.selectedRow, authorized: true }).subscribe({
        next: () => {
          this.showNotification('Authorized Successfully!', 'success');
          this.loadData();
          this.isSaving = false;
        },
        error: () => {
          this.showNotification('Authorization Failed', 'error');
          this.isSaving = false;
        }
      });
    }
  }

  saveEdit() {
    if (this.editForm.valid && !this.isSaving) {
      this.isSaving = true;
      this.dataService.updateRow(this.editForm.value).subscribe({
        next: () => {
          this.isModalVisible = false;
          this.showNotification('Record Updated Successfully', 'success');
          this.loadData();
          this.isSaving = false;
        },
        error: () => {
          this.showNotification('Save Failed', 'error');
          this.isSaving = false;
        }
      });
    }
  }

  showNotification(msg: string, type: ToastType = 'success') {
    this.notificationMessage = msg;
    this.toastType = type;
    this.isNotificationVisible = true;
    setTimeout(() => this.isNotificationVisible = false, 3000);
  }

  circleRenderer(value: boolean) {
    const color = value ? '#28a745' : '#dc3545';
    return `<span style="height: 12px; width: 12px; background-color: ${color}; border-radius: 50%; display: inline-block; margin-top:5px;"></span>`;
  }

  onSelectionChanged() {
    const selected = this.gridApi.getSelectedRows();
    this.selectedRow = selected.length === 1 ? selected[0] : null;
  }

  openEditModal(data: GridRowData) {
    this.editForm.patchValue(data);
    this.isModalVisible = true;
  }

  resetFilters() {
    this.filterForm.reset({ currencyFilter: 'ALL', search: '', dateFilter: null });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}