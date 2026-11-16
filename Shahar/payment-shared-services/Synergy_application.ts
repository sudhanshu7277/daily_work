//accounts-by-address.component.spec.ts

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
  let fixture: ComponentFixture<AccountsByAddressComponent>;
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
    country: 'CA',
    countryName: 'Canada',
  } as Address;

  const mockBusinessAddress: Address = {
    addressType: ADDRESS_TYPE_BUSINESS,
    streetNumber: '456',
    streetName: 'King St W',
    city: 'Toronto',
    province: 'ON',
    canadianPostalCode: 'M5V 2B2',
    country: 'CA',
    countryName: 'Canada',
  } as Address;

  const mockMailingAddress: Address = {
    addressType: ADDRESS_TYPE_MAILING,
    streetNumber: '789',
    streetName: 'Queen St E',
    city: 'Toronto',
    province: 'ON',
    canadianPostalCode: 'M4M 1H6',
    country: 'CA',
    countryName: 'Canada',
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

  beforeEach(async () => {
    addressesSignal.set(mockAddresses);
    accountsSignal.set(mockAccounts);
    ocifIdSignal.set('');
    ecifIdSignal.set('');
    partyContextSignal.set({ partyId: '', partyType: '', partyIdType: '' });

    loadAddressesMock = jest.fn().mockReturnValue(of([]));
    retrieveAccountsMock = jest.fn().mockReturnValue(of([]));
    getActivePartyContextMock = jest.fn().mockReturnValue(null);
    getResolvedEcifIdMock = jest.fn().mockReturnValue('');

    await TestBed.configureTestingModule({
      imports: [AccountsByAddressComponent, TranslateModule.forRoot()],
      declarations: [MockPipe(TranslatePipe, (key: string) => `Mocked: ${key}`)],
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
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsByAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      fixture.detectChanges();

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
      fixture.detectChanges();

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
      const rows = Array.from(
        fixture.nativeElement.querySelectorAll('.address-table tbody tr'),
      ) as HTMLElement[];

      expect(rows).toHaveLength(mockAddresses.length);
      expect(rows.map(row => row.querySelector('td')?.textContent?.trim())).toEqual([
        'Home',
        'Business',
        'Mailing',
      ]);
    });

    it('selects the first address by default', () => {
      expect(component.selectedAddressId()).toBe(ADDRESS_TYPE_HOME);
      expect(fixture.nativeElement.querySelectorAll('.address-table tbody tr.selected')).toHaveLength(1);
    });

    it('highlights the address row the user clicks', () => {
      const rows = Array.from(
        fixture.nativeElement.querySelectorAll('.address-table tbody tr'),
      ) as HTMLElement[];
      rows[1].click();
      fixture.detectChanges();

      expect(component.selectedAddressId()).toBe(ADDRESS_TYPE_BUSINESS);
      expect(rows[1].classList.contains('selected')).toBe(true);
      expect(rows[0].classList.contains('selected')).toBe(false);
    });
  });

  describe('selected address view toggle', () => {
    it('is off by default', () => {
      expect(component.selectedAddressView()).toBe(false);
      const toggle = fixture.nativeElement.querySelector('.toggle-btn') as HTMLElement;
      expect(toggle?.getAttribute('aria-checked')).toBe('false');
    });

    it('shows every account and highlights the associated ones while off', () => {
      component.selectAddress(ADDRESS_TYPE_HOME);
      fixture.detectChanges();

      expect(component.visibleAccounts()).toEqual(mockAccounts);

      const rows = Array.from(
        fixture.nativeElement.querySelectorAll('.accounts-table tbody tr'),
      ) as HTMLElement[];
      expect(rows).toHaveLength(mockAccounts.length);
      expect(rows[0].classList.contains('associated')).toBe(true);
      expect(rows[1].classList.contains('associated')).toBe(false);
    });

    it('filters the accounts table to the selected address when switched on', () => {
      component.selectAddress(ADDRESS_TYPE_BUSINESS);
      const toggle = fixture.nativeElement.querySelector('.toggle-btn') as HTMLElement;
      toggle.click();
      fixture.detectChanges();

      expect(component.selectedAddressView()).toBe(true);
      expect(component.visibleAccounts()).toEqual([mockBusinessAccount]);
      expect(fixture.nativeElement.querySelectorAll('.accounts-table tbody tr')).toHaveLength(1);
    });

    it('re-filters when a different address is selected while switched on', () => {
      component.toggleSelectedAddressView();
      component.selectAddress(ADDRESS_TYPE_HOME);
      fixture.detectChanges();

      expect(component.visibleAccounts()).toEqual([mockHomeAccount]);
    });

    it('shows an empty state when no account uses the selected address', () => {
      component.toggleSelectedAddressView();
      component.selectAddress(ADDRESS_TYPE_MAILING);
      fixture.detectChanges();

      expect(component.visibleAccounts()).toHaveLength(0);
      expect(fixture.nativeElement.querySelector('.accounts-table')).toBeNull();
      expect(fixture.nativeElement.querySelector('.no-accounts')).not.toBeNull();
    });
  });

  describe('navigation', () => {
    it('routes the back button to the accounts tab', () => {
      const btn = fixture.nativeElement.querySelector('.navigation-buttons button') as HTMLElement;
      expect(btn?.getAttribute('href')).toBeNull();
      expect(component.backRoute).toBe('/account');
    });
  });
});