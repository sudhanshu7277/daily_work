@Input() set deselectByOcifId(record: any | null) {
    if (!record) return;
    const targetKey = this.getSelectionKey(record);
    const ocifId = typeof record === 'string' ? record : (record.ocifId || record.proxyOcifId || record.ecifId);
    if (!targetKey && !ocifId) return;
  
    let changed = false;
    for (const node of this.allNodes()) {
      const sameComposite = targetKey && this.getSelectionKey(node) === targetKey;
      const sameOcifFallback = !targetKey && ocifId && (node['ocifId'] === ocifId || node['proxyOcifId'] === ocifId || node['ecifId'] === ocifId);
  
      if ((sameComposite || sameOcifFallback) && node._selected) {
        node._selected = false;
        changed = true;
  
        // If the unselected item is a cluster parent, cascade unselect to its descendants
        const kids = this.getChildren(node);
        if (node._isParent && kids.length) {
          this.setDescendantsSelected(kids, false);
        }
      }
    }
  
    if (changed) {
      // 1. Recompute parent states up the tree across all N-levels
      this.recomputeAncestors(this.tree);
      // 2. Sync table header checkbox state ('all', 'some', or 'none')
      this.syncHeaderCheckbox();
      // 3. Refresh AG Grid view
      this.refresh();
    }
  }