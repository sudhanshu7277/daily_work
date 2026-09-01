// Step 1: Update flattenTree in multi-level-grid-tree.util.ts
///In multi-level-grid-tree.util.ts, replace lines 50 to 59 with:

for (let i = 0; i < flattenedRows.length; i++) {
  const node = flattenedRows[i];
  const nextNode = flattenedRows[i + 1];
  const nextIsRoot = nextNode && nextNode._level === 0;
  const isLastRow = i === flattenedRows.length - 1;

  const isClusterNode = node._isParent || node._level > 0;
  node._isClusterEnd = !!(isClusterNode && (nextIsRoot || isLastRow));

  // Flag the row right before an expanded parent cluster
  node._isBeforeExpanded = !!(nextNode && nextNode._isParent && nextNode._expanded);
}


// Step 2: Update getRowClass in multi-level-customer-grid-component.ts
//In multi-level-customer-grid-component.ts, add 'row-before-expanded'
//  when node._isBeforeExpanded is true:

getRowClass = (params: RowClassParams): string | string[] => {
  const node = params.data;
  if (!node) return '';

  const classes: string[] = [];

  if (node._isParent) {
    classes.push(node._expanded ? 'row-parent-expanded' : 'row-parent-collapsed');
  } else if (node._level > 0) {
    classes.push('row-child');
  }

  if (node._isClusterEnd) {
    classes.push('row-cluster-end');
  }

  if (node._isBeforeExpanded) {
    classes.push('row-before-expanded');
  }

  return classes;
};


// Step 3: Add the SCSS Rule in multi-level-customer-grid-component.scss
//Add this right next to your .row-cluster-end rule:

/* Blue bottom divider on the row directly preceding the expanded cluster */
.ag-row.row-before-expanded {
  border-bottom: 2px solid $bmo-blue !important;
}

/* Edge case: if the expanded cluster is the first row in the grid */
.ag-row[row-index="0"].row-parent-expanded {
  box-shadow: inset 0 2px 0 0 $bmo-blue !important;
}

/* Existing bottom line (untouched) */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}