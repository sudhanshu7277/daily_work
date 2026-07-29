// 🟢 FIXED: Include proxyOcifId AND hold/row identifiers so multi-hold records for the same customer remain distinct
const getId = (item: any) => {
  if (!item) return '';
  
  // Primary identifier: combination of customer key + hold identifier/name
  const customerId = item.proxyOcifId || item.ocifId || item.ecifId || item.uid || item.id;
  const holdKey = item._uid || item.rowId || item.legalHoldId || item.legalHoldName || item.holdApplyDateTime;

  if (customerId && holdKey) {
    return `${customerId}_${holdKey}`;
  }

  return customerId || item._uid || item.rowId || '';
};

///////


handleRemoveProfile(deselectedProfile: any): void {
  if (!deselectedProfile) return;

  const getId = (item: any) => {
    if (!item) return '';
    const customerId = item.proxyOcifId || item.ocifId || item.ecifId || item.uid || item.id;
    const holdKey = item._uid || item.rowId || item.legalHoldId || item.legalHoldName || item.holdApplyDateTime;
    return (customerId && holdKey) ? `${customerId}_${holdKey}` : (customerId || item._uid || '');
  };

  const targetId = getId(deselectedProfile);

  if (targetId) {
    this.selectedCustomerList = (this.selectedCustomerList || []).filter(p => getId(p) !== targetId);
    this.selectedEntityList = (this.selectedEntityList || []).filter(p => getId(p) !== targetId);
    this.selectedLegalHoldList = (this.selectedLegalHoldList || []).filter(p => getId(p) !== targetId);

    this.setStoredProfiles('selectedCustomerList', this.selectedCustomerList);
    this.setStoredProfiles('selectedEntityList', this.selectedEntityList);
    this.setStoredProfiles('selectedLegalHoldList', this.selectedLegalHoldList);

    this.cdr.detectChanges();
  }
}