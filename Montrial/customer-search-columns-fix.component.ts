//Step 1 — Shell, add allSelectedProfiles and fix handleSelectionChange:

allSelectedProfiles: any[] = [];

private prevSelections: any = { customer: [], entity: [], hold: [] };

private getKey = (p: any): string =>
  p.ocifId ?? p.ecifId ?? p.proxyOcifId ?? p.fileNetId ?? JSON.stringify(p);

handleSelectionChange(selectedRows: any): void {
  const source = selectedRows.identifier;
  const curr: any[] = selectedRows.selected || [];
  const prev: any[] = this.prevSelections[source] || [];

  // ADD newly checked
  curr.forEach(p => {
    if (!this.allSelectedProfiles.some(sp => this.getKey(sp) === this.getKey(p))) {
      this.allSelectedProfiles.push(p);
    }
  });

  // REMOVE explicitly unchecked — only when curr has items
  if (curr.length > 0 && prev.length > 0) {
    const currKeys = new Set(curr.map(this.getKey));
    prev.forEach(p => {
      if (!currKeys.has(this.getKey(p))) {
        const idx = this.allSelectedProfiles
          .findIndex(sp => this.getKey(sp) === this.getKey(p));
        if (idx > -1) this.allSelectedProfiles.splice(idx, 1);
      }
    });
  }

  // Update prev only when curr has items
  if (curr.length > 0) {
    this.prevSelections[source] = [...curr];
  }

  this.allSelectedProfiles = [...this.allSelectedProfiles];
  this.cdr.detectChanges();
}


//Step 2 — Shell template:

<app-selection-panel
  [selectedProfiles]="allSelectedProfiles"
  ...
>

//Step 3 — Panel ngOnChanges — remove lines 136-144 entirely:

ngOnChanges(changes: SimpleChanges): void {
    // DELETE everything inside — panel no longer accumulates
    // Shell manages selectedProfiles, panel just displays
    this.pruneInvalidProfileMarkers();
  }