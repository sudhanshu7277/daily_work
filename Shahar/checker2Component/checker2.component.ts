import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
export class Checker1Component implements OnInit, OnDestroy {
  @ViewChild('dt') table: Table | undefined;

  public gridData: IssueRecord[] = [];
  public selectedRecord: IssueRecord | null = null; // Explicit single selection
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
      this.gridData = [...data];
    });
  }

  // Authorize only the single selected record
  onAuthorizeSelected() {
    if (this.selectedRecord) {
      const record = this.gridData.find(r => r.id === this.selectedRecord?.id);
      if (record) {
        record.status = 'Approved';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Record Authorized' });
      }
      this.selectedRecord = null; // Reset selection after action
    }
  }

  onEditRow(record: IssueRecord) {
    this.clonedRecord = { ...record }; // Deep copy for editing
    this.editDialog = true;
  }

  saveEdit() {
    const index = this.gridData.findIndex(r => r.id === this.clonedRecord.id);
    if (index !== -1) {
      this.gridData[index] = { ...this.clonedRecord };
      this.messageService.add({ severity: 'info', summary: 'Saved', detail: 'Update Applied' });
    }
    this.closeDialog();
  }

  closeDialog() {
    this.editDialog = false;
    // Manual force-clear of PrimeNG background blockers
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

  ngOnDestroy() {
    this.closeDialog(); // Ensure cleanup on navigation
  }
}