// Looking at the screenshot — the parent has onRemove(profile: any, index: number) and selectedProfiles array. The deleted profile object is available so we match on ocifId.
//Here are the exact changes, file by file:

// Parent component TS — 3 additions:
// 1. Add deletedOcifId property:

deletedOcifId: string | null = null;

// 2. Update onRemove — add two lines after deleteByIndex:

onRemove(profile: any, index: number): void {
    console.log('Removing item at index:', index);
  
    if (index !== undefined && index > -1) {
      this.deleteByIndex(this.selectedProfiles, index);
  
      // ← ADD THESE TWO LINES
      this.deletedOcifId = profile.ocifId;
      setTimeout(() => this.deletedOcifId = null, 0);
  
      if (this.selectedProfiles.length === 0) {
        this.removeCachedItems('profilesSelected');
        this.clearCache();
      }
  
      this.cdr.detectChanges();
    }
  }


  // 3. Add handler for grid selection:

  onGridSelectionChanged(rows: any[]): void {
    this.selectedProfiles = rows;
  }

  //Parent component HTML — bind to the grid:

  <app-customer-search-grid
  [firstName]="firstName"
  [lastName]="lastName"
  [deselectByOcifId]="deletedOcifId"
  (selectionChanged)="onGridSelectionChanged($event)">
</app-customer-search-grid>

//customer-search-grid.component.ts — 2 additions:
//1. Add @Input setter after existing inputs:

@Input() firstName = '';
@Input() lastName  = '';

// Receives an ocifId when parent deletes a profile card.
// Automatically deselects the matching row in the grid.
@Input() set deselectByOcifId(ocifId: string | null) {
  if (!ocifId) return;
  this.deselectByOcif(ocifId);
}

//2. Add deselectByOcif() private method before emitSelected():

// Deselects a row by ocifId.
// Parent node  → deselects itself and cascades to all children.
// Child node   → deselects itself and bubbles up to parent.
private deselectByOcif(ocifId: string): void {
    let changed = false;
  
    for (const n of this.tree) {
  
      // Parent match
      if (n.ocifId === ocifId && n._selected) {
        n._selected = false;
        (n.children ?? []).forEach(c => c._selected = false);
        changed = true;
      }
  
      // Child match
      for (const c of (n.children ?? [])) {
        if (c.ocifId === ocifId && c._selected) {
          c._selected = false;
          n._selected = false; // parent unchecked — not all children selected
          changed = true;
        }
      }
    }
  
    if (changed) {
      this.refresh();       // re-renders grid, syncs header checkbox
      this.emitSelected();  // keeps parent selectedProfiles in sync
    }
  }

  // flow

  User clicks ✕ on profile card
  → onRemove(profile, index)
  → deleteByIndex removes from selectedProfiles
  → deletedOcifId = profile.ocifId        triggers @Input setter on grid
  → deselectByOcif(ocifId)                walks tree, deselects match + cascade
  → refresh()                             grid re-renders, checkbox unchecked
  → emitSelected()                        parent selectedProfiles stays in sync
  → setTimeout → deletedOcifId = null     resets so same ocifId works next time



  /////// TRIM PAYLOAD LOGIC

  onSearch(): void {
    // 1. Double check validation criteria
    if (this.searchForm.invalid) {
      return;
    }
  
    // 2. Fetch raw key-value form object map snapshot
    const rawFormValue = this.searchForm.getRawValue();
  
    // 3. Dynamically iterate and trim all string attributes cleanly
    const trimmedPayload = Object.keys(rawFormValue).reduce((acc, key) => {
      const value = rawFormValue[key];
      // Trim string inputs, keep dates/null values intact
      acc[key] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {} as any);
  
    console.log('Cleaned Search Criteria Payload:', trimmedPayload);
  
    // 4. Emit the polished criteria up to your grid wrapper engine
    if (trimmedPayload.customerType === 'Individual') {
      this.searchTriggered.emit({ ...trimmedPayload, searchType: 'SEARCH_CUSTOMER' });
    } else if (trimmedPayload.customerType === 'entity') {
      this.searchTriggered.emit({ ...trimmedPayload, searchType: 'ENTITY_CUSTOMER' });
    }
  }


  // MAXIMUM LENGTH VALIDATION

  <div class="form-field-group">
  <label>{{ searchCustomerVerbiage.firstName | translate }}</label>
  <input class="advanced-inputs" 
         type="text" 
         formControlName="firstName" 
         maxlength="30" 
         placeholder="First Name" />
</div>

<div class="form-field-group">
  <label>{{ searchCustomerVerbiage.lastName | translate }}</label>
  <input class="advanced-inputs" 
         type="text" 
         formControlName="lastName" 
         maxlength="30" 
         placeholder="Last Name" />
</div>

<div class="form-field-group">
  <label>{{ searchCustomerVerbiage.cityOrTown | translate }}</label>
  <input class="advanced-inputs" 
         type="text" 
         formControlName="city" 
         maxlength="40" 
         placeholder="City/Town" />
</div>



