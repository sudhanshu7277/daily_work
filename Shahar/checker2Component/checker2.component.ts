import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Checker1Service, IssueRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, ToastModule, DropdownModule, CalendarModule, InputTextModule],
  providers: [MessageService], // Required for Toast to work
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.scss']
})
export class Checker1Component implements OnInit {
  @ViewChild('dt') table: Table | undefined;

  public gridData: IssueRecord[] = [];
  public selectedRecord: IssueRecord | null = null; 
  public editDialog: boolean = false;
  public clonedRecord: any = {};
  
  public filterDate: Date | null = null;
  public selectedCurrency: string | null = null;
  public currencies = [
    { label: 'USD', value: 'USD' }, { label: 'CAD', value: 'CAD' },
    { label: 'EUR', value: 'EUR' }, { label: 'GBP', value: 'GBP' }
  ];

  constructor(
    private service: Checker1Service, 
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig
  ) {}

  ngOnInit() {
    this.primengConfig.zIndex = { modal: 1100, overlay: 10000, menu: 1000, tooltip: 1100 };
    this.loadData();
  }

  loadData() {
    this.service.getIssueRecords().subscribe(data => this.gridData = data);
  }

  // Force selection when radio button OR row is clicked
  selectRow(record: IssueRecord) {
    this.selectedRecord = record;
  }

  onAuthorizeSelected() {
    if (this.selectedRecord) {
      const index = this.gridData.findIndex(r => r.id === this.selectedRecord?.id);
      if (index !== -1) {
        this.gridData[index].status = 'Approved';
        // TOAST FIX: Ensure this is called
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record Authorized Successfully' });
      }
      this.selectedRecord = null;
    }
  }

  onEditRow(record: IssueRecord) {
    // Show ALL information per record in the dialog
    this.clonedRecord = { ...record }; 
    this.editDialog = true;
  }

  saveEdit() {
    const index = this.gridData.findIndex(r => r.id === this.clonedRecord.id);
    if (index !== -1) {
      this.gridData[index] = { ...this.clonedRecord };
      this.messageService.add({ severity: 'info', summary: 'Updated', detail: 'Record details saved' });
    }
    this.editDialog = false;
    this.cleanupOverlay();
  }

  cleanupOverlay() {
    // Force remove any leftover modal backdrops that freeze the UI
    setTimeout(() => {
      document.querySelectorAll('.p-component-overlay').forEach(el => el.remove());
      document.body.classList.remove('p-overflow-hidden');
    }, 100);
  }

  resetFilters() {
    this.filterDate = null;
    this.selectedCurrency = null;
    this.table?.reset();
  }
}