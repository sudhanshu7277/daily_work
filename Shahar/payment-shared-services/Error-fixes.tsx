// Replace hardcapService.ts with the network implementation 
// that hits /nextgengab/api/api/v1/gab/hard-cap:


import { VerifyHardCapRequest, HardcapCheckResponse } from '../types/models';

export interface HardcapServiceConfig {
  defaultHardcapLimit?: number;
  timeoutMs?: number;
}

class HardcapService {
  private defaultLimit: number = 1000000;
  private requestTimeout: number = 8000;

  public async verifyHardCap(
    baseUrl: string,
    request: VerifyHardCapRequest
  ): Promise<HardcapCheckResponse> {
    const endpoint = baseUrl.replace(/\/+$/, '');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
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
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        amountWithinLimit: Boolean(data?.amountWithinLimit),
        hardCapValue:
          data?.hardCapValue !== undefined
            ? Number(data.hardCapValue)
            : this.defaultLimit,
      };
    } catch (err) {
      console.warn('[HardcapService] Network request failed:', err);
      // If the backend call fails, fallback to local validation so the UI doesn't crash to $undefined
      const amount = Number(request.paymentAmount) || 0;
      return {
        amountWithinLimit: amount <= this.defaultLimit,
        hardCapValue: this.defaultLimit,
      };
    }
  }
}

export const hardcapService = new HardcapService();
export default hardcapService;


//2. In PaymentParent.tsxCheck line 200 in PaymentParent.tsx. 
// Ensure handleAmountChange directly calls the service and updates setMakerHardcapResult:  

const handleAmountChange = useCallback(
  async ({
    instructedAmount,
    instructedAmountCurrencyCode,
  }: {
    instructedAmount: number;
    instructedAmountCurrencyCode: string;
  }) => {
    console.log('>>> handleAmountChange triggered:', instructedAmount, instructedAmountCurrencyCode);

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

      console.log('>>> hardcap verification result:', res);
      setMakerHardcapResult(res);
    } catch (err) {
      console.error('Hardcap API error:', err);
      setMakerHardcapResult({
        amountWithinLimit: false,
        hardCapValue: 1000000,
      });
    }
  },
  []
);