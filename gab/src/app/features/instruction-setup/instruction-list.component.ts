import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { PaymentInstruction, InstructionStatus } from '@core/models';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { CardComponent } from '@shared/components/card/card.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { StatusPillComponent } from '@shared/components/status-pill/status-pill.component';
import { InputComponent } from '@shared/components/input/input.component';
import { DataTableColumn, DataTableComponent } from '@shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';
import { InstructionActions } from './store/instruction.actions';
import {
  selectAllInstructions,
  selectInstructionLoading,
  selectInstructionTotal,
} from './store/instruction.selectors';

@Component({
  selector: 'gab-instruction-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    StatusPillComponent,
    InputComponent,
    DataTableComponent,
    EmptyStateComponent,
    SpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-page">
      <gab-page-header
        title="Instructions"
        subtitle="All payment instructions — search, filter, and manage"
        [breadcrumbs]="[{ label: 'Home', path: '/dashboard' }, { label: 'Instructions' }]"
      >
        <div page-actions>
          <gab-button variant="primary" (clicked)="goToNew()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="flex-shrink:0">
              <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            New Instruction
          </gab-button>
        </div>
      </gab-page-header>

      <!-- Search + status filter -->
      <div class="gab-list-toolbar">
        <div class="gab-list-toolbar__search">
          <gab-input
            type="text"
            placeholder="Search by reference, description…"
            [ngModel]="searchTerm"
            (ngModelChange)="onSearch($event)"
          />
        </div>
        <div class="gab-list-toolbar__filters">
          @for (status of filterStatuses; track status.key) {
            <button
              class="gab-list-toolbar__filter-btn"
              [class.gab-list-toolbar__filter-btn--active]="activeFilter === status.key"
              (click)="setFilter(status.key)"
              type="button"
            >{{ status.label }}</button>
          }
        </div>
      </div>

      @if ((loading$ | async)) {
        <div class="gab-list-loading">
          <gab-spinner size="lg" label="Loading instructions" [showLabel]="true" />
        </div>
      } @else {
        <gab-card flush>
          <gab-data-table
            [columns]="columns"
            [rows]="filteredInstructions"
            [rowClickable]="true"
            [hover]="true"
            [sortBy]="sortBy"
            [sortDir]="sortDir"
            [trackBy]="trackById"
            emptyMessage="No instructions found matching your criteria"
            (rowClick)="openInstruction($event)"
            (sortChange)="onSort($event)"
          >
          </gab-data-table>
        </gab-card>
      }

      <!-- Status column cell template — status pill -->
      <ng-template #statusTpl let-row="row">
        <gab-status-pill [status]="row.status" />
      </ng-template>

      <!-- Reference cell template — clickable link style -->
      <ng-template #refTpl let-row="row">
        <span class="gab-list__ref">{{ row.reference }}</span>
      </ng-template>

    </div>
  `,
  styles: [`
    :host { display: block; }

    .gab-list-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .gab-list-toolbar__search {
      flex: 0 0 320px;
      min-width: 0;
    }

    .gab-list-toolbar__filters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .gab-list-toolbar__filter-btn {
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #cdd3dc;
      border-radius: 9999px;
      background: white;
      color: #4d5564;
      cursor: pointer;
      transition: all 120ms;
      font-family: inherit;

      &:hover { border-color: #4f86bf; color: #003b70; }

      &--active {
        background: #003b70;
        color: white;
        border-color: #003b70;
      }
    }

    .gab-list-loading {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .gab-list__ref {
      color: #1f5fa0;
      font-weight: 500;
      font-size: 13px;
    }
  `],
})
export class InstructionListPageComponent implements OnInit {
  @ViewChild('statusTpl') statusTpl!: TemplateRef<{ row: PaymentInstruction }>;
  @ViewChild('refTpl') refTpl!: TemplateRef<{ row: PaymentInstruction }>;

  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly loading$ = this.store.select(selectInstructionLoading);
  protected readonly total$ = this.store.select(selectInstructionTotal);

  private allInstructions: PaymentInstruction[] = [];
  protected filteredInstructions: PaymentInstruction[] = [];

  protected searchTerm = '';
  protected activeFilter = 'all';
  protected sortBy = 'updatedOn';
  protected sortDir: 'asc' | 'desc' = 'desc';

  protected readonly filterStatuses = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'admin-maker', label: 'Admin Maker' },
    { key: 'admin-checker', label: 'Admin Checker' },
    { key: 'signature-validation', label: 'Signature' },
    { key: 'operations-callback', label: 'Callback' },
    { key: 'payment-completed', label: 'Completed' },
  ];

  protected columns: DataTableColumn<PaymentInstruction>[] = [
    { key: 'reference', header: 'Payment #', sortable: true, width: '160px' },
    {
      key: 'category',
      header: 'Category',
      accessor: (r) => r.instructionDetails.category ?? '—',
    },
    {
      key: 'requestType',
      header: 'Request Type',
      accessor: (r) => r.instructionDetails.requestType ?? '—',
    },
    {
      key: 'source',
      header: 'Source',
      accessor: (r) => r.instructionDetails.source ?? '—',
    },
    {
      key: 'valueDate',
      header: 'Value Date',
      width: '110px',
      accessor: (r) =>
        r.instructionDetails.valueDate
          ? new Date(r.instructionDetails.valueDate).toLocaleDateString()
          : '—',
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      width: '110px',
      accessor: (r) =>
        r.instructionDetails.dueDate
          ? new Date(r.instructionDetails.dueDate).toLocaleDateString()
          : '—',
    },
    { key: 'status', header: 'Status', width: '180px' },
    {
      key: 'updatedOn',
      header: 'Updated',
      sortable: true,
      width: '110px',
      align: 'right',
      accessor: (r) => new Date(r.updatedOn).toLocaleDateString(),
    },
  ];

  ngOnInit(): void {
    this.store.dispatch(InstructionActions.loadList({}));
    this.store.select(selectAllInstructions).subscribe((instructions) => {
      this.allInstructions = instructions;
      this.applyFilters();
    });
  }

  protected goToNew(): void {
    this.router.navigate(['/instructions', 'new']);
  }

  protected openInstruction(row: PaymentInstruction): void {
    this.router.navigate(['/instructions', row.id]);
  }

  protected onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  protected setFilter(key: string): void {
    this.activeFilter = key;
    this.applyFilters();
  }

  protected onSort(e: { sortBy: string; sortDir: 'asc' | 'desc' }): void {
    this.sortBy = e.sortBy;
    this.sortDir = e.sortDir;
    this.applyFilters();
  }

  protected trackById(row: PaymentInstruction): string {
    return row.id;
  }

  private applyFilters(): void {
    let results = [...this.allInstructions];

    if (this.activeFilter !== 'all') {
      results = results.filter((r) => r.status === this.activeFilter);
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      results = results.filter(
        (r) =>
          r.reference.toLowerCase().includes(q) ||
          (r.instructionDetails.description ?? '').toLowerCase().includes(q)
      );
    }

    // Sort
    results.sort((a, b) => {
      let ka: string, kb: string;
      if (this.sortBy === 'updatedOn') {
        ka = a.updatedOn;
        kb = b.updatedOn;
      } else {
        ka = a.reference;
        kb = b.reference;
      }
      const dir = this.sortDir === 'asc' ? 1 : -1;
      return ka < kb ? -dir : ka > kb ? dir : 0;
    });

    this.filteredInstructions = results;
  }
}
