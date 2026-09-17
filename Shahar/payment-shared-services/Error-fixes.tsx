// Here is the clean implementation with zero hardcoded limits—no defaultLimit, no fallback amounts, and purely relying on the backend response.

// 1. src/pages/ss-payment/services/hardcapService.ts

import { VerifyHardCapRequest, HardcapCheckResponse } from '../types/models';

class HardcapService {
  private requestTimeout: number = 8000;

  public async verifyHardCap(
    baseUrl: string,
    request: VerifyHardCapRequest
  ): Promise<HardcapCheckResponse> {
    const endpoint = baseUrl.replace(/\/+$/, '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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

      if (!response.ok) {
        throw new Error(`Hardcap endpoint returned status ${response.status}`);
      }

      const data = await response.json();

      return {
        amountWithinLimit: Boolean(data?.amountWithinLimit),
        hardCapValue: data?.hardCapValue,
      };
    } catch (err: any) {
      clearTimeout(timer);
      console.error('[HardcapService] Verification failed:', err);
      throw err;
    }
  }
}

export const hardcapService = new HardcapService();
export default hardcapService;


// 2. In PaymentParent.tsx
// In handleAmountChange, catch the error without setting any 
// fake limit so nothing artificial is passed down:


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
      const res = await hardcapService.verifyHardCap(
        '/nextgengab/api/api/v1/gab/hard-cap',
        {
          currency: instructedAmountCurrencyCode || 'USD',
          paymentAmount: instructedAmount,
          applicationName: 'GAB',
          applicationModule: 'GAB-LATAM',
        }
      );

      setMakerHardcapResult(res);
    } catch (err) {
      // Do not inject any default/hardcoded limit
      setMakerHardcapResult(null);
    }
  },
  []
);


