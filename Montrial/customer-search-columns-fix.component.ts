// Step 1 — sort-header.component.ts (full file)

import { Component } from '@angular/core';
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
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none"
           style="flex-shrink:0; margin-left:4px; cursor:pointer;">
        <path d="M2 6L5 2L8 6"
              stroke="#1C2333" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="5" y1="2" x2="5" y2="9"
              stroke="#1C2333" stroke-width="1.5"
              stroke-linecap="round"/>
        <path d="M2 10L5 14L8 10"
              stroke="#1C2333" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="5" y1="7" x2="5" y2="14"
              stroke="#1C2333" stroke-width="1.5"
              stroke-linecap="round"/>
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
  `]
})
export class SortHeaderComponent implements IHeaderAngularComp {
  params!: IHeaderParams;

  agInit(params: IHeaderParams): void {
    this.params = params;
  }

  refresh(params: IHeaderParams): boolean {
    this.params = params;
    return true;
  }

  onSort(event: MouseEvent): void {
    this.params.progressSort(event.shiftKey);
  }
}

// Step 2 — NameHeaderComponent template SVG replacement

//Find the old <svg> next to .hdr-label and replace with:

<svg (click)="onSortClick($event)"
     width="10" height="16" viewBox="0 0 10 16" fill="none"
     style="flex-shrink:0; margin-left:4px; cursor:pointer;">
  <path d="M2 6L5 2L8 6"
        stroke="#1C2333" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="5" y1="2" x2="5" y2="9"
        stroke="#1C2333" stroke-width="1.5"
        stroke-linecap="round"/>
  <path d="M2 10L5 14L8 10"
        stroke="#1C2333" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="5" y1="7" x2="5" y2="14"
        stroke="#1C2333" stroke-width="1.5"
        stroke-linecap="round"/>
</svg>


// Step 3 — customer-search-grid.component.ts — add two methods

private sortTree(data: any[], field: string, direction: 'asc' | 'desc'): any[] {
    // Separate parents and children
    const parents  = data.filter(r => !r._isChild);
    const children = data.filter(r =>  r._isChild);
  
    // Sort only parents alphabetically
    parents.sort((a, b) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return direction === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  
    // Re-attach each parent's children immediately after it
    return parents.flatMap(parent => [
      parent,
      ...children.filter(c => c._parentUid === parent._uid)
    ]);
  }
  
  onSortChanged(): void {
    const sortState = this.gridApi
      .getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      // No sort active — reset to original order
      this.refresh();
      return;
    }
  
    this.rowData = this.sortTree(
      this.rowData,
      sortState.colId,
      sortState.sort as 'asc' | 'desc'
    );
  }

  // Step 4 — grid HTML, add one event binding

// Find <ag-grid-angular in customer-search-grid.component.html and add:

(sortChanged)="onSortChanged()"


//SI=ORTING ICONS SVGs

<svg width="10" height="13" viewBox="0 0 10 13" fill="none"
     style="flex-shrink:0; margin-left:4px; cursor:pointer;">
  <!-- Up chevron -->
  <path d="M1.5 5L5 1.5L8.5 5"
        stroke="#1C2333"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <!-- Down chevron -->
  <path d="M1.5 8L5 11.5L8.5 8"
        stroke="#1C2333"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>


// lets see if this svg works

<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="sort-icon">
  <path d="M6 16.5V7.83l-2.88 2.88L1.71 9.3 7 4l5.29 5.3-1.41 1.41L8 7.83v8.67H6z"/>
  <path d="M16 7.5v8.67l2.88-2.88 1.41 1.41L15 20l-5.29-5.3 1.41-1.41 2.88 2.88V7.5h2z"/>
</svg>

// onSortChanged

onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      this.refresh(); // no sort active — reset to original order
      return;
    }
  
    const field = sortState.colId;
    const dir   = sortState.sort as 'asc' | 'desc';
  
    // Sort only ROOT nodes in this.tree — children follow their parent automatically
    this.tree.sort((a, b) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  
    // Rebuild flat array — clusters stay intact since we sorted the tree
    this.refresh();
  }


  // Fix — replace onSortChanged completely and delete sortTree:

  onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      this.refresh(); // no active sort — rebuild as-is
      return;
    }
  
    const field = sortState.colId;
    const dir   = sortState.sort as 'asc' | 'desc';
  
    // Sort ONLY root nodes in this.tree
    // Children automatically follow since buildFlat
    // adds them immediately after their parent
    this.tree.sort((a, b) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  
    // Rebuild flat rowData — clusters stay intact
    // _isClusterEnd marks are recalculated correctly by buildFlat
    this.refresh();
  }


  // Step 1 — Profile Name columnDef, add one line:

  {
    headerName: '',
    field: 'profileName',
    sortable: true,
    comparator: () => 0,   // ← ADD: prevent AG Grid native reorder
    minWidth: 260,
    flex: 2,
    cellRenderer: NameCellComponent,
    // ... rest unchanged
  }


  // Step 2 — Legal Hold Status columnDef, add one line:

  {
    headerName: 'Legal Hold Status',
    field: 'status',
    sortable: true,
    comparator: () => 0,   // ← ADD: prevent AG Grid native reorder
    width: 170,
    headerComponent: SortHeaderComponent,
    // ... rest unchanged
  }

  // Step 3 — onSortChanged (keep exactly as last given, delete sortTree):

  onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      // No active sort — rebuild original order
      this.rowData = [...this.buildFlat(this.tree)];
      this.cdr.detectChanges();
      return;
    }
  
    const field = sortState.colId;
    const dir   = sortState.sort as 'asc' | 'desc';
  
    // Sort root nodes only in this.tree
    this.tree.sort((a, b) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  
    // NEW array reference — critical for AG Grid to detect the change
    this.rowData = [...this.buildFlat(this.tree)];
    this.cdr.detectChanges();
  }

  //// buildFlat — add this private method:

  private buildFlat(nodes: any[]): any[] {
    const out: any[] = [];
    for (const n of nodes) {
      n._isClusterEnd = false;
      out.push({ ...n });
      if (n._isParent && n._expanded) {
        n.children.forEach((c: any, idx: number) => {
          c._isClusterEnd = idx === n.children.length - 1;
          out.push({ ...c });
        });
      } else if (n._isParent && !n._expanded) {
        out[out.length - 1]._isClusterEnd = true;
      }
    }
    return out;
  }

  // refresh — replace your existing one:

  private refresh(): void {
    // Always assign NEW array reference so AG Grid detects the change
    this.rowData = [...this.buildFlat(this.tree)];
    this.updateHeaderCheckbox();
    this.cdr.detectChanges();
  }


  // onSortChanged — replace your existing one:

//   onSortChanged(): void {
//     const sortState = this.gridApi?.getColumnState()
//       .find(s => s.sort != null);
  
//     if (!sortState) {
//       this.refresh();
//       return;
//     }
  
//     const field = sortState.colId;
//     const dir   = sortState.sort as 'asc' | 'desc';
  
//     // Sort root nodes only — children follow automatically via buildFlat
//     this.tree.sort((a, b) => {
//       const valA = (a[field] ?? '').toLowerCase();
//       const valB = (b[field] ?? '').toLowerCase();
//       return dir === 'asc'
//         ? valA.localeCompare(valB)
//         : valB.localeCompare(valA);
//     });
  
//     this.refresh();
//   }


onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      this.currentPage = 1;
      this.refresh();
      return;
    }
  
    const field = sortState.colId;
    const dir   = sortState.sort as 'asc' | 'desc';
  
    const sortFn = (a: any, b: any) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    };
  
    // Sort root nodes (handles multiple clusters)
    (this.tree as any[]).sort(sortFn);
  
    // Sort children within each cluster
    (this.tree as any[]).forEach((n: any) => {
      if (n._isParent && n.children?.length > 0) {
        n.children.sort(sortFn);
      }
    });
  
    this.currentPage = 1;
    this.refresh(); // flattenTree reads sorted this.tree → rowData
  }


  // Fix 1 — SortHeaderComponent — use ElementRef instead of eGridHeader:

  import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'app-sort-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cs-sort-header">
      <span class="cs-sort-header__text">{{ params.displayName }}</span>
      <svg width="10" height="13" viewBox="0 0 10 13" fill="none"
           style="flex-shrink:0; margin-left:4px;">
        <path d="M1.5 5L5 1.5L8.5 5"
              stroke="#1C2333" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1.5 8L5 11.5L8.5 8"
              stroke="#1C2333" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
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
    .cs-sort-header__text {
      font-size: 13px;
      font-weight: 700;
      color: #1c2333;
      white-space: nowrap;
    }
  `]
})
export class SortHeaderComponent implements IHeaderAngularComp {
  params!: IHeaderParams;
  private clickListener!: (e: MouseEvent) => void;

  constructor(private el: ElementRef) {}

  agInit(params: IHeaderParams): void {
    this.params = params;
    this.clickListener = (e: MouseEvent) => {
      e.stopPropagation();
      this.params.progressSort(e.shiftKey);
    };
    // Attach to component's own native element — guaranteed to work
    this.el.nativeElement.addEventListener('click', this.clickListener);
  }

  refresh(params: IHeaderParams): boolean {
    this.params = params;
    return true;
  }

  destroy(): void {
    this.el.nativeElement.removeEventListener('click', this.clickListener);
  }
}

// Fix 2 — onSortChanged — handle clusters, standalone parents, and leaf nodes:

onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      this.currentPage = 1;
      this.refresh();
      return;
    }
  
    const field = sortState.colId;
    const dir   = sortState.sort as 'asc' | 'desc';
  
    const sortFn = (a: any, b: any) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    };
  
    // Sort root nodes — handles clusters AND standalone records
    (this.tree as any[]).sort(sortFn);
  
    // Sort children within each cluster
    (this.tree as any[]).forEach((n: any) => {
      if (n._isParent && n.children?.length > 0) {
        n.children.sort(sortFn);
      }
    });
  
    this.currentPage = 1;
    this.refresh();
  }


  /////////////////


  import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

@Component({
  selector: 'app-sort-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cs-sort-header">
      <span class="cs-sort-header__text">{{ params?.displayName }}</span>
      <svg (click)="onSort($event)"
           width="10" height="13" viewBox="0 0 10 13" fill="none"
           style="flex-shrink:0; margin-left:4px; cursor:pointer;">
        <path d="M1.5 5L5 1.5L8.5 5"
              stroke="#1C2333" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1.5 8L5 11.5L8.5 8"
              stroke="#1C2333" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
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
    .cs-sort-header__text {
      font-size: 13px;
      font-weight: 700;
      color: #1c2333;
      white-space: nowrap;
    }
  `]
})
export class SortHeaderComponent implements IHeaderAngularComp {
  params!: IHeaderParams;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  agInit(params: IHeaderParams): void {
    this.params = params;
    this.cdr.detectChanges(); // ← critical for AG Grid v32 standalone
  }

  refresh(params: IHeaderParams): boolean {
    this.params = params;
    this.cdr.detectChanges();
    return true;
  }

  onSort(event: MouseEvent): void {
    event.stopPropagation();
    this.params?.progressSort(event.shiftKey);
  }
}



// Add this right above or below NameHeaderComponent in customer-search-grid.component.ts:

@Component({
    selector: 'app-sort-header',
    standalone: true,
    imports: [CommonModule],
    template: `
      <div class="cs-sort-header" (click)="onSort($event)">
        <span class="cs-sort-header__text">{{ params?.displayName }}</span>
        <svg width="10" height="13" viewBox="0 0 10 13" fill="none"
             style="flex-shrink:0; margin-left:4px;">
          <path d="M1.5 5L5 1.5L8.5 5"
                stroke="#1C2333" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1.5 8L5 11.5L8.5 8"
                stroke="#1C2333" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
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
      .cs-sort-header__text {
        font-size: 13px;
        font-weight: 700;
        color: #1c2333;
        white-space: nowrap;
      }
    `]
  })
  export class SortHeaderComponent implements IHeaderAngularComp {
    params!: IHeaderParams;
  
    constructor(private readonly cdr: ChangeDetectorRef) {}
  
    agInit(params: IHeaderParams): void {
      this.params = params;
      this.cdr.detectChanges();
    }
  
    refresh(params: IHeaderParams): boolean {
      this.params = params;
      this.cdr.detectChanges();
      return true;
    }
  
    onSort(event: MouseEvent): void {
      event.stopPropagation();
      this.params?.progressSort(event.shiftKey);
    }
  }

// Step 1 — Add showCheckbox to NameHeaderComponent:

export class NameHeaderComponent {
    state: 'none' | 'some' | 'all' = 'none';
    sort: 'asc' | 'desc' | null = null;
    showCheckbox = true;                        // ← ADD
    private onSelectAll!: (v: boolean) => void;
    private params: any;
  
    constructor(private readonly cdr: ChangeDetectorRef) {}
  
    agInit(p: any): void {
      this.params       = p;
      this.state        = p.state ?? 'none';
      this.onSelectAll  = p.onSelectAll;
      this.showCheckbox = p.showCheckbox ?? true; // ← ADD
      this.sort         = p.column?.getSort() ?? null;
      p.column?.addEventListener('sortChanged', () => {
        this.sort = this.params.column.getSort() ?? null;
        this.cdr.detectChanges();
      });
      this.cdr.detectChanges();
    }
  
    refresh(p: any): boolean {
      this.params       = p;
      this.state        = p.state ?? 'none';
      this.showCheckbox = p.showCheckbox ?? true; // ← ADD
      this.sort         = p.column?.getSort() ?? null;
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

  // Step 2 — NameHeaderComponent template — wrap checkbox with *ngIf:

//Find the checkbox section and wrap it:

<span *ngIf="showCheckbox" class="cb-wrap" (click)="onClick($event)">
  <!-- existing checkbox markup unchanged -->
</span>
<span class="hdr-label">{{ params?.displayName }}</span>
<svg (click)="onSortClick($event)" ...existing SVG...>

// Step 3 — Legal Hold Status colDef:

{
    headerName: 'Legal Hold Status',
    field: 'status',
    sortable: true,
    comparator: () => 0,
    width: 170,
    headerComponent: NameHeaderComponent,       // ← same component
    headerComponentParams: {
      showCheckbox: false,                       // ← hide checkbox
      state: 'none',
      onSelectAll: null,
    },
    cellRenderer: (p: ICellRendererParams) =>
      p.value === 'LEGAL HOLD'
        ? '<span class="cs-lh-pill">LEGAL HOLD</span>'
        : p.value === 'PROCESSING'
        ? '<span class="cs-lh-processing">PROCESSING</span>'
        : '<span class="cs-lh-na">N/A</span>',
  },



  // Fix 1 — NameHeaderComponent template, find the .hdr-label span and change:

  <!-- BEFORE — hardcoded -->
<span class="hdr-label">Profile Name</span>

<!-- AFTER — dynamic -->
<span class="hdr-label">{{ params?.displayName }}</span>

// Fix 2 — Add console.log to onSortClick in NameHeaderComponent:

onSortClick(e: MouseEvent): void {
    e.stopPropagation();
    console.log('onSortClick fired', this.params?.column?.getColId());
    this.params?.progressSort(e.shiftKey);
  }


  // lets see

  <svg (click)="onSortClick($event)"
     width="10" height="13" viewBox="0 0 10 13" fill="none"
     style="flex-shrink:0; margin-left:4px; cursor:pointer;">
  <path d="M1.5 5L5 1.5L8.5 5"
        stroke="#1C2333" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1.5 8L5 11.5L8.5 8"
        stroke="#1C2333" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>


// LATEST CODE CHANGE

onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      this.currentPage = 1;
      this.refresh();
      return;
    }
  
    const field = sortState.colId;
    const dir   = sortState.sort as 'asc' | 'desc';
  
    const sortFn = (a: any, b: any) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    };
  
    // Sort root nodes only
    (this.tree as any[]).sort(sortFn);
  
    // Sort children within each cluster
    (this.tree as any[]).forEach((n: any) => {
      if (n._isParent && n.children?.length > 0) {
        n.children.sort(sortFn);
      }
    });
  
    this.currentPage = 1;
    this.refresh();
  }
  

  // history date dd/mm/yyyy

  formatToDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }