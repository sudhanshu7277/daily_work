// In multi-level-customer-grid.component.ts, update onCheckboxClick:

onCheckboxClick(uid: string): void {
  const found = this.findNode(uid);
  if (!found) return;
  const { node } = found;
  node._selected = !node._selected;

  const children = this.getChildren(node);
  if (node._isParent && children.length) {
    this.setDescendantsSelected(children, node._selected);
  }

  this.refresh();
  this.emitSelected();

  // Re-apply auto-sizing just like toggleExpand and onGridReady do
  setTimeout(() => {
    this.gridApi?.autoSizeColumns(['profileName'], false);
  });
}


// And in onHeaderCheckClick (lines 546–558 in image_38.png):

onHeaderCheckClick(): void {
  const all = this.allNodes();
  if (!all.length) return;
  const areAllSelected = all.every(n => n._selected);
  const shouldSelect = !areAllSelected;
  all.forEach(node => {
    node._selected = shouldSelect;
  });

  this.refresh();
  this.syncHeaderCheckbox();
  this.emitSelected();

  // Re-apply auto-sizing so header select-all does not blow out the column width
  setTimeout(() => {
    this.gridApi?.autoSizeColumns(['profileName'], false);
  });
}