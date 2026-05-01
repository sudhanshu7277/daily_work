import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { InstructionStatus, INSTRUCTION_STATUS_LABELS } from '@core/models';
import { ButtonComponent } from '@shared/components/button/button.component';
import { StatusPillComponent } from '@shared/components/status-pill/status-pill.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { DataTableComponent, DataTableColumn } from '@shared/components/data-table/data-table.component';
import { InstructionService } from '@core/services/instruction.service';
import { DashboardActions } from './store/dashboard.actions';
import {
  selectDashboardError,
  selectDashboardLoading,
  selectDashboardSummary,
} from './store/dashboard.selectors';

interface ChartItem {
  name: string;
  value: number;
}

interface InstructionRow {
  id: string;
  reference: string;
  client: string;
  category: string;
  valueDate: string;
  dueDate: string;
  region: string;
  status: InstructionStatus;
  updatedOn: string;
}

@Component({
  selector: 'gab-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    NgxChartsModule,
    ButtonComponent,
    StatusPillComponent,
    SpinnerComponent,
    DataTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly instructionService = inject(InstructionService);

  protected readonly loading$ = this.store.select(selectDashboardLoading);
  protected readonly error$ = this.store.select(selectDashboardError);
  protected readonly summary$ = this.store.select(selectDashboardSummary);

  protected readonly instructions = signal<InstructionRow[]>([]);

  // ── Chart colors (GAB green palette from Fig 6) ──────────────────────
  protected readonly chartColorScheme = {
    domain: ['#4a9b2d', '#6fb849', '#3b6d11', '#1a9b8e', '#2e6d1a', '#97c459'],
  };
  protected readonly pieColorScheme = {
    domain: ['#4a9b2d', '#6fb849', '#b8e0a4', '#1a9b8e', '#3b6d11', '#e89421', '#d83434'],
  };

  // ── Computed chart data from NgRx summary ────────────────────────────
  protected readonly statusChartData = computed<ChartItem[]>(() => {
    const summary = this._summary();
    if (!summary) return this.fallbackStatusData;
    return Object.entries(summary.counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        name: INSTRUCTION_STATUS_LABELS[k as InstructionStatus] ?? k,
        value: v,
      }))
      .sort((a, b) => b.value - a.value);
  });

  protected readonly regionChartData = computed<ChartItem[]>(() => {
    const summary = this._summary();
    if (!summary) return this.fallbackRegionData;
    return Object.entries(summary.byRegion).map(([k, v]) => ({ name: k.toUpperCase(), value: v }));
  });

  protected readonly categoryChartData = computed<ChartItem[]>(() => {
    const summary = this._summary();
    if (!summary) return this.fallbackCategoryData;
    return Object.entries(summary.byCategory)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: k, value: v }));
  });

  protected readonly kpiTotal = computed(() => this._summary()?.total ?? 0);
  protected readonly kpiHigh = computed(() => this._summary()?.missingByPriority.high ?? 0);
  protected readonly kpiMedium = computed(() => this._summary()?.missingByPriority.medium ?? 0);
  protected readonly completedCount = computed(() =>
    this.statusChartData().find((d) => d.name === 'Payment Completed')?.value ?? 0
  );

  private readonly _summary = signal<any>(null);

  // ── Table columns ─────────────────────────────────────────────────────
  protected readonly columns: DataTableColumn<InstructionRow>[] = [
    { key: 'reference', header: 'Payment #', sortable: true, width: '160px' },
    { key: 'client', header: 'Client', sortable: true },
    { key: 'category', header: 'Category' },
    { key: 'valueDate', header: 'Value Date', sortable: true, width: '120px' },
    { key: 'dueDate', header: 'Due Date', width: '120px' },
    { key: 'region', header: 'Region', width: '90px' },
    { key: 'status', header: 'Status', width: '180px' },
    { key: 'updatedOn', header: 'Updated', sortable: true, width: '120px' },
  ];

  // ── Fallback data if summary not loaded yet ───────────────────────────
  private readonly fallbackStatusData: ChartItem[] = [
    { name: 'Admin Maker', value: 8 },
    { name: 'Admin Checker', value: 5 },
    { name: 'Signature Validation', value: 4 },
    { name: 'Payment Completed', value: 3 },
    { name: 'Operations Callback', value: 2 },
    { name: 'Draft', value: 1 },
  ];
  private readonly fallbackRegionData: ChartItem[] = [
    { name: 'LATAM', value: 14 },
    { name: 'NAM', value: 6 },
    { name: 'EMEA', value: 2 },
    { name: 'APAC', value: 1 },
  ];
  private readonly fallbackCategoryData: ChartItem[] = [
    { name: 'Tax', value: 9 },
    { name: 'Coupon', value: 5 },
    { name: 'Fee', value: 4 },
    { name: 'Principal', value: 3 },
    { name: 'Maintenance', value: 2 },
  ];

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadSummary());

    this.store.select(selectDashboardSummary).subscribe((s) => {
      if (s) this._summary.set(s);
    });

    // Load instruction rows for the table
    this.instructionService.list({}, { pageSize: 50 }).subscribe(({ data }) => {
      this.instructions.set(
        data.map((inst) => ({
          id: inst.id,
          reference: inst.reference,
          client: inst.clientInformation.clientId ?? '—',
          category: inst.instructionDetails.category ?? '—',
          valueDate: inst.instructionDetails.valueDate
            ? new Date(inst.instructionDetails.valueDate).toLocaleDateString()
            : '—',
          dueDate: inst.instructionDetails.dueDate
            ? new Date(inst.instructionDetails.dueDate).toLocaleDateString()
            : '—',
          region: inst.clientInformation.regionId?.toUpperCase().replace('r-', '') ?? '—',
          status: inst.status,
          updatedOn: new Date(inst.updatedOn).toLocaleDateString(),
        }))
      );
    });
  }

  protected onRowClick(row: InstructionRow): void {
    this.router.navigate(['/instructions', row.id]);
  }

  protected goToNew(): void {
    this.router.navigate(['/instructions', 'new']);
  }
}
