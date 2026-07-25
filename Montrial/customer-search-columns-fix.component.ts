
// new props
// Add to class (3 lines):
private prevCustSel: any[] = [];
private prevEntitySel: any[] = [];
private prevHoldSel: any[] = [];

// Customer block — tweak only the assignment line:

if(selectedRows.identifier === 'customer') {
    const newCustData = selectedRows.selected;
    // Remove unchecked items from current search session
    if (this.prevCustSel.length > 0) {
      const currKeys = new Set(newCustData.map((p: any) => p.ocifId));
      this.selectedCustomerList = this.selectedCustomerList.filter((sp: any) =>
        !this.prevCustSel.some((p: any) => p.ocifId === sp.ocifId) || currKeys.has(sp.ocifId)
      );
    }
    // Add new items only
    const toAdd = newCustData.filter((p: any) =>
      !this.selectedCustomerList.some((sp: any) => sp.ocifId === p.ocifId));
    this.selectedCustomerList = [...this.selectedCustomerList, ...toAdd];
    this.prevCustSel = [...newCustData];
    this.cacheIndividualAndEntityProfiles('selectedCustomerList', this.selectedCustomerList);
  }

  //Entity block — same pattern:

  if(selectedRows.identifier === 'entity') {
    const newEntityData = selectedRows.selected;
    if (this.prevEntitySel.length > 0) {
      const currKeys = new Set(newEntityData.map((p: any) => p.ocifId));
      this.selectedEntityList = this.selectedEntityList.filter((sp: any) =>
        !this.prevEntitySel.some((p: any) => p.ocifId === sp.ocifId) || currKeys.has(sp.ocifId)
      );
    }
    const toAdd = newEntityData.filter((p: any) =>
      !this.selectedEntityList.some((sp: any) => sp.ocifId === p.ocifId));
    this.selectedEntityList = [...this.selectedEntityList, ...toAdd];
    this.prevEntitySel = [...newEntityData];
    this.cacheIndividualAndEntityProfiles('selectedEntityList', this.selectedEntityList);
  }

  //Hold block — same pattern:

  if(selectedRows.identifier === 'hold') {
    const newHoldData = selectedRows.selected;
    if (this.prevHoldSel.length > 0) {
      const currKeys = new Set(newHoldData.map((p: any) => p.ocifId));
      this.selectedLegalHoldList = this.selectedLegalHoldList.filter((sp: any) =>
        !this.prevHoldSel.some((p: any) => p.ocifId === sp.ocifId) || currKeys.has(sp.ocifId)
      );
    }
    const toAdd = newHoldData.filter((p: any) =>
      !this.selectedLegalHoldList.some((sp: any) => sp.ocifId === p.ocifId));
    this.selectedLegalHoldList = [...this.selectedLegalHoldList, ...toAdd];
    this.prevHoldSel = [...newHoldData];
    this.cacheIndividualAndEntityProfiles('selectedLegalHoldList', this.selectedLegalHoldList);
  }

