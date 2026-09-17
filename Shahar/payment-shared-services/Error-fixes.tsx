// 1. Rewrite src/pages/ss-payment/services/hardcapService.ts
// Replace the entire content of hardcapService.ts with:


import { VerifyHardCapRequest, HardcapCheckResponse } from '../types/models';

export interface HardcapServiceConfig {
  defaultHardcapLimit?: number;
  timeoutMs?: number;
}

class HardcapService {
  private requestTimeout: number = 10000;

  public setConfig(config: HardcapServiceConfig): void {
    if (config.timeoutMs !== undefined) {
      this.requestTimeout = config.timeoutMs;
    }
  }

  /**
   * Directly executes real hard-cap verification against the gateway.
   * Throws errors upstream on failure rather than returning mock/fallback data.
   */
  public async verifyHardCap(
    baseUrl: string,
    request: VerifyHardCapRequest
  ): Promise<HardcapCheckResponse> {
    // Normalizes URL and guarantees exact target without duplicate path segments
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const endpoint = cleanBaseUrl.endsWith('/hard-cap')
      ? cleanBaseUrl
      : `${cleanBaseUrl}/hard-cap`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include', // Guarantees browser session cookies are passed to avoid 403 Forbidden
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          currency: request.currency || 'USD',
          paymentAmount: Number(request.paymentAmount) || 0,
          applicationName: request.applicationName || 'GAB',
          applicationModule: request.applicationModule || 'GAB-LATAM',
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Handle non-2xx HTTP responses explicitly
      if (!response.ok) {
        let errorDetails = '';
        try {
          const errJson = await response.json();
          errorDetails = errJson?.message || JSON.stringify(errJson);
        } catch {
          errorDetails = await response.text();
        }
        throw new Error(
          `Hardcap endpoint error (${response.status}): ${errorDetails || response.statusText}`
        );
      }

      const data = await response.json();

      return {
        amountWithinLimit: Boolean(data?.amountWithinLimit ?? data?.isWithinLimit),
        hardCapValue: data?.hardCapValue !== undefined ? Number(data.hardCapValue) : undefined,
      };
    } catch (error: any) {
      clearTimeout(timer);
      if (error?.name === 'AbortError') {
        throw new Error(`Hardcap verification request timed out after ${this.requestTimeout}ms`);
      }
      throw error;
    }
  }
}

export const hardcapService = new HardcapService();

export const verifyHardCap = (
  baseUrl: string,
  request: VerifyHardCapRequest
): Promise<HardcapCheckResponse> => {
  return hardcapService.verifyHardCap(baseUrl, request);
};

export default hardcapService;


// 2. Update the Call in PaymentParent.tsx
// In PaymentParent.tsx, update handleAmountChange (around lines 194–215):


const handleAmountChange = useCallback(
  async ({
    instructedAmount,
    instructedAmountCurrencyCode,
  }: {
    instructedAmount: number;
    instructedAmountCurrencyCode: string;
  }) => {
    if (!instructedAmount || instructedAmount <= 0) {
      setMakerHardcapResult(null);
      return;
    }

    try {
      // Real API call target: /nextgengab/api/api/v1/gab/hard-cap
      const res = await hardcapService.verifyHardCap(
        '/nextgengab/api/api/v1/gab/hard-cap',
        {
          currency: instructedAmountCurrencyCode,
          paymentAmount: instructedAmount,
          applicationName: 'GAB',
          applicationModule: 'GAB-LATAM',
        }
      );

      setMakerHardcapResult(res);
    } catch (err: any) {
      console.error('Hardcap API verification failed:', err);
      // Mark as error / out-of-limit rather than silently masking with dummy 999999999
      setMakerHardcapResult({
        amountWithinLimit: false,
        error: err?.message || 'Hardcap check failed',
      });
    }
  },
  []
);