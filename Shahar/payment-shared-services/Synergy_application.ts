//src/app/pages/business-address/business-address.component.ts (or in AddressPageBase so all child pages inherit it):   

import { ADDRESS_TYPE_BUSINESS, AddressCountry, type Address } from '../../core/models/address.model';

// Inside the class:
readonly AddressCountry = AddressCountry;


//src/app/pages/business-address/business-address.component.html:   

<!-- Search address section -->
<app-search-address-section
  *ngIf="activeForm.get('country')?.value !== AddressCountry.Other"
  [parentForm]="activeForm"
></app-search-address-section>



////

//Exact Change in src/app/core/validators/address-field.validators.ts (Lines 92–93)

export const ALPHA_NUMERIC_PLUS_WITH_SLASH_PATTERN =
  /^[A-Za-z0-9éèêëàâäîïôöùûüÿçÇÉÈÊËÀÂÄÎÏÔÖÙÛÜŸÇÎÔÛ .'\-/]*$/;