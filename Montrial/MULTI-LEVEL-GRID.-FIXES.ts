// 1. Update flattenTree() in multi-level-customer-grid.component.ts
//In flattenTree(), ensure _isClusterEnd is set to true only if the node is part of an expanded cluster group (_level > 0 or _isParent). 
// Standalone non-cluster records will remain _isClusterEnd = false:

private flattenTree(): EntityRowNode[] {
    const flattenedRows: EntityRowNode[] = [];
  
    const recurse = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node._isClusterEnd = false; // Reset by default
        flattenedRows.push(node);
  
        const kids = this.getChildren(node);
        if (node._isParent && node._expanded && kids.length) {
          recurse(kids);
        }
      }
    };
  
    recurse(this.tree);
  
    // Apply _isClusterEnd ONLY to nodes inside a cluster
    for (let i = 0; i < flattenedRows.length; i++) {
      const node = flattenedRows[i];
      const nextNode = flattenedRows[i + 1];
      const nextIsRoot = nextNode && nextNode._level === 0;
      const isLastRow = i === flattenedRows.length - 1;
  
      // A node is in a cluster if it is a parent OR a nested child (_level > 0)
      const isClusterNode = node._isParent || node._level > 0;
  
      if (isClusterNode && (nextIsRoot || isLastRow)) {
        node._isClusterEnd = true;
      } else {
        node._isClusterEnd = false;
      }
    }
  
    return flattenedRows;
  }


  // 2. Verify getRowClass Method
//getRowClass will assign standard 'row-child' to flat records, ensuring they receive 
// faint gray borders without any heavy blue borders:

readonly getRowClass = (p: any): string => {
    const d = p.data as EntityRowNode;
    if (d?._isParent) {
      return d._expanded ? 'row-parent-expanded' : 'row-parent-collapsed';
    }
    return d?._isClusterEnd ? 'row-child row-cluster-end' : 'row-child';
  };


  // 3. Verify SCSS Border DefinitionsEnsure your component SCSS styles standard rows with $1\text{px}$ light gray borders matching Image 29:

  /* Standard / Flat Non-Cluster Rows */
.ag-row.row-child {
    background-color: #ffffff !important;
    border-bottom: 1px solid #e0e0e0 !important;
    border-top: none !important;
  }
  
  /* Expanded Cluster Group Header: Top Blue Accent */
  .ag-row.row-parent-expanded {
    background-color: #E8F4FD !important;
    border-top: 2px solid #0079C1 !important;
    border-bottom: 1px solid #b8d9f0 !important;
  }
  
  /* Collapsed Cluster Parent Row */
  .ag-row.row-parent-collapsed {
    background-color: #ffffff !important;
    border-bottom: 1px solid #e0e0e0 !important;
  }
  
  /* Cluster End (Bottom of Expanded Cluster Group Only) */
  .ag-row.row-cluster-end {
    border-bottom: 2px solid #0079C1 !important;
  }