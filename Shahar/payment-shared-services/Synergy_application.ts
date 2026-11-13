//1. src/app/pages/accounts-by-address/accounts-by-address.component.ts

//Lines 1–7 (Replace imports)
:

// OLD
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import type { AccountRow, AddressRow } from '../../mock-data';
import { MOCK_ADDRESSES, MOCK_ADDRESS_ACCOUNTS } from '../../mock-data';


// NEW:

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AccountFacade } from '../../core/facades/account.facade';
import { AddressFacade } from '../../core/facades/address.facade';
import { type Account } from '../../core/models/account.model';
import {
  ADDRESS_TYPE_BUSINESS,
  ADDRESS_TYPE_HOME,
  ADDRESS_TYPE_MAILING,
  ADDRESS_TYPE_PHYSICAL,
  type Address,
  type AddressType,
} from '../../core/models/address.model';
import { findAccountsSharingAddress } from '../../core/utils/related-accounts.util';


//Right above @Component (Line 8) (Add row interface, type maps, and address formatter)

//Add:

export interface AddressRowView {
    id: string;
    type: string;
    address: string;
    raw: Address;
  }
  
  const CUSTOMER_ADDRESS_TYPES: ReadonlySet<AddressType> = new Set([
    ADDRESS_TYPE_HOME,
    ADDRESS_TYPE_BUSINESS,
    ADDRESS_TYPE_PHYSICAL,
    ADDRESS_TYPE_MAILING,
  ]);
  
  const ADDRESS_TYPE_LABELS: Partial<Record<AddressType, string>> = {
    [ADDRESS_TYPE_HOME]: 'Home',
    [ADDRESS_TYPE_BUSINESS]: 'Business',
    [ADDRESS_TYPE_PHYSICAL]: 'Physical',
    [ADDRESS_TYPE_MAILING]: 'Mailing',
  };
  
  function formatFullAddress(addr: Address): string {
    const unit = [addr.unitType, addr.unitNumber]
      .map(part => part?.trim())
      .filter(Boolean)
      .join(' ');
    const street = [unit, addr.streetNumber?.trim(), addr.streetName?.trim()]
      .filter(Boolean)
      .join(' ');
    const city = addr.city?.trim() ?? '';
    const provinceOrState = (addr.province || addr.state || '').trim();
    const postal = (
      addr.canadianPostalCode ||
      addr.usZipCode ||
      addr.internationalPostalCode ||
      ''
    ).trim();
    const country = (addr.countryName || addr.country || '').trim();
  
    const regionAndPostal = [provinceOrState, postal].filter(Boolean).join(' ');
    const tail = [regionAndPostal, country].filter(Boolean).join(' ');
  
    return [street, city, tail].filter(Boolean).join(', ');
  }


  //Lines 15–46 (Replace class body inside AccountsByAddressComponent)

  //Old:

  export class AccountsByAddressComponent {
    /** Route back to the Accounts tab of the contact information page. */
    readonly backRoute = '/account';
  
    /** Only address types the customer actually has are listed. */
    readonly addresses: AddressRow[] = MOCK_ADDRESSES.filter(row => !!row.address);
  
    private readonly accounts: AccountRow[] = MOCK_ADDRESS_ACCOUNTS;
  
    readonly selectedAddressId = signal<string>(this.addresses[0]?.id ?? '');
  
    /** When on, the accounts table is filtered to the selected address only. */
    readonly selectedAddressView = signal<boolean>(false);
  
    readonly visibleAccounts = computed<AccountRow[]>(() =>
      this.selectedAddressView()
        ? this.accounts.filter(account => account.addressId === this.selectedAddressId())
        : this.accounts,
    );
  
    selectAddress(addressId: string): void {
      this.selectedAddressId.set(addressId);
    }
  
    toggleSelectedAddressView(): void {
      this.selectedAddressView.update(isOn => !isOn);
    }
  
    isAssociated(account: AccountRow): boolean {
      return account.addressId === this.selectedAddressId();
    }
  }
  

  //New:

  export class AccountsByAddressComponent implements OnInit {
    private readonly addressFacade = inject(AddressFacade);
    private readonly accountFacade = inject(AccountFacade);
  
    /** Route back to the Accounts tab of the contact information page. */
    readonly backRoute = '/account';
  
    /** Only customer address types the customer actually has are listed. */
    readonly addresses = computed<AddressRowView[]>(() =>
      this.addressFacade
        .addresses()
        .filter(raw => CUSTOMER_ADDRESS_TYPES.has(raw.addressType))
        .map(raw => ({
          id: raw.addressType,
          type: ADDRESS_TYPE_LABELS[raw.addressType] ?? raw.addressType,
          address: formatFullAddress(raw),
          raw,
        }))
        .filter(row => Boolean(row.address)),
    );
  
    readonly selectedAddressId = signal<string>('');
  
    /** When on, the accounts table is filtered to the selected address only. */
    readonly selectedAddressView = signal<boolean>(false);
  
    private readonly selectedAddress = computed<Address | undefined>(() =>
      this.addresses().find(row => row.id === this.selectedAddressId())?.raw,
    );
  
    private readonly associatedAccountIds = computed<Set<string>>(() => {
      const selected = this.selectedAddress();
      const allAccounts = this.accountFacade.accounts();
      if (!selected || !allAccounts.length) {
        return new Set<string>();
      }
      const matches = findAccountsSharingAddress(selected, allAccounts);
      return new Set(matches.map(account => account.id));
    });
  
    readonly visibleAccounts = computed<readonly Account[]>(() => {
      const allAccounts = this.accountFacade.accounts();
      if (!this.selectedAddressView()) {
        return allAccounts;
      }
      const associated = this.associatedAccountIds();
      return allAccounts.filter(account => associated.has(account.id));
    });
  
    constructor() {
      effect(() => {
        const list = this.addresses();
        const current = this.selectedAddressId();
        if (list.length > 0 && !list.some(row => row.id === current)) {
          this.selectedAddressId.set(list[0].id);
        } else if (list.length === 0 && current !== '') {
          this.selectedAddressId.set('');
        }
      });
    }
  
    ngOnInit(): void {
      const context = this.addressFacade.getActivePartyContext();
      if (context?.partyId) {
        this.addressFacade
          .loadAddresses({
            partyId: context.partyId,
            partyIdType: context.partyIdType,
            partyType: context.partyType,
            inquiryLevel: 'FULL',
          })
          .subscribe();
      }
  
      this.accountFacade.retrieveAccounts().subscribe();
    }
  
    selectAddress(addressId: string): void {
      this.selectedAddressId.set(addressId);
    }
  
    toggleSelectedAddressView(): void {
      this.selectedAddressView.update(isOn => !isOn);
    }
  
    isAssociated(account: Account): boolean {
      return this.associatedAccountIds().has(account.id);
    }
  }


  //2. src/app/pages/accounts-by-address/accounts-by-address.component.html
// Line 17 (Read addresses() as a signal)

//Old:

@for (row of addresses; track row.id) {


    //New:

    @for (row of addresses(); track row.id) {


//Lines 65–69 (Bind to Account properties id, type, number)

//Old:

@for (acc of visibleAccounts(); track acc.accountNumber) {
    <tr [class.associated]="isAssociated(acc)">
      <td>{{ acc.accountType }}</td>
      <td>{{ acc.accountNumber }}</td>
    </tr>
  }


  //New:

  @for (acc of visibleAccounts(); track acc.id) {
    <tr [class.associated]="isAssociated(acc)">
      <td>{{ acc.type }}</td>
      <td>{{ acc.number }}</td>
    </tr>
  }

  





