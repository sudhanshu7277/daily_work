// Step 1 — Add flag to CustomerSearchGridComponent:


preserveGrid = false; // ← ADD as class property

// Step 2 — Guard ngOnChanges:

ngOnChanges(changes: SimpleChanges): void {
    if (this.preserveGrid) {
      this.preserveGrid = false; // reset for next time
      return;                    // skip re-processing — keep grid as is
    }
    if (changes['customerGridData'] && 
        this.customerGridData && 
        this.customerGridData.length) {
      // ... rest of existing code unchanged
    }
  }

  // Step 3 — In legal-hold-shell.component.ts, set the flag BEFORE calling loadCachedIndividualAndEntityProfiles:

  displayHistoryMsgOnTop(msg: any): void {
    if (msg.showHistoryMsg) {
      const appRoot = document.querySelector('app-root');
      if (appRoot) appRoot.removeAttribute('aria-hidden');
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // Tell the grid not to re-process on next ngOnChanges
      if (this.customerSearchGridRef) {
        this.customerSearchGridRef.preserveGrid = true; // ← ADD
      }
      
      this.loadCachedIndividualAndEntityProfiles();
      this.checkInHistoryMsg = true;
      this.cdr.detectChanges();
    }
  }