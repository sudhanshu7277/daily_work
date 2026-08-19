import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hardcapService, verifyHardCap } from './hardcapService';

describe('HardcapService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return backend verification status when API call succeeds', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ amountWithinLimit: true, hardCapValue: 5000000 })
    } as any);

    const res = await hardcapService.verifyHardCap('/api', {
      currency: 'USD',
      paymentAmount: 50000,
      applicationName: 'ADR',
      applicationModule: 'ADR'
    });

    expect(res.amountWithinLimit).toBe(true);
    expect(res.hardCapValue).toBe(5000000);
  });

  it('should handle backend response when limit is exceeded', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ amountWithinLimit: false, hardCapValue: 10000 })
    } as any);

    const res = await hardcapService.verifyHardCap('/api', {
      currency: 'USD',
      paymentAmount: 50000,
      applicationName: 'ADR',
      applicationModule: 'ADR'
    });

    expect(res.amountWithinLimit).toBe(false);
  });

  it('should fallback to local limit evaluation when API fails or is offline', async () => {
    // Suppress expected console.warn in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const res = await verifyHardCap('/api', {
      currency: 'USD',
      paymentAmount: 1000,
      applicationName: 'ADR',
      applicationModule: 'ADR'
    });

    expect(res.amountWithinLimit).toBe(true);
    expect(res.hardCapValue).toBeGreaterThan(0);
  });
});