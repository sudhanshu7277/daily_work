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

