private syncHeaderCheckbox(): void {
    const nodes = this.allNodes();
    const sel = nodes.filter(n => n._selected).length;
    const state: 'none' | 'some' | 'all' = sel === 0 ? 'none' : sel === nodes.length ? 'all' : 'some';
    this.columnDefs[0] = { ...this.columnDefs[0], headerComponentParams: { ...this.columnDefs[0].headerComponentParams, state } };
    if (this.gridApi) {
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
    this.gridApi?.refreshHeader();
  }