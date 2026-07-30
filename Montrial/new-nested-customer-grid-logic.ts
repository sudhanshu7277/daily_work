private mapPlayer = (p: any): any => ({
    profileName: p.profileName ?? '',
    ocifId: this.extractOcifId(p),
    status: mapLegalHoldStatusToUi(p.legalHoldStatus),
    holdName: p.holdName ?? p.legalHoldName ?? '',
    lifecycle: p.customerLifecycleStatus ?? 'N/A',
    roleType: p.roleType ?? '',
    address: this.formatAddress(p.address),
    customerStatus: p.customerLifecycleStatus ?? '',
    eDiscoveryProjectManager: p.eDiscoveryProjectManager ?? '',
    responsibleLawyerEmail: p.responsibleLawyerEmail ?? '',
    phoneNumber: p.phoneNumber ?? '',
    holdId: p.holdId ?? '',
    holdsIdPk: p.holdsIdPk ?? '',
    holdApplyDateTime: p.holdApplyDateTime ?? p.holdApplyDate ?? '',
    holdReleaseDate: p.holdReleaseDate ?? p.holdReleaseDateTime ?? '',
    holdLastUpdateDate: p.holdLastUpdateDate ?? p.holdLastUpdateDateTime ?? '',
    identifier: p.identifier ?? [],
    fileNetId: p.fileNetId ?? null,
    suspectProfile: p.suspectProfile === 'Yes',
    partyType: p.partyType ?? '',
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    dateOfBirth: p.dateOfBirth ?? '',
    isParent: Array.isArray(p.rolePlayers) && p.rolePlayers.length > 0,
    isExpanded: false,
    children: (p.rolePlayers ?? []).map((rp: any) => this.mapPlayer(rp)),
  });
  
  
  
  
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
  
  private findNode(
    uid: string,
    nodes: GridRow[] = this.tree,
    parent?: GridRow
  ): { node: GridRow; parent?: GridRow } | null {
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
  
    const cascadeDown = (n: GridRow) =>
      n.children?.forEach(c => { c._selected = n._selected; cascadeDown(c); });
    cascadeDown(node);
  
    const bubbleUp = (nodes: GridRow[]) => {
      for (const n of nodes) {
        if (n.children?.length) {
          bubbleUp(n.children);
          n._selected = n.children.every(c => c._selected);
        }
      }
    };
    bubbleUp(this.tree);
  
    this.refresh();
    this.emitSelected();
  }
  
  onSelectAll(select: boolean): void {
    const walk = (nodes: GridRow[]) => {
      for (const n of nodes) {
        n._selected = select;
        if (n.children?.length) walk(n.children);
      }
    };
    walk(this.tree);
    this.refresh();
    this.emitSelected();
  }
  
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
  