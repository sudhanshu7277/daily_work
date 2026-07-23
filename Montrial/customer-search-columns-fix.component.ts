// Step 1 — NameHeaderComponent class (complete replacement of the class body)

export class NameHeaderComponent {
    state: 'none' | 'some' | 'all' = 'none';
    sort: 'asc' | 'desc' | null = null;
    private onSelectAll!: (v: boolean) => void;
    private params: any;
  
    constructor(private readonly cdr: ChangeDetectorRef) {}
  
    agInit(p: any): void {
      this.params      = p;
      this.state       = p.state ?? 'none';
      this.onSelectAll = p.onSelectAll;
      this.sort        = p.column?.getSort() ?? null;
      p.column?.addEventListener('sortChanged', () => {
        this.sort = this.params.column.getSort() ?? null;
        this.cdr.detectChanges();
      });
      this.cdr.detectChanges();
    }
  
    refresh(p: any): boolean {
      this.params = p;
      this.state  = p.state ?? 'none';
      this.sort   = p.column?.getSort() ?? null;
      this.cdr.detectChanges();
      return true;
    }
  
    onClick(e: MouseEvent): void {
      e.stopPropagation();
      this.onSelectAll?.(this.state !== 'all');
    }
  
    onSortClick(e: MouseEvent): void {
      e.stopPropagation();
      this.params?.progressSort(e.shiftKey);
    }
  }

  // Step 2 — NameHeaderComponent template

//Find where .hdr-label is in your template. It'll look something like:

<span class="hdr-label">Profile Name</span>

// Add the sort SVG immediately after it:

<span class="hdr-label">Profile Name</span>
<svg (click)="onSortClick($event)"
     class="cs-sort-icon" width="10" height="14"
     viewBox="0 0 10 14" fill="none"
     style="cursor:pointer;flex-shrink:0;margin-left:4px;">
  <path d="M5 1L1 5H9L5 1Z"
        [attr.fill]="sort === 'asc' ? '#1a1a1a' : '#BDBDBD'"/>
  <path d="M5 13L9 9H1L5 13Z"
        [attr.fill]="sort === 'desc' ? '#1a1a1a' : '#BDBDBD'"/>
</svg>

// Step 3 — Legal Hold Status columnDef (replace the existing entry)

{
    headerName: 'Legal Hold Status',
    field: 'status',
    sortable: true,
    width: 170,
    headerComponent: SortHeaderComponent,
    cellRenderer: (p: ICellRendererParams) =>
      p.value === 'LEGAL HOLD'
        ? '<span class="cs-lh-pill">LEGAL HOLD</span>'
        : p.value === 'PROCESSING'
        ? '<span class="cs-lh-processing">PROCESSING</span>'
        : '<span class="cs-lh-na">N/A</span>',
  },

  // Step 4 — customer-search-grid.component.scss (append at bottom)

  ::ng-deep {
    /* Remove grey column separator lines from header */
    .ag-header-cell {
      border-right: none !important;
    }
    .ag-header-cell-resize::after {
      display: none !important;
    }
  }
  
  /* Sort icon alignment inside custom header */
  .cs-sort-icon {
    vertical-align: middle;
  }

  // sort-header/sort-header.component.ts (create this file inside the customer-search-grid feature folder):


  import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'app-sort-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cs-sort-header" (click)="onSort($event)">
      <span class="cs-sort-header__text">{{ params.displayName }}</span>
      <svg class="cs-sort-icon" width="10" height="14" viewBox="0 0 10 14" fill="none">
        <path d="M5 1L1 5H9L5 1Z"
              [attr.fill]="sort === 'asc' ? '#1a1a1a' : '#BDBDBD'"/>
        <path d="M5 13L9 9H1L5 13Z"
              [attr.fill]="sort === 'desc' ? '#1a1a1a' : '#BDBDBD'"/>
      </svg>
    </div>
  `,
  styles: [`
    .cs-sort-header {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      user-select: none;
      width: 100%;
      height: 100%;
    }
    .cs-sort-icon { flex-shrink: 0; }
  `]
})
export class SortHeaderComponent implements IHeaderAngularComp {
  params!: IHeaderParams;
  sort: 'asc' | 'desc' | null = null;

  agInit(params: IHeaderParams): void {
    this.params = params;
    this.sort = params.column.getSort() ?? null;
    params.column.addEventListener('sortChanged', () => {
      this.sort = this.params.column.getSort() ?? null;
    });
  }

  refresh(params: IHeaderParams): boolean {
    this.params = params;
    return true;
  }

  onSort(event: MouseEvent): void {
    this.params.progressSort(event.shiftKey);
  }
}

// Then in customer-search-grid.component.ts, import it at the top:

import { SortHeaderComponent } from './sort-header/sort-header.component';

// And add it to the @Component imports array:

imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    TranslateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    SortHeaderComponent,   // ← ADD
  ],