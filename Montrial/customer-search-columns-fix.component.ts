//Looking at the current handleSelectionChange (image 1), the only issue is duplicates. The simplest tweak — just add a duplicate check before spreading:

// Change lines 1117-1118 for customer:
// BEFORE
this.selectedCustomerList = [...this.selectedCustomerList, ...newCustData];

// AFTER
const newCustItems = newCustData.filter((p: any) => 
  !this.selectedCustomerList.some((sp: any) => sp.ocifId === p.ocifId));
this.selectedCustomerList = [...this.selectedCustomerList, ...newCustItems];


// Change line 1124 for entity:

// BEFORE
this.selectedEntityList = [...this.selectedEntityList, ...newEntityData];

// AFTER
const newEntityItems = newEntityData.filter((p: any) => 
  !this.selectedEntityList.some((sp: any) => sp.ocifId === p.ocifId));
this.selectedEntityList = [...this.selectedEntityList, ...newEntityItems];


// Change line 1131 for hold:

// BEFORE
this.selectedLegalHoldList = [...this.selectedLegalHoldList, ...newLegalHoldData];

// AFTER
const newHoldItems = newLegalHoldData.filter((p: any) => 
  !this.selectedLegalHoldList.some((sp: any) => sp.ocifId === p.ocifId));
this.selectedLegalHoldList = [...this.selectedLegalHoldList, ...newHoldItems];

