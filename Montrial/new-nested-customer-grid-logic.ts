private flattenTree(): GridRow[] {
    const rows: GridRow[] = [];
    const walk = (nodes: GridRow[]) => {
      for (const n of nodes) {
        n._isClusterEnd = false;
        rows.push({ ...n });
        if (n._isParent) {
          if (n._expanded) {
            n.children!.forEach((c, idx) => {
              c._isClusterEnd = idx === n.children!.length - 1;
            });
            walk(n.children!);
          } else {
            rows[rows.length - 1]._isClusterEnd = true;
          }
        }
      }
    };
    walk(this.tree);
    return rows;
  }
  
  private findNode(uid: string, nodes: GridRow[] = this.tree, parent?: GridRow): { node: GridRow; parent?: GridRow } | null {
    for (const n of nodes) {
      if (n._uid === uid) return { node: n, parent };
      if (n.children?.length) {
        const found = this.findNode(uid, n.children, n);
        if (found) return found;
      }
    }
    return null;
  }
  
  private allNodes(): GridRow[] {
    const out: GridRow[] = [];
    const walk = (nodes: GridRow[]) => {
      for (const n of nodes) {
        out.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(this.tree);
    return out;
  }
  
  private emitSelected(): void {
    const selected: GridRow[] = [];
    const walk = (nodes: GridRow[]) => {
      for (const n of nodes) {
        if (n._selected) selected.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(this.tree);
    this.selectionChanged.emit({ identifier: 'customer', selected });
  }
  
  
  
  onCheckboxClick(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;
    const { node } = found;
    node._selected = !node._selected;
  
    const cascadeDown = (n: GridRow) => n.children?.forEach(c => { c._selected = n._selected; cascadeDown(c); });
    cascadeDown(node);
  
    // bubble up: walk full tree, recompute each ancestor's _selected from its own children
    const bubbleUp = (nodes: GridRow[]): boolean => {
      let touched = false;
      for (const n of nodes) {
        if (n.children?.length) {
          if (bubbleUp(n.children)) touched = true;
          n._selected = n.children.every(c => c._selected);
        }
        if (n._uid === uid || n.children?.some(c => c._uid === uid)) touched = true;
      }
      return touched;
    };
    bubbleUp(this.tree);
  
    this.refresh();
    this.emitSelected();
  }
  
  
  
  const sortRecursive = (nodes: GridRow[]) => {
    (nodes as any[]).sort(sortFn);
    nodes.forEach(n => { if (n._isParent && n.children?.length) sortRecursive(n.children); });
  };
  sortRecursive(this.tree);
  