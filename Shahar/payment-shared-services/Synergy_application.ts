// complete ts file final


import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
    untracked,
  } from '@angular/core';
  import { AppStore } from '../../core/stores/app.store';
  import { RouterModule } from '@angular/router';
  import { TranslateModule } from '@ngx-translate/core';
  
  import { AccountFacade } from '../../core/facades/account.facade';
  import { AddressFacade, EnumPartyIdType } from '../../core/facades/address.facade';
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
  
  @Component({
    selector: 'app-accounts-by-address',
    imports: [RouterModule, TranslateModule],
    templateUrl: './accounts-by-address.component.html',
    styleUrl: './accounts-by-address.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class AccountsByAddressComponent {
    private readonly appStore = inject(AppStore);
    private readonly addressFacade = inject(AddressFacade);
    private readonly accountFacade = inject(AccountFacade);
  
    /** Route back to the Accounts tab of the contact information page. */
    readonly backRoute = '/account';
    private lastRequestedKey = '';
  
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
  
      effect(() => {
        const context = this.addressFacade.getActivePartyContext();
        const resolvedEcifId = this.addressFacade.getResolvedEcifId() || this.appStore.ecifId();
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
            this.accountFacade.retrieveAccounts({ force: true }).subscribe();
          }
        });
      });
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


  //accounts-by-address.component.spec.ts

  import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { type Spectator, createComponentFactory } from '@ngneat/spectator/jest';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MockPipe } from 'ng-mocks';
import { of } from 'rxjs';

import { AccountFacade } from '../../core/facades/account.facade';
import { AddressFacade, EnumPartyIdType } from '../../core/facades/address.facade';
import { type Account } from '../../core/models/account.model';
import {
  ADDRESS_TYPE_BUSINESS,
  ADDRESS_TYPE_HOME,
  ADDRESS_TYPE_MAILING,
  type Address,
} from '../../core/models/address.model';
import { AppStore } from '../../core/stores/app.store';
import { AccountsByAddressComponent } from './accounts-by-address.component';

describe('AccountsByAddressComponent', () => {
  let spectator: Spectator<AccountsByAddressComponent>;
  let component: AccountsByAddressComponent;

  const addressesSignal = signal<Address[]>([]);
  const accountsSignal = signal<Account[]>([]);
  const ocifIdSignal = signal<string>('');
  const ecifIdSignal = signal<string>('');
  const partyContextSignal = signal({ partyId: '', partyType: '', partyIdType: '' });

  let loadAddressesMock: jest.Mock;
  let retrieveAccountsMock: jest.Mock;
  let getActivePartyContextMock: jest.Mock;
  let getResolvedEcifIdMock: jest.Mock;

  const mockHomeAddress: Address = {
    addressType: ADDRESS_TYPE_HOME,
    streetNumber: '123',
    streetName: 'Main St',
    city: 'Toronto',
    province: 'ON',
    canadianPostalCode: 'M5V 1A1',
    country: 'Canada',
  } as Address;

  const mockBusinessAddress: Address = {
    addressType: ADDRESS_TYPE_BUSINESS,
    streetNumber: '456',
    streetName: 'King St W',
    city: 'Toronto',
    province: 'ON',
    canadianPostalCode: 'M5V 2B2',
    country: 'Canada',
  } as Address;

  const mockMailingAddress: Address = {
    addressType: ADDRESS_TYPE_MAILING,
    streetNumber: '789',
    streetName: 'Queen St E',
    city: 'Toronto',
    province: 'ON',
    canadianPostalCode: 'M4M 1H6',
    country: 'Canada',
  } as Address;

  const mockAddresses: Address[] = [
    mockHomeAddress,
    mockBusinessAddress,
    mockMailingAddress,
  ];

  const mockHomeAccount: Account = {
    id: 'acc-1',
    accountNumber: '1001-234',
    accountType: 'Chequing',
    address: { ...mockHomeAddress },
  } as unknown as Account;

  const mockBusinessAccount: Account = {
    id: 'acc-2',
    accountNumber: '2002-567',
    accountType: 'Savings',
    address: { ...mockBusinessAddress },
  } as unknown as Account;

  const mockAccounts: Account[] = [mockHomeAccount, mockBusinessAccount];

  const createComponent = createComponentFactory({
    component: AccountsByAddressComponent,
    declarations: [MockPipe(TranslatePipe, (key: string) => `Mocked: ${key}`)],
    imports: [TranslateModule],
    providers: [
      provideRouter([]),
      {
        provide: AppStore,
        useValue: {
          ocifId: ocifIdSignal,
          ecifId: ecifIdSignal,
          partyContext: partyContextSignal,
        },
      },
      {
        provide: AddressFacade,
        useValue: {
          addresses: addressesSignal,
          loadAddresses: (...args: unknown[]) => loadAddressesMock(...args),
          getActivePartyContext: (...args: unknown[]) => getActivePartyContextMock(...args),
          getResolvedEcifId: (...args: unknown[]) => getResolvedEcifIdMock(...args),
        },
      },
      {
        provide: AccountFacade,
        useValue: {
          accounts: accountsSignal,
          retrieveAccounts: (...args: unknown[]) => retrieveAccountsMock(...args),
        },
      },
    ],
  });

  beforeEach(() => {
    addressesSignal.set(mockAddresses);
    accountsSignal.set(mockAccounts);
    ocifIdSignal.set('');
    ecifIdSignal.set('');
    partyContextSignal.set({ partyId: '', partyType: '', partyIdType: '' });

    loadAddressesMock = jest.fn().mockReturnValue(of([]));
    retrieveAccountsMock = jest.fn().mockReturnValue(of([]));
    getActivePartyContextMock = jest.fn().mockReturnValue(null);
    getResolvedEcifIdMock = jest.fn().mockReturnValue('');

    spectator = createComponent();
    component = spectator.component;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('API data loading', () => {
    it('does not call APIs when no customer ID is present in AppStore', () => {
      expect(loadAddressesMock).not.toHaveBeenCalled();
      expect(retrieveAccountsMock).not.toHaveBeenCalled();
    });

    it('calls loadAddresses (OCIF) and retrieveAccounts when ocifId arrives', () => {
      ocifIdSignal.set('987654321');
      spectator.detectChanges();

      expect(loadAddressesMock).toHaveBeenCalledTimes(1);
      expect(loadAddressesMock).toHaveBeenCalledWith({
        partyId: '987654321',
        partyIdType: EnumPartyIdType.Ocif,
        partyType: undefined,
        inquiryLevel: 'FULL',
      });
      expect(retrieveAccountsMock).toHaveBeenCalledTimes(1);
      expect(retrieveAccountsMock).toHaveBeenCalledWith({ force: true });
    });

    it('prefers ECIF ID when ecifId is available', () => {
      ocifIdSignal.set('987654321');
      ecifIdSignal.set('ECIF-112233');
      getActivePartyContextMock.mockReturnValue({
        partyId: 'ECIF-112233',
        partyType: 'I',
        partyIdType: 'ECIF',
      });
      spectator.detectChanges();

      expect(loadAddressesMock).toHaveBeenCalledWith({
        partyId: 'ECIF-112233',
        partyIdType: EnumPartyIdType.Ecif,
        partyType: 'I',
        inquiryLevel: 'FULL',
      });
      expect(retrieveAccountsMock).toHaveBeenCalledWith({ force: true });
    });
  });

  describe('address table', () => {
    it('lists every customer address with its type', () => {
      const rows = spectator.queryAll('.address-table tbody tr');

      expect(rows).toHaveLength(mockAddresses.length);
      expect(rows.map(row => row.querySelector('td')?.textContent?.trim())).toEqual([
        'Home',
        'Business',
        'Mailing',
      ]);
    });

    it('selects the first address by default', () => {
      expect(component.selectedAddressId()).toBe(ADDRESS_TYPE_HOME);
      expect(spectator.queryAll('.address-table tbody tr.selected')).toHaveLength(1);
    });

    it('highlights the address row the user clicks', () => {
      spectator.click(spectator.queryAll('.address-table tbody tr')[1]);
      spectator.detectChanges();

      expect(component.selectedAddressId()).toBe(ADDRESS_TYPE_BUSINESS);
      const rows = spectator.queryAll('.address-table tbody tr');
      expect(rows[1]).toHaveClass('selected');
      expect(rows[0]).not.toHaveClass('selected');
    });
  });

  describe('selected address view toggle', () => {
    it('is off by default', () => {
      expect(component.selectedAddressView()).toBe(false);
      expect(spectator.query('.toggle-btn')).toHaveAttribute('aria-checked', 'false');
    });

    it('shows every account and highlights the associated ones while off', () => {
      component.selectAddress(ADDRESS_TYPE_HOME);
      spectator.detectChanges();

      expect(component.visibleAccounts()).toEqual(mockAccounts);

      const rows = spectator.queryAll('.accounts-table tbody tr');
      expect(rows).toHaveLength(mockAccounts.length);
      expect(rows[0]).toHaveClass('associated');
      expect(rows[1]).not.toHaveClass('associated');
    });

    it('filters the accounts table to the selected address when switched on', () => {
      component.selectAddress(ADDRESS_TYPE_BUSINESS);
      spectator.click('.toggle-btn');
      spectator.detectChanges();

      expect(component.selectedAddressView()).toBe(true);
      expect(component.visibleAccounts()).toEqual([mockBusinessAccount]);
      expect(spectator.queryAll('.accounts-table tbody tr')).toHaveLength(1);
    });

    it('re-filters when a different address is selected while switched on', () => {
      component.toggleSelectedAddressView();
      component.selectAddress(ADDRESS_TYPE_HOME);
      spectator.detectChanges();

      expect(component.visibleAccounts()).toEqual([mockHomeAccount]);
    });

    it('shows an empty state when no account uses the selected address', () => {
      component.toggleSelectedAddressView();
      component.selectAddress(ADDRESS_TYPE_MAILING);
      spectator.detectChanges();

      expect(component.visibleAccounts()).toHaveLength(0);
      expect(spectator.query('.accounts-table')).toBeNull();
      expect(spectator.query('.no-accounts')).toExist();
    });
  });

  describe('navigation', () => {
    it('routes the back button to the accounts tab', () => {
      expect(spectator.query('.navigation-buttons button')?.getAttribute('href')).toBeNull();
      expect(component.backRoute).toBe('/account');
    });
  });
});