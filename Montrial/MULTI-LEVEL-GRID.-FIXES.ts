// getChildren

private getChildren(node: EntityRowNode): EntityRowNode[] {
    if (Array.isArray(node.children) && node.children.length > 0) {
      return node.children;
    }
    if (Array.isArray(node.rolePlayers) && node.rolePlayers.length > 0) {
      return node.rolePlayers;
    }
    return [];
  }


  // 2. Update mapPlayer to Populate Both Array References
//Ensure mapPlayer assigns the mapped array to both children and rolePlayers:

private mapPlayer = (p: any): any => {
    const rawChildren = (Array.isArray(p.children) && p.children.length > 0)
      ? p.children
      : ((Array.isArray(p.rolePlayers) && p.rolePlayers.length > 0) ? p.rolePlayers : []);
  
    const hasChildren = rawChildren.length > 0;
    const mappedChildren = rawChildren.map((rp: any) => this.mapPlayer(rp));
  
    return {
      profileName: this.toTitleCase(p.profileName) ?? '',
      ocifId: this.extractOcifId(p),
      status: mapLegalHoldStatusToUi(p.legalHoldStatus),
      holdName: p.holdName ?? p.legalHoldName ?? '',
      lifecycle: p.customerLifecycleStatus ?? p.lifecycle ?? 'N/A',
      roleType: p.roleType ?? p.role ?? '',
      address: typeof p.address === 'string' ? p.address : (p.address?.addressLineOne || ''),
      isSuspect: p.isSuspectProfile === 'Yes' || p.isSuspect === true,
      eDiscoveryProjectManager: p.eDiscoveryProjectManager ?? '',
      responsibleLawyerEmail: p.responsibleLawyerEmail ?? '',
      holdApplyDateTime: p.holdApplyDateTime ?? p.holdAppliedDate ?? '',
      holdReleaseDate: p.holdReleaseDate ?? '',
      
      _isParent: hasChildren,
      _expanded: false,
      _selected: false,
      
      // Assign to both keys so any downstream method accesses the same tree
      children: mappedChildren,
      rolePlayers: mappedChildren
    };
  };


  // 3. Update Selection & Hierarchy Methods to Use getChildren
//Replace setDescendantsSelected, recomputeAncestors, stampTree, flattenTree, allNodes, findNode, and emitSelected with these versions:

onCheckboxClick(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;
    const { node } = found;
    node._selected = !node._selected;
  
    const children = this.getChildren(node);
    if (node._isParent && children.length) {
      this.setDescendantsSelected(children, node._selected);
    }
    this.recomputeAncestors(this.tree);
  
    this.refresh();
    this.emitSelected();
  }
  
  private setDescendantsSelected(nodes: EntityRowNode[], select: boolean): void {
    for (const n of nodes) {
      n._selected = select;
      const kids = this.getChildren(n);
      if (kids.length) {
        this.setDescendantsSelected(kids, select);
      }
    }
  }
  
  private recomputeAncestors(nodes: EntityRowNode[]): boolean {
    if (!nodes || !nodes.length) return true;
    let allSelected = true;
  
    for (const n of nodes) {
      const kids = this.getChildren(n);
      if (n._isParent && kids.length) {
        const allChildrenSelected = this.recomputeAncestors(kids);
        n._selected = allChildrenSelected;
      }
      if (!n._selected) {
        allSelected = false;
      }
    }
    return allSelected;
  }
  
  private stampTree(nodes: EntityRowNode[], parentUid: string, level = 0): void {
    if (!nodes) return;
    nodes.forEach((node, index) => {
      node._uid = parentUid ? `${parentUid}-${index}` : `r${index}`;
      node._level = level;
      
      const kids = this.getChildren(node);
      node._isParent = kids.length > 0;
      node._expanded = node._expanded ?? false;
      node._selected = node._selected ?? false;
      node._isClusterEnd = false;
  
      if (node._isParent && kids.length) {
        this.stampTree(kids, node._uid, level + 1);
      }
    });
  }
  
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
  
    for (let i = 0; i < flattenedRows.length; i++) {
      const nextIsRoot = flattenedRows[i + 1] && flattenedRows[i + 1]._level === 0;
      const isLastRow = i === flattenedRows.length - 1;
      if (nextIsRoot || isLastRow) {
        flattenedRows[i]._isClusterEnd = true;
      }
    }
  
    return flattenedRows;
  }
  
  private allNodes(): EntityRowNode[] {
    const out: EntityRowNode[] = [];
    const collect = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (const n of nodes) {
        out.push(n);
        const kids = this.getChildren(n);
        if (kids.length) {
          collect(kids);
        }
      }
    };
    collect(this.tree);
    return out;
  }
  
  private findNode(
    uid: string,
    nodes: EntityRowNode[] = this.tree,
    parent: EntityRowNode | null = null
  ): { node: EntityRowNode; parent: EntityRowNode | null } | null {
    if (!nodes) return null;
    for (const n of nodes) {
      if (n._uid === uid) return { node: n, parent };
      const kids = this.getChildren(n);
      if (kids.length) {
        const res = this.findNode(uid, kids, n);
        if (res) return res;
      }
    }
    return null;
  }
  
  private emitSelected(): void {
    const selected: EntityRowNode[] = [];
    const collect = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (const n of nodes) {
        if (n._selected) selected.push(n);
        const kids = this.getChildren(n);
        if (kids.length) collect(kids);
      }
    };
    collect(this.tree);
  
    this.selectionChanged.emit({
      identifier: 'entity',
      selected,
      selectedRows: selected,
      selectedClusters: []
    });
  }


  /// 1. Top-Down Deselection CascadeWhen a parent or root node is unchecked, setDescendantsSelected(children, false) uses getChildren() to recurse down through every nested branch, clearing _selected = false for every sub-child at depth $N$.

  private setDescendantsSelected(nodes: EntityRowNode[], select: boolean): void {
    for (const n of nodes) {
      n._selected = select;
      const kids = this.getChildren(n);
      if (kids.length) {
        this.setDescendantsSelected(kids, select); // Deselects all N-level descendants
      }
    }
  }


  // 2. Bottom-Up Ancestor Un-selection
//When a nested sub-child is unchecked, recomputeAncestors(this.tree) bubbles up through getChildren(). If any child node has _selected = false, the parent node's _selected state is automatically set to false.

private recomputeAncestors(nodes: EntityRowNode[]): boolean {
    if (!nodes || !nodes.length) return true;
    let allSelected = true;
  
    for (const n of nodes) {
      const kids = this.getChildren(n);
      if (n._isParent && kids.length) {
        const allChildrenSelected = this.recomputeAncestors(kids);
        n._selected = allChildrenSelected; // Parent becomes unselected if any child is unselected
      }
      if (!n._selected) {
        allSelected = false;
      }
    }
    return allSelected;
  }


  //// Complete Traversal & Selection Implementation
//Here is the complete set of tree handling and selection methods using getChildren() to paste directly into your component:


onCheckboxClick(uid: string): void {
    const found = this.findNode(uid);
    if (!found) return;
    const { node } = found;
    node._selected = !node._selected;
  
    const children = this.getChildren(node);
    if (node._isParent && children.length) {
      this.setDescendantsSelected(children, node._selected);
    }
    this.recomputeAncestors(this.tree);
  
    this.refresh();
    this.emitSelected();
  }
  
  private setDescendantsSelected(nodes: EntityRowNode[], select: boolean): void {
    for (const n of nodes) {
      n._selected = select;
      const kids = this.getChildren(n);
      if (kids.length) {
        this.setDescendantsSelected(kids, select);
      }
    }
  }
  
  private recomputeAncestors(nodes: EntityRowNode[]): boolean {
    if (!nodes || !nodes.length) return true;
    let allSelected = true;
  
    for (const n of nodes) {
      const kids = this.getChildren(n);
      if (n._isParent && kids.length) {
        const allChildrenSelected = this.recomputeAncestors(kids);
        n._selected = allChildrenSelected;
      }
      if (!n._selected) {
        allSelected = false;
      }
    }
    return allSelected;
  }
  
  private stampTree(nodes: EntityRowNode[], parentUid: string, level = 0): void {
    if (!nodes) return;
    nodes.forEach((node, index) => {
      node._uid = parentUid ? `${parentUid}-${index}` : `r${index}`;
      node._level = level;
      
      const kids = this.getChildren(node);
      node._isParent = kids.length > 0;
      node._expanded = node._expanded ?? false;
      node._selected = node._selected ?? false;
      node._isClusterEnd = false;
  
      if (node._isParent && kids.length) {
        this.stampTree(kids, node._uid, level + 1);
      }
    });
  }
  
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
  
    for (let i = 0; i < flattenedRows.length; i++) {
      const nextIsRoot = flattenedRows[i + 1] && flattenedRows[i + 1]._level === 0;
      const isLastRow = i === flattenedRows.length - 1;
      if (nextIsRoot || isLastRow) {
        flattenedRows[i]._isClusterEnd = true;
      }
    }
  
    return flattenedRows;
  }
  
  private allNodes(): EntityRowNode[] {
    const out: EntityRowNode[] = [];
    const collect = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (const n of nodes) {
        out.push(n);
        const kids = this.getChildren(n);
        if (kids.length) {
          collect(kids);
        }
      }
    };
    collect(this.tree);
    return out;
  }
  
  private findNode(
    uid: string,
    nodes: EntityRowNode[] = this.tree,
    parent: EntityRowNode | null = null
  ): { node: EntityRowNode; parent: EntityRowNode | null } | null {
    if (!nodes) return null;
    for (const n of nodes) {
      if (n._uid === uid) return { node: n, parent };
      const kids = this.getChildren(n);
      if (kids.length) {
        const res = this.findNode(uid, kids, n);
        if (res) return res;
      }
    }
    return null;
  }
  
// emit function

private emitSelected(): void {
    const selected: EntityRowNode[] = [];
    const selectedClusters: EntityRowNode[][] = [];
  
    // 1. Collect all checked profiles (individual or clustered)
    const collect = (nodes: EntityRowNode[]) => {
      if (!nodes) return;
      for (const n of nodes) {
        if (n._selected) selected.push(n);
        const kids = this.getChildren(n);
        if (kids.length) collect(kids);
      }
    };
    collect(this.tree);
  
    // 2. Group fully selected root clusters
    for (const root of this.tree) {
      if (root._selected) {
        const clusterNodes: EntityRowNode[] = [];
        const collectCluster = (nodes: EntityRowNode[]) => {
          for (const n of nodes) {
            clusterNodes.push(n);
            const kids = this.getChildren(n);
            if (kids.length) collectCluster(kids);
          }
        };
        collectCluster([root]);
        selectedClusters.push(clusterNodes);
      }
    }
  
    this.selectionChanged.emit({
      identifier: 'entity',
      selected,
      selectedRows: selected,
      selectedClusters
    });
  }


