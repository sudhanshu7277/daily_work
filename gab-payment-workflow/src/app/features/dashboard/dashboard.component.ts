import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructionGridComponent } from './components/instruction-grid/instruction-grid.component';
import { DistributionChartComponent } from './components/distribution-chart/distribution-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InstructionGridComponent, DistributionChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  // Dummy Data for Highcharts
  sourceData = [
    { name: 'Citi Direct', y: 65, color: '#0b2265' }, // Gab Navy
    { name: 'Manual Entry', y: 25, color: '#2E7D32' }, // Gab Green
    { name: 'Email Drop', y: 10, color: '#F57C00' }
  ];

  statusData = [
    { name: 'Authorised', y: 40, color: '#2E7D32' },
    { name: 'Pending Checker', y: 35, color: '#F57C00' },
    { name: 'Signature Validation', y: 25, color: '#0b2265' }
  ];

  // Dummy Data for AG Grid
  mockInstructions = [
    { referenceId: 'GAB-4921', client: 'MSU ENERGY SA', region: 'LATAM', status: 'Pending Checker', currency: 'USD', amount: 500000, dueDate: '2026-05-10' },
    { referenceId: 'GAB-8832', client: 'CAMORIM SERVICOS', region: 'LATAM', status: 'Signature Validation', currency: 'BRL', amount: 1250000, dueDate: '2026-05-12' },
    { referenceId: 'GAB-1092', client: 'GLOBAL TECH LLC', region: 'EMEA', status: 'Authorised', currency: 'EUR', amount: 75000, dueDate: '2026-05-05' },
    { referenceId: 'GAB-9921', client: 'ALPHA HOLDINGS', region: 'APAC', status: 'Draft', currency: 'USD', amount: 100000, dueDate: '2026-05-15' }
  ];

  ngOnInit(): void {
    // In the future: this.store.dispatch(InstructionActions.loadDashboardData());
  }
}