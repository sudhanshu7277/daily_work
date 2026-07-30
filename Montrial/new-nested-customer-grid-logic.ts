// 1 — GridRow interface
interface GridRow {
    _uid: string;
    _level: number;
    _isParent: boolean;
    _expanded: boolean;
    _selected: boolean;
    _isClusterEnd: boolean;
    children?: GridRow[];
    [key: string]: any;
  }
  
  // 2 — stampTree (arbitrary depth, computes _isParent fresh every time)
  private stampTree(nodes: GridRow[], parentUid: string, level: number = 0): void {
    nodes.forEach((n, i) => {
      n._uid = parentUid ? `${parentUid}-${i}` : `${i}`;
      n._level = level;
      n._isParent = Array.isArray(n.children) && n.children.length > 0;
      n._expanded = (n as any).isExpanded ?? false;
      n._selected = false;
      n._isClusterEnd = false;
      if (n._isParent) this.stampTree(n.children!, n._uid, level + 1);
    });
  }
  
  // 3 — flattenTree (recursive walk, any depth)
  private flattenTree(): GridRow[] {
    const rows: GridRow[] = [];
    const walk = (nodes: GridRow[]) => {
      for (const n of nodes) {
        n._isClusterEnd = false;
        rows.push({ ...n });
        if (n._isParent && n._expanded) walk(n.children!);
      }
    };
    for (const root of this.tree) {
      walk([root]);
      if (rows.length) rows[rows.length - 1]._isClusterEnd = true;
    }
    return rows;
  }
  
  // 4 — findNodePath (returns full ancestor chain, any depth)
  private findNodePath(uid: string, nodes: GridRow[] = this.tree, path: GridRow[] = []): GridRow[] | null {
    for (const n of nodes) {
      if (n._uid === uid) return [...path, n];
      if (n.children?.length) {
        const found = this.findNodePath(uid, n.children, [...path, n]);
        if (found) return found;
      }
    }
    return null;
  }
  
  // 5 — setSelectedDeep (cascades a selection state to every descendant)
  private setSelectedDeep(n: GridRow, val: boolean): void {
    n._selected = val;
    (n.children ?? []).forEach(c => this.setSelectedDeep(c, val));
  }
  
  // 6 — onCheckboxClick (individual record OR whole cluster, any depth, bubbles state up)
  onCheckboxClick(uid: string): void {
    const path = this.findNodePath(uid);
    if (!path) return;
    const node = path[path.length - 1];
    this.setSelectedDeep(node, !node._selected);
    for (let i = path.length - 2; i >= 0; i--) {
      path[i]._selected = (path[i].children ?? []).every((c: any) => c._selected);
    }
    this.refresh();
    this.emitSelected();
  }
  
  // 7 — toggleExpand
  toggleExpand(uid: string): void {
    const path = this.findNodePath(uid);
    if (!path) return;
    path[path.length - 1]._expanded = !path[path.length - 1]._expanded;
    this.refresh();
  }
  
  // 8 — allNodes (feeds emitSelected / syncHeaderCheckbox, unchanged callers)
  private allNodes(): GridRow[] {
    const out: GridRow[] = [];
    const walk = (ns: GridRow[]) => ns.forEach(n => { out.push(n); walk(n.children ?? []); });
    walk(this.tree);
    return out;
  }
  
  // 9 — onSelectAll (header checkbox — every root and every descendant)
  onSelectAll(select: boolean): void {
    this.tree.forEach(n => this.setSelectedDeep(n, select));
    this.refresh();
    this.emitSelected();
  }
  
  // 10 — onSortChanged (single clean recursive version — no partial-level ambiguity this time)
  onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState().find(s => s.sort != null);
    if (!sortState) {
      this.currentPage = 1;
      this.refresh();
      return;
    }
    const field = sortState.colId;
    const dir = sortState.sort as 'asc' | 'desc';
    const sortFn = (a: any, b: any) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    };
    const sortRecursive = (nodes: GridRow[]) => {
      (nodes as any[]).sort(sortFn);
      nodes.forEach(n => { if (n._isParent && n.children?.length) sortRecursive(n.children); });
    };
    sortRecursive(this.tree);
    this.currentPage = 1;
    this.refresh();
  }
  
  // 11 — deselectByOcifId (X-button, must reach any depth)
  @Input() set deselectByOcifId(ocifId: string | null) {
    if (!ocifId) return;
    const path = this.findPathByOcifId(ocifId);
    if (!path) return;
    this.setSelectedDeep(path[path.length - 1], false);
    for (let i = path.length - 2; i >= 0; i--) {
      path[i]._selected = (path[i].children ?? []).every((c: any) => c._selected);
    }
    this.refresh();
  }
  
  private findPathByOcifId(ocifId: string, nodes: GridRow[] = this.tree, path: GridRow[] = []): GridRow[] | null {
    for (const n of nodes) {
      if (n.ocifId === ocifId) return [...path, n];
      if (n.children?.length) {
        const found = this.findPathByOcifId(ocifId, n.children, [...path, n]);
        if (found) return found;
      }
    }
    return null;
  }

  // 12 — NameCellComponent — indentation by depth
level = 0;
// in sync():
this.level = (d as any)?._level ?? 0;


<!-- outer name-cell div -->
[style.paddingLeft.px]="level * 24"
<!-- chevron -->
*ngIf="_isParent"