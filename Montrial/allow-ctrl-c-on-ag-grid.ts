// 1. Enable Text Selection in AG Grid Options
//In your component HTML 
// (multi-level-customer-grid.component.html or 
// entity-grid.component.html), add [enableCellTextSelection]="true" and 
// [ensureDomOrder]="true" to <ag-grid-angular>:

<ag-grid-angular
  class="ag-theme-alpine custom-grid"
  [gridOptions]="gridOptions"
  [columnDefs]="columnDefs"
  [rowData]="rowData"
  [enableCellTextSelection]="true"
  [ensureDomOrder]="true"
  ... >
</ag-grid-angular>


/// 2. Enable CSS User-Selection on Grid Cells
//AG Grid disables text selection by default via user-select: none. Add 
// this CSS to multi-level-customer-grid.component.scss (or the global stylesheet) 
// to allow highlighting text with the mouse:


/* Enable browser native text selection and highlight across all grid cells */
.ag-root-wrapper,
.ag-cell,
.ag-cell-value,
.header-title,
.custom-cell-wrapper {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
}

/* Prevent accidental text selection on checkbox/chevron controls while clicking */
.cb-wrap,
.cb-box,
.chevron-icon,
.expander-btn {
  user-select: none !important;
  -webkit-user-select: none !important;
}


// 3. Ensure Custom Cell Renderers Don't Block Mouse Drag
//In custom cell components (e.g., NameCellComponent):

onCheckClick(e: MouseEvent): void {
    e.stopPropagation(); // Prevents row selection/focus shift while checking the box
    this.onCheck?.(this.uid);
  }
  
  onChevronClick(e: MouseEvent): void {
    e.stopPropagation(); // Prevents row selection/focus shift while expanding/collapsing
    this.onToggle?.(this.uid);
  }


  // Template Binding (NameCellComponent)
//Pass $event into both click handlers in your cell renderer HTML template:


<!-- Checkbox container -->
<span class="cb-wrap" (click)="onCheckClick($event)">
  <span class="cb-box" [class.cb-box--checked]="selected">
    <svg *ngIf="selected" ...></svg>
  </span>
</span>

<!-- Expand / Collapse chevron container -->
<span *ngIf="isParent" class="chevron-wrap" (click)="onChevronClick($event)">
  <svg class="chevron-icon" ...></svg>
</span>

<!-- Text Container: Leave purely unhandled with no click/mousedown handlers so text selects freely -->
<span class="profile-name-text">
  {{ name }}
</span>