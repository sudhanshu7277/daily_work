// deselect redorc from customer search grid when the record/records are deleted from selected profiles section

//customer-search-grid.component.ts — 2 additions:
//1. Add @Input() deselectOcifId after the existing inputs:

@Input() firstName = '';
@Input() lastName  = '';

// Parent passes an ocifId here whenever the user deletes a profile card.
// The grid deselects that record (and its parent/children) automatically.
@Input() set deselectByOcifId(ocifId: string | null) {
  if (!ocifId) return;
  this.deselectByOcif(ocifId);
}

// 2. Add deselectByOcif() private method — before emitSelected():

// ── Deselect by ocifId — called when parent deletes a profile card ──────────
// Deselects the matching node. If it's a child, also re-evaluates the parent.
// If it's a parent, deselects all its children too.
private deselectByOcif(ocifId: string): void {
    let changed = false;
  
    for (const n of this.tree) {
      if (n.ocifId === ocifId && n._selected) {
        n._selected = false;
        // Cascade to children
        (n.children ?? []).forEach(c => c._selected = false);
        changed = true;
      }
      // Check children
      for (const c of (n.children ?? [])) {
        if (c.ocifId === ocifId && c._selected) {
          c._selected  = false;
          // Bubble up — parent unchecks if any child is now unchecked
          n._selected  = false;
          changed = true;
        }
      }
    }
  
    if (changed) {
      this.refresh();
      this.emitSelected();
    }
  }



  // Parent component (wherever the profiles selected section lives) — emit the ocifId on delete:

  // In the parent component TS
selectedProfiles: CustomerNode[] = [];
deletedOcifId: string | null = null;

onProfileDeleted(profile: CustomerNode): void {
  // Remove from local list
  this.selectedProfiles = this.selectedProfiles.filter(
    p => p.ocifId !== profile.ocifId
  );
  // Signal the grid to deselect this record
  this.deletedOcifId = profile.ocifId;
  // Reset after one tick so the setter fires again if same id is deleted twice
  setTimeout(() => this.deletedOcifId = null, 0);
}

onGridSelectionChanged(rows: CustomerNode[]): void {
  this.selectedProfiles = rows;
}



// Parent component HTML:

<app-customer-search-grid
  [firstName]="firstName"
  [lastName]="lastName"
  [deselectByOcifId]="deletedOcifId"
  (selectionChanged)="onGridSelectionChanged($event)">
</app-customer-search-grid>

<!-- Profiles selected section -->
<div *ngFor="let profile of selectedProfiles">
  <span>{{ profile.legalName }}</span>
  <button (click)="onProfileDeleted(profile)">✕</button>
</div>


// below logic to deselct profiles from entity search grid when the record/records are deleted from selected profiles section

// Looking at the code from your images, here's the exact fix:
// legal-hold-shell.component.html — already has:

<app-selection-panel
  [selectedProfiles]="selectedList"
  (removeProfile)="handleRemoveProfile($event)"
  ...
>


// legal-hold-shell.component.ts — image 5, line 109-113, currently:

handleRemoveProfile(profile: any): void {
    if (this.resultsGrid) {
      this.resultsGrid.deselectRow(profile);
    }
  }

  // Change it to:

  handleRemoveProfile(profile: any): void {
    if (this.currentTab === 'customer' && this.resultsGrid) {
      this.resultsGrid.deselectRow(profile);
    }
    if (this.currentTab === 'entity' && this.entityAgGrid) {
      this.entityAgGrid.deselectRow(profile);  // ← add this
    }
  }

  // entity-grid-component.ts — add this method:

  deselectRow(profile: any): void {
    this.entityAgGrid.forEachNode(node => {
      if (node.data?.id === profile.id) {
        node.setSelected(false);
      }
    });
  }

  // caseversion logic

  Events() {
    const stepEvents = this.taskConfig.taskFunctions[StepsName.SCAN_REQUIRED_DOCUMENTS];
    stepEvents.continue = of(true).pipe(
      switchMap(() => {
        this.subscriptions.add(
          this.tasks$.subscribe((tasks) => {
            
            // Fix 1: Evaluates to 0/false if caseVersion is null, undefined, false, or ""
            this.canContinueActive = 
              tasks.filter((task) => this.caseVersion ? task.state === TaskStateNewCases.ACTIVE : TaskState.ACTIVE).length === 0;
  
            // Fix 2: Same clean falsy check applied here
            this.canContinueComplete = 
              tasks.filter((task) => this.caseVersion ? task.state === TaskStateNewCases.COMPLETE : TaskState.COMPLETE).length !== 0;
              
          })
        );
        
        return !this.canContinueActive || !this.canContinueComplete
          ? throwError(() => "error, can't progress to next step")
          : of(true);
      })
    );
    
    // ... remaining logic
  }


  // Coerces null, undefined, false, "" all strictly into the boolean literal: false
const isValidVersion = !!this.caseVersion; 

this.canContinueActive = tasks.filter((task) => 
  isValidVersion ? task.state === TaskStateNewCases.ACTIVE : TaskState.ACTIVE
).length === 0;

