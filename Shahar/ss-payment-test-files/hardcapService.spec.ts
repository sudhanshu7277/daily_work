import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hardcapService, verifyHardCap } from '../hardcapService';

describe('HardcapService', () => {
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

  it('should gracefully fallback to local threshold evaluation if backend returns 404/500/network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const res = await verifyHardCap('/api', {
      currency: 'USD',
      paymentAmount: 1000,
      applicationName: 'ADR',
      applicationModule: 'ADR'
    });

    expect(res.amountWithinLimit).toBe(true);
    expect(res.hardCapValue).toBe(1000000000);
  });

  it('should handle 400 Bad Request if limit violation payload is provided by backend', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ amountWithinLimit: false, hardCapValue: 20000 })
    } as any);

    const res = await hardcapService.verifyHardCap('/api', {
      currency: 'USD',
      paymentAmount: 50000,
      applicationName: 'ADR',
      applicationModule: 'ADR'
    });

    expect(res.amountWithinLimit).toBe(false);
    expect(res.hardCapValue).toBe(20000);
  });
});