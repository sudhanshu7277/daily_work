import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Checker1Service, IssueRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, DropdownModule, CalendarModule, InputTextModule],
  providers: [MessageService],
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
    // FORCE overlays to be on the highest possible layer in the DOM
    this.primengConfig.zIndex = {
      modal: 1100,
      overlay: 30000, 
      menu: 1000,
      tooltip: 1100
    };

    this.service.getIssueRecords().subscribe(data => this.gridData = data);
  }

  onAuthorizeSelected() {
    if (this.selectedRecord) {
      this.selectedRecord.status = 'Approved';
      this.messageService.add({ severity: 'success', summary: 'Authorized', detail: `Record ${this.selectedRecord.id} Approved` });
      this.selectedRecord = null; // Clear selection
    }
  }

  onEditRow(record: IssueRecord) {
    this.clonedRecord = { ...record };
    this.editDialog = true;
  }

  saveEdit() {
    const index = this.gridData.findIndex(r => r.id === this.clonedRecord.id);
    if (index !== -1) {
      this.gridData[index] = { ...this.clonedRecord };
    }
    this.closeDialog();
  }

  closeDialog() {
    this.editDialog = false;
    // Manual DOM cleanup to ensure the "freeze" overlay is removed
    setTimeout(() => {
      document.querySelectorAll('.p-component-overlay').forEach(el => (el as HTMLElement).style.display = 'none');
      document.body.classList.remove('p-overflow-hidden');
    }, 100);
  }

  resetFilters() {
    this.filterDate = null;
    this.selectedCurrency = null;
    this.table?.reset();
  }
}