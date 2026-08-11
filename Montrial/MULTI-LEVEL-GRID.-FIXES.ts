// 1. Update flattenTree() in multi-level-customer-grid.component.ts / entity-grid.component.ts
//In flattenTree(), update the final loop that sets _isClusterEnd. A row is only a cluster end if it belongs to a cluster (node._level > 0 or node._isParent). Standalone records (node._level === 0 && !node._isParent) must have _isClusterEnd = false.

private flattenTree(): EntityRowNode[] {
    const flattenedRows: EntityRowNode[] = [];
  
    const recurse = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node._isClusterEnd = false;
        flattenedRows.push(node);
  
        const kids = this.getChildren(node);
        if (node._isParent && node._expanded && kids.length) {
          recurse(kids);
        }
      }
    };
  
    recurse(this.tree);
  
    // Mark cluster ends ONLY for records that belong to a cluster
    for (let i = 0; i < flattenedRows.length; i++) {
      const node = flattenedRows[i];
      const nextIsRoot = flattenedRows[i + 1] && flattenedRows[i + 1]._level === 0;
      const isLastRow = i === flattenedRows.length - 1;
  
      // Check if the node is part of a cluster (has depth > 0 or has children)
      const isPartOfCluster = node._level > 0 || node._isParent;
  
      if (isPartOfCluster && (nextIsRoot || isLastRow)) {
        node._isClusterEnd = true;
      } else {
        node._isClusterEnd = false;
      }
    }
  
    return flattenedRows;
  }


  // 2. Verify getRowClass in multi-level-customer-grid.component.ts
//Ensure getRowClass returns standard 'row-child' for individual records:

readonly getRowClass = (p: any): string => {
    const d = p.data as EntityRowNode;
    if (d?._isParent) {
      return d._expanded ? 'row-parent-expanded' : 'row-parent-collapsed';
    }
    return d?._isClusterEnd ? 'row-child row-cluster-end' : 'row-child';
  };


  //3. Verify SCSS/CSS Classes
//Ensure your grid SCSS handles borders as follows:

/* Standard Individual Rows & Non-Cluster Children */
.ag-row.row-child {
    background-color: $bmo-white !important;
    border-bottom: 1px solid #d8e4e6 !important;
    border-top: none !important;
  }
  
  /* Expanded Cluster Header: 2px Blue Top Border */
  .ag-row.row-parent-expanded {
    background-color: #E8F4FD !important;
    border-top: 2px solid $bmo-blue !important;
    border-bottom: 1px solid #b8d9f0 !important;
  }
  
  /* Collapsed Cluster Header: Standard 1px Borders */
  .ag-row.row-parent-collapsed {
    background-color: $bmo-white !important;
    border-top: 1px solid #d8e4e6 !important;
    border-bottom: 1px solid #d8e4e6 !important;
  }
  
  /* Cluster End (Last Child of Cluster): 2px Blue Bottom Border */
  .ag-row.row-cluster-end {
    border-bottom: 2px solid $bmo-blue !important;
  }


  