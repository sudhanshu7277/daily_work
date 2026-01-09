import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  IDatasource, 
  IGetRowsParams, 
  ICellRendererParams 
} from 'ag-grid-community';
import { DataService, GridRowData } from './data.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

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
  
  // Infinite Scroll & Pagination Configuration
  public rowModelType: 'infinite' = 'infinite';
  public paginationPageSize = 100;
  public cacheBlockSize = 100;
  
  // State Management
  public currencies: string[] = [];
  public selectedRow: GridRowData | null = null;
  public isModalVisible = false;
  public totalRecords = 0;

  public filterForm!: FormGroup;
  public editForm!: FormGroup;

  public columnDefs: ColDef[] = [
    { 
      field: 'id', 
      width: 80, 
      checkboxSelection: true, 
      headerCheckboxSelection: false, 
      pinned: 'left' 
    },
    { field: 'issueName', headerName: 'Issue Name', minWidth: 200 },
    { field: 'ddaAccount', headerName: 'DDA Account' },
    { field: 'accountNumber', headerName: 'Account No' },
    { 
      field: 'eventValueDate', 
      headerName: 'Value Date', 
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString() : '' 
    },
    { field: 'paymentAmountCurrency', headerName: 'CCY', width: 90 },
    { 
      field: 'paymentAmount', 
      headerName: 'Amount', 
      valueFormatter: p => p.value ? p.value.toLocaleString() : '' 
    },
    { 
      field: 'statusChoice1', 
      headerName: 'S1', 
      width: 80,
      cellRenderer: (p: ICellRendererParams) => this.circleRenderer(p.value) 
    },
    { 
      field: 'statusChoice2', 
      headerName: 'S2', 
      width: 80,
      cellRenderer: (p: ICellRendererParams) => this.circleRenderer(p.value) 
    },
    {
      headerName: 'Actions',
      width: 100,
      pinned: 'right',
      cellRenderer: () => `<button class="action-btn-edit" style="background:#007bff; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">Edit</button>`,
      onCellClicked: (params) => this.openEditModal(params.data)
    }
  ];

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true
  };

  constructor(private dataService: DataService, private fb: FormBuilder) {
    // Search + Filters combined into one Reactive Form
    this.filterForm = this.fb.group({
      dateFilter: [null],
      currencyFilter: ['ALL'],
      search: ['']
    });

    // Edit form now includes the boolean switches for S1 and S2
    this.editForm = this.fb.group({
      id: [null],
      ddaAccount: ['', Validators.required],
      accountNumber: ['', Validators.required],
      paymentAmount: [0, Validators.required],
      issueName: ['', Validators.required],
      statusChoice1: [false],
      statusChoice2: [false]
    });
  }

  ngOnInit() {
    this.dataService.getCurrencies().subscribe(list => this.currencies = list);

    // Advanced switchMap-like behavior using grid refresh on form change
    // debounceTime(300) ensures we don't spam the "server" while typing
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.refreshGrid();
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.refreshGrid();
  }

  /**
   * Resets the infinite cache and forces a fresh data fetch from row 0
   */
  refreshGrid() {
    if (this.gridApi) {
      this.gridApi.setGridOption('datasource', this.createDatasource());
    }
  }

  /**
   * Defines the AG Grid Datasource for Infinite Scrolling
   */
  createDatasource(): IDatasource {
    return {
      getRows: (params: IGetRowsParams) => {
        this.gridApi.showLoadingOverlay();
        
        // Pass pagination bounds and filter values to the service
        this.dataService.getRowsServerSide(
          params.startRow, 
          params.endRow, 
          this.filterForm.value
        ).subscribe({
          next: (res) => {
            this.totalRecords = res.total;
            params.successCallback(res.rows, res.total);
            this.gridApi.hideOverlay();
            
            if (res.total === 0) {
              this.gridApi.showNoRowsOverlay();
            }
          },
          error: () => {
            params.failCallback();
            this.gridApi.hideOverlay();
          }
        });
      }
    };
  }

  /**
   * Preserving your original working green/red circle logic
   */
  circleRenderer(value: boolean) {
    const color = value ? '#28a745' : '#dc3545';
    return `<span style="height: 12px; width: 12px; background-color: ${color}; border-radius: 50%; display: inline-block; margin-top: 5px;"></span>`;
  }

  onSelectionChanged() {
    const selected = this.gridApi.getSelectedRows();
    this.selectedRow = selected.length === 1 ? selected[0] : null;
  }

  onAuthorize() {
    if (this.selectedRow) {
      alert(`Record ${this.selectedRow.id} (${this.selectedRow.issueName}) has been Authorized.`);
      // In production, trigger a service call here then this.refreshGrid();
    }
  }

  openEditModal(data: GridRowData) {
    this.editForm.patchValue(data);
    this.isModalVisible = true;
  }

  /**
   * Saves transaction edits AND the flipped S1/S2 status
   */
  saveEdit() {
    if (this.editForm.valid) {
      const updatedRecord = this.editForm.value;
      console.log('Pushing updates to server:', updatedRecord);
      
      // Simulated successful update
      alert('Record updated and status flipped successfully!');
      this.isModalVisible = false;
      
      // Reload the grid to show new data from "server"
      this.refreshGrid();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}