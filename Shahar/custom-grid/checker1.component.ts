import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-checker1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checker1.component.html',
  styleUrls: ['./checker1.component.scss']
})
export class Checker1Component implements OnInit {
  // Data State
  public masterData: any[] = [
    { id: 'REC-001', ddaAccount: 'DDA-77000', valueDate: '2026-02-10', ccy: 'USD', amount: 55600.00 },
    { id: 'REC-002', ddaAccount: 'DDA-88021', valueDate: '2026-02-11', ccy: 'CAD', amount: 1200.50 },
    { id: 'REC-003', ddaAccount: 'DDA-99100', valueDate: '2026-02-12', ccy: 'EUR', amount: 8900.00 }
  ];

  public filteredData: any[] = [];
  public selectedRecordId: string | null = null;
  
  // Filter Inputs
  public searchDDA: string = '';
  public filterDate: string = '';
  public filterCCY: string = '';
  public currencies: string[] = ['USD', 'CAD', 'EUR', 'GBP'];

  // Notification State
  public toasts: Toast[] = [];
  private toastIdCounter = 0;

  ngOnInit() {
    this.filteredData = [...this.masterData];
  }

  applyFilters() {
    this.filteredData = this.masterData.filter(item => {
      const matchDDA = item.ddaAccount.toLowerCase().includes(this.searchDDA.toLowerCase());
      const matchDate = this.filterDate ? item.valueDate === this.filterDate : true;
      const matchCCY = this.filterCCY ? item.ccy === this.filterCCY : true;
      return matchDDA && matchDate && matchCCY;
    });
  }

  toggleSelection(id: string) {
    this.selectedRecordId = this.selectedRecordId === id ? null : id;
  }

  onAuthorize() {
    const record = this.masterData.find(r => r.id === this.selectedRecordId);
    if (record) {
      this.showToast(`Record ${record.id} Authorized Successfully!`, 'success');
      
      // Logic: Remove from view or update status
      this.masterData = this.masterData.filter(r => r.id !== record.id);
      this.applyFilters();
      this.selectedRecordId = null;
    }
  }

  showToast(message: string, type: 'success' | 'error') {
    const id = this.toastIdCounter++;
    this.toasts.push({ id, message, type });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 4000);
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}