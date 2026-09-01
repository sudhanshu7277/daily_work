// Step 1: Update TypeScript (Flattening / Grid Row Logic)
//In multi-level-customer-grid-component.ts, where you flatten or prepare this.rowData / gridOptions.getRowClass:

//In getRowClass(params) (or inside your tree-flattening loop where classes are calculated):



getRowClass(params: any): string | string[] {
  const classes: string[] = [];
  const node = params.data;
  const rowIndex = params.node?.rowIndex;

  if (node?._isParent) {
    classes.push(node._expanded ? 'row-parent-expanded' : 'row-parent-collapsed');
  } else if (node?._isChild) {
    classes.push('row-child');
    if (node._isLastChild) {
      classes.push('row-cluster-end');
    }
  }

  // Look ahead: if the NEXT row in the grid is an expanded parent, mark this row
  const nextRowNode = params.api?.getDisplayedRowAtIndex((rowIndex ?? 0) + 1);
  if (nextRowNode?.data?._isParent && nextRowNode.data._expanded) {
    classes.push('row-before-expanded');
  }

  return classes;
}



// Step 2: Add the CSS Rules in SCSS
//In multi-level-customer-grid-component.scss:


/* When closed: normal grey border */
.ag-row.row-parent-collapsed {
  border-bottom: 1px solid #d8e4e6 !important;
}

/* When open: the row preceding the expanded cluster paints the top blue divider */
.ag-row.row-before-expanded {
  border-bottom: 2px solid $bmo-blue !important;
}

/* Edge case: if the expanded row is the very first row (index 0), paint under header */
.ag-row[row-index="0"].row-parent-expanded {
  box-shadow: inset 0 2px 0 0 $bmo-blue !important;
}

/* Bottom of open cluster (existing rule) */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}