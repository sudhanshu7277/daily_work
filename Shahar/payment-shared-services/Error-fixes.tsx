// 1. multi-level-grid-tree.util.ts
Replace the loop at lines 50–60 inside flattenTree:



for (let i = 0; i < flattenedRows.length; i++) {
  const node = flattenedRows[i];
  const nextNode = flattenedRows[i + 1];
  const nextIsRoot = nextNode && nextNode._level === 0;
  const isLastRow = i === flattenedRows.length - 1;

  const isClusterNode = node._isParent || node._level > 0;
  node._isClusterEnd = !!(isClusterNode && (nextIsRoot || isLastRow));

  // Flag the row right before an expanded parent cluster (strictly boolean check)
  node['_isBeforeExpanded'] = Boolean(nextNode && nextNode._isParent && nextNode._expanded === true);
}


// 2. multi-level-customer-grid-component.ts
Ensure getRowClass applies row-before-expanded:


getRowClass = (params: any): string | string[] => {
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

  if (node['_isBeforeExpanded']) {
    classes.push('row-before-expanded');
  }

  return classes;
};


// 3. multi-level-customer-grid-component.scss
Replace the cluster styling block with this:


/* Base Row */
.ag-row {
  border-top: none !important;
  border-bottom: 1px solid #d8e4e6 !important;
  background-color: #ffffff;
}

/* Closed Cluster -> Standard grey bottom border */
.ag-row.row-parent-collapsed {
  background-color: #ffffff !important;
  border-bottom: 1px solid #d8e4e6 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* Expanded Cluster Header */
.ag-row.row-parent-expanded {
  background-color: #e8f4fd !important;
  border-bottom: 1px solid #b8d9f0 !important;

  &:hover {
    background-color: #d6ecf9 !important;
  }
}

/* Handles the top blue line if expanded cluster is the first row (index 0) */
.ag-row[row-index="0"].row-parent-expanded {
  box-shadow: inset 0 2px 0 0 $bmo-blue !important;
}

/* Preceding row gets the top blue divider for index > 0 */
.ag-row.row-before-expanded {
  border-bottom: 2px solid $bmo-blue !important;
}

/* Child Rows */
.ag-row.row-child {
  background-color: #ffffff !important;
  border-bottom: 1px solid #e0e0e0 !important;

  &:hover {
    background-color: #f5f9fa !important;
  }
}

/* Bottom line on final child row of open cluster */
.ag-row.row-cluster-end {
  border-bottom: 2px solid $bmo-blue !important;
}