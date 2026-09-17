// To reproduce the exact behavior from the 
// working app without hardcoding arbitrary 
// amounts or hitting the unconfigured backend, 
// update src/pages/ss-payment/services/hardcapService.ts:


import { VerifyHardCapRequest, HardcapCheckResponse } from '../types/models';

class HardcapService {
  // Configurable simulation threshold (default 1,000,000 like your working app)
  private defaultLimit: number = 1000000;

  public setLimit(limit: number): void {
    this.defaultLimit = limit;
  }

  public async verifyHardCap(
    _baseUrl: string,
    request: VerifyHardCapRequest
  ): Promise<HardcapCheckResponse> {
    const amount = Number(request.paymentAmount) || 0;
    const limit = this.defaultLimit;

    // Returns the exact shape expected by the UI library component
    return {
      amountWithinLimit: amount <= limit,
      hardCapValue: limit,
    };
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


// In PaymentParent.tsx
// Pass that response directly into setMakerHardcapResult:


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
      const res = await hardcapService.verifyHardCap('', {
        currency: instructedAmountCurrencyCode,
        paymentAmount: instructedAmount,
        applicationName: 'ADR',
        applicationModule: 'ADR',
      });

      // Directly feeds { amountWithinLimit: boolean, hardCapValue: number }
      setMakerHardcapResult(res);
    } catch (err) {
      console.error('Hardcap check error:', err);
      setMakerHardcapResult(null);
    }
  },
  []
);

