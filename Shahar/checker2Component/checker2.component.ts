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
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-checker2',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, 
    ToastModule, DropdownModule, CalendarModule, InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './checker2.component.html',
  styleUrls: ['./checker2.component.scss']
})
export class Checker2Component implements OnInit {
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

  constructor(private service: Checker1Service, private messageService: MessageService) {}

  ngOnInit() {
    this.service.getIssueRecords().subscribe(data => {
      this.gridData = data;
    });
  }

  onAuthorizeSelected() {
    if (this.selectedRecord) {
      this.selectedRecord.status = 'Approved';
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Authorized successfully' });
      this.selectedRecord = null;
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
      this.messageService.add({ severity: 'info', summary: 'Saved', detail: 'Record updated' });
    }
    this.closeAndCleanup();
  }

  closeAndCleanup() {
    this.editDialog = false;
    // Force remove the PrimeNG block layer if it gets stuck
    document.querySelectorAll('.p-component-overlay').forEach(el => el.remove());
    document.body.classList.remove('p-overflow-hidden');
  }

  resetFilters() {
    this.filterDate = null;
    this.selectedCurrency = null;
    this.table?.reset();
  }
}