// File 1: name-renderers.component.ts
// Step 1: Update the template (Lines 198–202)
// Replace lines 198–202 with an SVG whose paths toggle classes based on sort:

<svg (click)="onSortClick($event)"
     xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" class="sort-icon">
  <path [class.arrow-active]="sort === 'asc'" class="arrow-path"
        d="M4 11V3M4 3L1.5 5.5M4 3L6.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path [class.arrow-active]="sort === 'desc'" class="arrow-path"
        d="M10 3V11M10 11L7.5 8.5M10 11L12.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>


//Step 2: Update the inline styles (Around line 219–220)
// Add styling for the arrow states right below .hdr-label:


.sort-icon {
  cursor: pointer;
  flex-shrink: 0;
  vertical-align: middle;
  margin-left: 4px;
}

.arrow-path {
  color: #a0a0a0;
  opacity: 0.6;
  transition: color 0.15s ease, opacity 0.15s ease;
}

.arrow-path.arrow-active {
  color: #1c2333;
  opacity: 1;
}

:host(:hover) .arrow-path:not(.arrow-active) {
  opacity: 0.85;
}


//Step 3: Enforce the Sort Cycle (Lines 267–270)
// Change onSortClick:


onSortClick(e: MouseEvent): void {
  e.stopPropagation();
  // Cycles: null (grey) -> asc (up black) -> desc (down black) -> asc
  const nextSort = this.sort === 'asc' ? 'desc' : 'asc';
  this.params?.setSort(nextSort, false);
}


//File 2: multi-level-grid.config.ts
// Enable sorting on both column definitions:

// Profile Name Column (around line 70):


field: 'profileName',
headerName: 'Profile Name',
sortable: true,


// Legal Hold Status Column (around line 104):
// Remove comparator: () => 0:


headerName: 'Legal Hold Status',
field: 'status',
sortable: true,


