// LOCAL TESTING

//Exact Updated Code (accounts-by-address.component.ts)
// Add untracked to your @angular/core import (line 4):

import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
    untracked,
  } from '@angular/core';

  //Replace the constructor() block with this:

  private lastRequestedKey = '';

constructor() {
  // TEMPORARY LOCAL DEV SEED — runs once, remove before committing!
  if (!this.appStore.ocifId() && !this.appStore.ecifId() && !this.appStore.partyContext().partyId) {
    this.appStore.setAppContext({
      ocifId: 'YOUR_TEST_OCIF_ID', // <-- replace with your real test OCIF ID
    });
  }

  effect(() => {
    const list = this.addresses();
    const current = this.selectedAddressId();
    if (list.length > 0 && !list.some(row => row.id === current)) {
      this.selectedAddressId.set(list[0].id);
    } else if (list.length === 0 && current !== '') {
      this.selectedAddressId.set('');
    }
  });

  effect(() => {
    const context = this.addressFacade.getActivePartyContext();
    const resolvedEcifId = this.addressFacade.getResolvedEcifId();
    const ocifId = this.appStore.ocifId();
    const partyId = resolvedEcifId || context?.partyId || ocifId;

    if (!partyId && !ocifId) {
      return;
    }

    const requestKey = `${partyId}|${ocifId}`;
    if (this.lastRequestedKey === requestKey) {
      return;
    }
    this.lastRequestedKey = requestKey;

    untracked(() => {
      if (partyId) {
        this.addressFacade
          .loadAddresses({
            partyId,
            partyIdType: resolvedEcifId ? EnumPartyIdType.Ecif : EnumPartyIdType.Ocif,
            partyType: context?.partyType,
            inquiryLevel: 'FULL',
          })
          .subscribe();
      }

      if (ocifId) {
        this.accountFacade.retrieveAccounts().subscribe();
      }
    });
  });
}