import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addressService } from '../addressService';

describe('AddressService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call debtor address lookup endpoint with proper body', async () => {
    const mockResponse = {
      addressLine: ['25 Canada Square'],
      townName: 'London',
      countryCode: 'GB'
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as any);

    const result = await addressService.lookupDebtorAddress('/api', {
      account: '8378339123456789',
      bic: 'CITIGB2LXXX',
      countryCode: 'GB'
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/debtor/address-lookup', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        account: '8378339123456789',
        bic: 'CITIGB2LXXX',
        countryCode: 'GB'
      })
    }));
    expect(result.townName).toBe('London');
  });

  it('should call creditor address lookup endpoint with proper body', async () => {
    const mockResponse = {
      addressLine: ['388 Greenwich Street'],
      townName: 'New York',
      countryCode: 'US'
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as any);

    const result = await addressService.lookupCreditorAddress('/api', {
      account: '998877665544',
      bic: 'CITIUS33XXX',
      countryCode: 'US',
      shortCode: '021000021'
    });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/creditor/address-lookup', expect.objectContaining({
      method: 'POST'
    }));
    expect(result.countryCode).toBe('US');
  });

  it('should support legacy alias methods lookupCreditorAddesss and lookupDebtorAddresss', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'OK' })
    } as any);

    const r1 = await addressService.lookupCreditorAddesss('/api', { bic: 'CITIUS33', countryCode: 'US' });
    const r2 = await addressService.lookupDebtorAddresss('/api', { account: '123', bic: 'CITIUS33', countryCode: 'US' });
    expect(r1).toBeDefined();
    expect(r2).toBeDefined();
  });
});