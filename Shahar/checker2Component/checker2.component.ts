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
import { Checker1Service, IssueRecord } from './checker1.service';

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, 
    ToastModule, DropdownModule, CalendarModule, InputTextModule
  ],
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

  constructor(private service: Checker1Service, private messageService: MessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.service.getIssueRecords().subscribe(data => {
      this.gridData = [...data]; // Spread to ensure reference change
    });
  }

  onAuthorizeSelected() {
    if (this.selectedRecord) {
      // Find the item in the local array to update status
      const item = this.gridData.find(r => r.id === this.selectedRecord?.id);
      if (item) {
        item.status = 'Approved';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Authorized' });
      }
      this.selectedRecord = null;
    }
  }

  onEditRow(record: IssueRecord) {
    this.clonedRecord = JSON.parse(JSON.stringify(record)); // Deep clone
    this.editDialog = true;
  }

  saveEdit() {
    const index = this.gridData.findIndex(r => r.id === this.clonedRecord.id);
    if (index !== -1) {
      this.gridData[index] = { ...this.clonedRecord };
      this.messageService.add({ severity: 'info', summary: 'Saved', detail: 'Record Updated' });
    }
    this.editDialog = false;
  }

  resetFilters() {
    this.filterDate = null;
    this.selectedCurrency = null;
    this.table?.reset();
  }
}