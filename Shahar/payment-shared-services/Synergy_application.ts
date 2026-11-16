import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import type { AccountRow, AddressRow } from '../../../mock-data';
import {
  ADDRESS_TYPE_BUSINESS,
  ADDRESS_TYPE_HOME,
  ADDRESS_TYPE_MAILING,
  ADDRESS_TYPE_ACCOUNT,
  ADDRESS_TYPE_LOCAL_OFFICE,
  ADDRESS_TYPE_PHYSICAL,
  type Address,
  type AddressType,
} from '../../../core/models/address.model';
import { AddressFacade } from '../../../core/facades/address.facade';
import { AccountFacade } from '../../../core/facades/account.facade';

const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  [ADDRESS_TYPE_HOME]: 'Home',
  [ADDRESS_TYPE_BUSINESS]: 'Business',
  [ADDRESS_TYPE_MAILING]: 'Mailing',
  [ADDRESS_TYPE_ACCOUNT]: 'Account',
  [ADDRESS_TYPE_LOCAL_OFFICE]: 'Local Office',
  [ADDRESS_TYPE_PHYSICAL]: 'Physical',
};

function formatAddress(addr: Address): string {
  const parts: string[] = [];

  const street = [addr.streetNumber, addr.streetName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (street) parts.push(street);

  const cityProv = [addr.city, addr.province || addr.state]
    .filter(Boolean)
    .join(', ');
  if (cityProv) parts.push(cityProv);

  const postal =
    addr.country === 'CA'
      ? addr.canadianPostalCode
      : addr.country === 'US'
        ? addr.usZipCode
        : addr.internationalPostalCode;
  if (postal) parts.push(postal);

  if (addr.country) parts.push(addr.country);

  return parts.join(' ');
}

function toAddressRow(addr: Address): AddressRow {
  return {
    id: addr.addressType,
    type: ADDRESS_TYPE_LABELS[addr.addressType] ?? addr.addressType,
    address: formatAddress(addr),
  };
}

@Component({
  selector: 'app-accounts-by-address',
  imports: [RouterModule, TranslateModule],
  templateUrl: './accounts-by-address.component.html',
  styleUrl: './accounts-by-address.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsByAddressComponent {
  private readonly addressFacade = inject(AddressFacade);
  private readonly accountFacade = inject(AccountFacade);

  readonly backRoute = '/account';

  readonly addresses: AddressRow[] = this.addressFacade
    .addresses()
    .map(toAddressRow)
    .filter(row => !!row.address);

  private readonly accounts: AccountRow[] = this.accountFacade.accounts().map(acc => ({
    accountType: acc.productNameEnglish || acc.productName || acc.productShortName || '',
    accountNumber: acc.arrangementId ?? '',
    // TODO: wire real association once backend confirms which field
    // links an account to an address (addressType code or similar).
    addressId: '',
  }));

  readonly selectedAddressId = signal<string>(this.addresses[0]?.id ?? '');
  readonly selectedAddressView = signal<boolean>(false);

  readonly visibleAccounts = computed(() =>
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