// 1 — GridRow interface — add one field:

_level?: number;

// 2 — stampTree — add level stamping (keep everything else in it as is):

private stampTree(nodes: GridRow[], parentUid: string, level: number = 0): void {
    nodes.forEach((n, i) => {
      n._uid = parentUid ? `${parentUid}-${i}` : `${i}`;
      n._level = level;                                   // ← ADD
      n._selected = false;
      n._isClusterEnd = false;
      if (n._isParent) this.stampTree(n.children!, n._uid, level + 1);  // ← pass level+1
    });
  }


  // (Keep any lines your current version has that I haven't shown — only add _level and the third parameter.)

//3 — flattenTree — replace entirely (one-level → recursive):

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

  // 4 — replace findNode with findNodePath (returns full ancestor chain):

  private findNodePath(uid: string, nodes: GridRow[] = this.tree, path: GridRow[] = []): GridRow[] | null {
    for (const n of nodes) {
      if (n._uid === uid) return [...path, n];
      if (n.children?.length) {
        const p = this.findNodePath(uid, n.children, [...path, n]);
        if (p) return p;
      }
    }
    return null;
  }
  
  private setSelectedDeep(n: GridRow, val: boolean): void {
    n._selected = val;
    (n.children ?? []).forEach(c => this.setSelectedDeep(c, val));
  }

  //5 — onCheckboxClick — replace body:

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


  // 6 — toggleExpand — replace body:

  toggleExpand(uid: string): void {
    const path = this.findNodePath(uid);
    if (!path) return;
    path[path.length - 1]._expanded = !path[path.length - 1]._expanded;
    this.refresh();
  }

  //7 — allNodes — replace body:

  private allNodes(): GridRow[] {
    const out: GridRow[] = [];
    const walk = (ns: GridRow[]) => ns.forEach(n => { out.push(n); walk(n.children ?? []); });
    walk(this.tree);
    return out;
  }

  // (emitSelected and syncHeaderCheckbox need no changes — they use allNodes().)

//8 — onSelectAll — replace body:

onSelectAll(select: boolean): void {
    this.tree.forEach(n => this.setSelectedDeep(n, select));
    this.refresh();
    this.emitSelected();
  }

  //9 — onSortChanged — make the children sort recursive (only change the forEach after the root sort):

  const sortChildren = (n: any) => {
    if (n.children?.length) {
      n.children.sort(sortFn);
      n.children.forEach(sortChildren);
    }
  };
  (this.tree as any[]).sort(sortFn);
  (this.tree as any[]).forEach(sortChildren);

  //10 — deselectByOcifId setter — replace body (X-button must reach any depth):

  @Input() set deselectByOcifId(ocifId: string | null) {
    if (!ocifId) return;
    const findByOcif = (nodes: GridRow[], path: GridRow[] = []): GridRow[] | null => {
      for (const n of nodes) {
        if (n.ocifId === ocifId) return [...path, n];
        if (n.children?.length) {
          const p = findByOcif(n.children, [...path, n]);
          if (p) return p;
        }
      }
      return null;
    };
    const path = findByOcif(this.tree);
    if (!path) return;
    this.setSelectedDeep(path[path.length - 1], false);
    for (let i = path.length - 2; i >= 0; i--) {
      path[i]._selected = (path[i].children ?? []).every((c: any) => c._selected);
    }
    this.refresh();
  }

  // 11 — NameCellComponent — indentation for nesting depth. In sync() add:

  this.level = (d as any)?._level ?? 0;

  //Add level = 0; as a class field, and on the outer name-cell div in its template:

  [style.paddingLeft.px]="level * 24"





  // complete onSortChnages func


  onSortChanged(): void {
    const sortState = this.gridApi?.getColumnState()
      .find(s => s.sort != null);
  
    if (!sortState) {
      this.currentPage = 1;
      this.refresh();
      return;
    }
  
    const field = sortState.colId;
    const dir   = sortState.sort as 'asc' | 'desc';
  
    const sortFn = (a: any, b: any) => {
      const valA = (a[field] ?? '').toLowerCase();
      const valB = (b[field] ?? '').toLowerCase();
      return dir === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    };
  
    // ─── REPLACE FROM HERE ───
    (this.tree as any[]).sort(sortFn);
  
    (this.tree as any[]).forEach((n: any) => {
      if (n._isParent && n.children?.length > 0) {
        n.children.sort(sortFn);
      }
    });
    // ─── TO HERE ───
  
    this.currentPage = 1;
    this.refresh();
  }