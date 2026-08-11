// 1. Update onHeaderCheckClick() in entity-grid.component.tsReplace onHeaderCheckClick() (around line 1227) with this logic. It evaluates all $N$-level nodes returned by allNodes() and bulk-sets _selected:

onHeaderCheckClick(): void {
    const all = this.allNodes(); // Recurses N-levels deep via getChildren()
    if (!all.length) return;
  
    // If every profile is already selected, deselect all; otherwise, select all
    const areAllSelected = all.every(n => n._selected);
    const targetState = !areAllSelected;
  
    // 1. Bulk update selection state across all N-level nodes
    all.forEach(node => {
      node._selected = targetState;
    });
  
    // 2. Sync header checkbox icon ('all' vs 'none')
    this.syncHeaderCheckbox();
  
    // 3. Re-flatten rows & update AG Grid view
    this.refresh();
  
    // 4. Emit updated selection array to side panel / host shell
    this.emitSelected();
  }


  // 2. Connect onHeaderCheckClick in initColumns() and syncHeaderCheckbox()
//Ensure columnDefs[0] passes onHeaderCheck pointing to onHeaderCheckClick() inside headerComponentParams:

// In initColumns() (around line 385):

this.columnDefs = [
    {
      field: 'profileName',
      headerName: 'Profile Name',
      headerComponent: NameHeaderComponent,
      headerComponentParams: {
        onHeaderCheck: () => this.onHeaderCheckClick(),
        state: 'none'
      },
      cellRenderer: NameCellComponent,
      cellRendererParams: {
        onCheck: (uid: string) => this.onCheckboxClick(uid),
        onToggle: (uid: string) => this.toggleExpand(uid)
      }
    },
    // ... remaining column definitions
  ];


  // In syncHeaderCheckbox() (line 877 in Image 22):
//Ensure syncHeaderCheckbox preserves onHeaderCheck when re-assigning headerComponentParams:

private syncHeaderCheckbox(): void {
    const nodes = this.allNodes();
    const sel = nodes.filter(n => n._selected).length;
    const state: 'none' | 'some' | 'all' = 
      sel === 0 ? 'none' : sel === nodes.length ? 'all' : 'some';
  
    this.columnDefs[0] = {
      ...this.columnDefs[0],
      headerComponentParams: {
        ...this.columnDefs[0].headerComponentParams,
        state,
        onHeaderCheck: () => this.onHeaderCheckClick()
      }
    };
  
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
    this.gridApi?.refreshHeader();
  }


  // 3. Header Component Click Handler (NameHeaderComponent)
//In NameHeaderComponent (or EntityNameHeaderComponent), make sure the header checkbox click event fires params.onHeaderCheck():

onCheckClick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.params?.onHeaderCheck) {
      this.params.onHeaderCheck();
    }
  }


  