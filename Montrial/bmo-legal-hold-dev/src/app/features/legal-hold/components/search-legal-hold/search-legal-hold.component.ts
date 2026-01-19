import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-legal-hold',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-legal-hold.component.html',
  styleUrls: ['./search-legal-hold.component.scss']
})
export class SearchLegalHoldComponent {
  @Output() searchTriggered = new EventEmitter<any>();

  criteria = {
    holdName: '',
    holdId: '',
    status: 'Active',
    dateInitiated: ''
  };

  onSearch(): void {
    this.searchTriggered.emit({ ...this.criteria, searchType: 'LEGAL_HOLD' });
  }

  clear(): void {
    this.criteria = {
      holdName: '',
      holdId: '',
      status: 'Active',
      dateInitiated: ''
    };
    this.searchTriggered.emit(this.criteria);
  }
}