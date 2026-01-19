import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-product.component.html',
  styleUrls: ['./search-product.component.scss']
})
export class SearchProductComponent {
  @Output() searchTriggered = new EventEmitter<any>();

  criteria = {
    accountNumber: '',
    productName: '',
    productType: 'All',
    branchCode: ''
  };

  onSearch(): void {
    this.searchTriggered.emit({ ...this.criteria, searchType: 'PRODUCT' });
  }

  search(): void {
    this.searchTriggered.emit({ ...this.criteria, searchType: 'PRODUCT' });
  }
  
  clear(): void {
    this.criteria = {
      accountNumber: '',
      productName: '',
      productType: 'All',
      branchCode: ''
    };
    this.searchTriggered.emit(this.criteria);
  }
}