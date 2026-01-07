import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  SelectionChangedEvent,
  ICellRendererParams 
} from 'ag-grid-community';
import { DataService, GridRowData } from './data.service';

@Component({
  selector: 'app-checker2',
  standalone: true,
  imports: [CommonModule, AgGridModule, ReactiveFormsModule],
  templateUrl: './checker2.component.html',
  styleUrls: ['./checker2.component.scss']
})
export class Checker2Component implements OnInit {
  private gridApi!: GridApi;
  public rowData: GridRowData[] = [];
  public selectedRow: GridRowData | null = null;
  public isModalVisible = false;
  public editForm!: FormGroup;

  public columnDefs: ColDef[] = [
    { field: 'id', width: 80, checkboxSelection: true, headerCheckboxSelection: false },
    { field: 'ddaAccount', headerName: 'DDA Account' },
    { field: 'accountNumber', headerName: 'Account No' },
    { field: 'issueName', headerName: 'Issue Name' },
    { field: 'paymentAmount', headerName: 'Amount', valueFormatter: p => `$${p.value.toLocaleString()}` },
    { 
      field: 'statusChoice1', 
      headerName: 'Choice 1',
      cellRenderer: (params: ICellRendererParams) => {
        const color = params.value ? '#28a745' : '#dc3545';
        return `<span style="height: 12px; width: 12px; background-color: ${color}; border-radius: 50%; display: inline-block; margin-left: 10px;"></span>`;
      }
    },
    { 
      field: 'statusChoice2', 
      headerName: 'Choice 2',
      cellRenderer: (params: ICellRendererParams) => {
        const color = params.value ? '#28a745' : '#dc3545';
        return `<span style="height: 12px; width: 12px; background-color: ${color}; border-radius: 50%; display: inline-block; margin-left: 10px;"></span>`;
      }
    },
    {
      headerName: 'Actions',
      width: 100,
      cellRenderer: () => `<button class="btn-grid-edit">Edit</button>`,
      onCellClicked: (params) => this.openEditModal(params.data)
    }
  ];

  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 130,
    resizable: true,
    sortable: true,
    filter: true
  };

  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.initEditForm();
  }

  ngOnInit() {
    this.dataService.getCheckerData().subscribe(data => {
      this.rowData = data;
    });
  }

  private initEditForm() {
    this.editForm = this.fb.group({
      id: [null],
      ddaAccount: ['', Validators.required],
      accountNumber: ['', Validators.required],
      issueName: ['', Validators.required],
      paymentAmount: [0, [Validators.required, Validators.min(0)]],
      statusChoice1: [false],
      statusChoice2: [false]
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    const selectedNodes = this.gridApi.getSelectedRows();
    this.selectedRow = selectedNodes.length === 1 ? selectedNodes[0] : null;
  }

  onAuthorize() {
    if (this.selectedRow) {
      this.selectedRow.authorized = true;
      this.gridApi.applyTransaction({ update: [this.selectedRow] });
      alert(`Record ${this.selectedRow.id} has been Authorized.`);
    }
  }

  onFilterTextBoxChanged(event: any) {
    this.gridApi.setGridOption('quickFilterText', event.target.value);
  }

  openEditModal(data: GridRowData) {
    this.editForm.patchValue(data);
    this.isModalVisible = true;
  }

  saveEdit() {
    if (this.editForm.valid) {
      const updatedRecord = this.editForm.value;
      const index = this.rowData.findIndex(r => r.id === updatedRecord.id);
      
      if (index > -1) {
        this.rowData[index] = { ...this.rowData[index], ...updatedRecord };
        this.gridApi.setGridOption('rowData', [...this.rowData]);
      }
      this.isModalVisible = false;
    }
  }
}