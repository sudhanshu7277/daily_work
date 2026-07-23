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