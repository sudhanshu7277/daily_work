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