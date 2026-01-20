import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
// Ensure these paths match your folder structure exactly
import { ResultsGridComponent } from '../../shared/components/results-grid/results-grid.component';
import { SelectionPanelComponent } from '../../shared/components/selection-panel/selection-panel.component';
import { SearchCustomerComponent } from './components/search-customer/search-customer.component';
import { SearchProductComponent } from './components/search-product/search-product.component';
import { SearchLegalHoldComponent } from './components/search-legal-hold/search-legal-hold.component';

@Component({
  selector: 'app-legal-hold-shell',
  standalone: true,
  imports: [
    CommonModule,
    ResultsGridComponent,
    SelectionPanelComponent,
    SearchCustomerComponent,
    SearchProductComponent,
    SearchLegalHoldComponent
  ],
  templateUrl: './legal-hold-shell.component.html',
  styleUrls: ['./legal-hold-shell.component.scss']
})
export class LegalHoldShellComponent {
  gridApi: any;
  @ViewChild('resultsGrid') resultsGrid!: ResultsGridComponent;

  currentTab: 'customer' | 'product' | 'hold' = 'customer';
  selectedList: any[] = [];
  rowData: any[] = [];
  public performSearch(criteria: any): void {
    const allData = [
      { legalName: 'Asha Dhola', ocifId: '1000-12341', status: 'LEGAL HOLD', holdName: 'Legal Hold Re Placeholder' },
      { legalName: 'Sid Jain', ocifId: '1000-12342', status: 'LEGAL HOLD', holdName: 'Legal Hold Re Placeholder' }
    ];

    const searchFirst = (criteria.firstName || '').toLowerCase().trim();
    const searchLast = (criteria.lastName || '').toLowerCase().trim();
    this.rowData = allData.filter(item => {
      const fullName = item.legalName.toLowerCase();
      return fullName.includes(searchFirst) && fullName.includes(searchLast);
    });

    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  onSearch(criteria: any): void {
    console.log('Search criteria received in shell:', criteria);
    if (this.resultsGrid) {
      this.resultsGrid.performSearch(criteria);
    }
  }

  handleSelectionChange(selectedRows: any[]): void {
    this.selectedList = selectedRows;
  }

  handleRemoveProfile(profile: any): void {
    if (this.resultsGrid) {
      this.resultsGrid.deselectRow(profile);
    }
  }
}