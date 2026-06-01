// Step 1: Update the Selection Panel Component (selection-panel.component.ts)
//Add an @Output() event emitter property at the top of 
//your class definition, and trigger it inside your existing onRemove utility method.


// 1. Ensure Output & EventEmitter are imported from '@angular/core'
@Output() profileDeselected = new EventEmitter<any>();

onRemove(profile: any, index: number): void {
  console.log('Removing item at index:', index);
  
  if (index !== undefined && index > -1) {
    // Fire the output event payload up before splicing the element array instance
    this.profileDeselected.emit(profile);

    this.deleteByIndex(this.selectedProfiles, index);
    
    if (this.selectedProfiles.length === 0) {
      this.removeCachedItems('profilesSelected');
      this.clearCache();
    } else {
      // Keep remaining entries synchronized in local cache storage
      this.saveToCache('profilesSelected', this.selectedProfiles);
    }
    
    this.cdr.detectChanges();
  }
}


// Step 2: Bind the Event in the Parent Template (manage-legal-hold.component.html)
//Locate where your <app-selection-panel> element tag is embedded in your main dashboard
//  layout screen view. Hook into our brand new output property binding parameter link:

<app-selection-panel 
  [selectedProfiles]="selectedProfilesList"
  (profileDeselected)="handleSidebarDeselection($event)">
</app-selection-panel>


// Step 3: Clear Grid Rows inside the Parent Controller (manage-legal-hold.component.ts)
//Depending on whether your team uses AG-Grid or a custom Angular Material Data Table component inside your c
//ustomer-search-grid, you need to toggle that specific model row reference to false.


handleSidebarDeselection(deselectedProfile: any): void {
    // Loop through grid nodes to find the matching customer ID
    this.gridApi.forEachNode((node) => {
      if (node.data.ecifId === deselectedProfile.ecifId) {
        node.setSelected(false); // Unchecks row selection instantly in UI
      }
    });
  }
