// 1. customer-search-grid.component.ts — add deselectByOcifId setter

@Input() set deselectByOcifId(ecifId: string | null) {
    if (!ecifId || !this.gridApi) return;
    this.gridApi.forEachNode(node => {
      if (node.data?.ocifId === ecifId) {
        node.setSelected(false);
      }
    });
  }

  //2. entity-grid.component.ts — add deselectByOcifId setter 

  @Input() set deselectByOcifId(ecifId: string | null) {
    if (!ecifId || !this.gridApi) return;
    this.gridApi.forEachNode(node => {
      if (node.data?.ocifId === ecifId) {
        node.setSelected(false);
      }
    });
  }

  // 3. hold-search-grid.component.ts — add deselectByOcifId setter

  @Input() set deselectByOcifId(ecifId: string | null) {
    if (!ecifId || !this.gridApi) return;
    this.gridApi.forEachNode(node => {
      if (node.data?.ocifId === ecifId) {
        node.setSelected(false);
      }
    });
  }

  // 4. legal-hold-shell.component.ts — update handleRemoveProfile

  deletedProfileEcifId: string | null = null;

handleRemoveProfile(deselectedProfile: any): void {
  console.log('deselectedProfile : ');
  console.log(deselectedProfile);

  // Uncheck from current grid (existing logic)
  this.gridApi?.forEachNode((node: { data: { ecifId: any }; setSelected: (arg0: boolean) => void }) => {
    if (node.data.ecifId === deselectedProfile.ecifId) {
      node.setSelected(false);
    }
  });

  // NEW: broadcast ecifId to all three grids via Input setter
  this.deletedProfileEcifId = deselectedProfile.ecifId;
  this.cdr.detectChanges();
  setTimeout(() => {
    this.deletedProfileEcifId = null;
    this.cdr.detectChanges();
  }, 0);
}

// 5. legal-hold-shell.component.html — pass deletedProfileEcifId to all three grids
//Find your three grid tags and add the [deselectByOcifId] binding:

<app-customer-search-grid
  [deselectByOcifId]="deletedProfileEcifId"
  (selectionChanged)="onCustomerSelectionChanged($event)">
</app-customer-search-grid>

<app-entity-grid
  [deselectByOcifId]="deletedProfileEcifId"
  (selectionChanged)="onEntitySelectionChanged($event)">
</app-entity-grid>

<app-hold-search-grid
  [deselectByOcifId]="deletedProfileEcifId"
  (selectionChanged)="onHoldSelectionChanged($event)">
</app-hold-search-grid>

