// In legal-hold-shell.component.ts:

selectedProfiles: any[] = [];

// Called when any grid emits a selection change
onProfileSelected(profile: any): void {
  const key = profile.ocifId ?? profile.ecifId ?? profile.fileNetId;
  const exists = this.selectedProfiles.find(p => 
    (p.ocifId ?? p.ecifId ?? p.fileNetId) === key
  );
  if (!exists) {
    this.selectedProfiles = [...this.selectedProfiles, profile];
  }
}

onProfileDeselected(profile: any): void {
  const key = profile.ocifId ?? profile.ecifId ?? profile.fileNetId;
  this.selectedProfiles = this.selectedProfiles.filter(p => 
    (p.ocifId ?? p.ecifId ?? p.fileNetId) !== key
  );
}

// Shell template:

<app-selection-panel
  [selectedProfiles]="selectedProfiles"
  (removeProfile)="onProfileDeselected($event)">
</app-selection-panel>

// Panel ngOnChanges — delete everything, replace with nothing. Panel just renders selectedProfiles directly. No diffing, no tracking, no caching logic in panel.

//Grid emits — wire to shell:

<app-customer-search-grid
  (profileSelected)="onProfileSelected($event)"
  (profileDeselected)="onProfileDeselected($event)">
</app-customer-search-grid>