import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsGridComponent } from '../../shared/components/results-grid/results-grid.component';
import { SelectionPanelComponent } from '../../shared/components/selection-panel/selection-panel.component';
import { SearchCustomerComponent } from './components/search-customer/search-customer.component';

@Component({
  selector: 'app-legal-hold-shell',
  standalone: true,
  imports: [CommonModule, ResultsGridComponent, SelectionPanelComponent, SearchCustomerComponent],
  templateUrl: './legal-hold-shell.component.html',
  styleUrls: ['./legal-hold-shell.component.scss']
})
export class LegalHoldShellComponent {
  @ViewChild(ResultsGridComponent) resultsGrid!: ResultsGridComponent;
  selectedList: any[] = [];
  currentTab: 'customer' | 'product' | 'hold' = 'customer';

  onSearch(criteria: any): void {
    this.resultsGrid?.performSearch(criteria);
  }

  handleSelectionChange(selectedRows: any[]): void {
    this.selectedList = selectedRows;
  }

  handleRemoveProfile(profile: any): void {
    this.resultsGrid?.deselectRow(profile);
  }
}