//Replace lines 264 to 289 in multi-level-customer-grid.component.ts with this updated @Input() setter:

@Input() set deselectByOcifId(record: any | null) {
    if (!record) return;
    const targetKey = this.getSelectionKey(record);
    const ocifId = typeof record === 'string' ? record : (record.ocifId || record.proxyOcifId || record.ecifId);
    if (!targetKey && !ocifId) return;
  
    let changed = false;
    for (const node of this.allNodes()) {
      const sameComposite = targetKey && this.getSelectionKey(node) === targetKey;
      const sameOcifFallback = !targetKey && ocifId && (node['ocifId'] === ocifId || node['proxyOcifId'] === ocifId || node['ecifId'] === ocifId);
  
      // Unselect ONLY the exact matching node
      if ((sameComposite || sameOcifFallback) && node._selected) {
        node._selected = false;
        changed = true;
      }
    }
  
    if (changed) {
      // 1. Recompute parent/ancestor states up the tree (parents turn unselected/indeterminate)
      this.recomputeAncestors(this.tree);
      // 2. Sync the header checkbox state ('some' or 'none')
      this.syncHeaderCheckbox();
      // 3. Refresh AG Grid view
      this.refresh();
    }
  }