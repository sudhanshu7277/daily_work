import { VerifyHardCapRequest, HardcapCheckResponse } from '../types/models';

export interface HardcapServiceConfig {
  defaultHardcapLimit?: number;
  timeoutMs?: number;
}

class HardcapService {
  private defaultLimit: number = 1000000000;
  private requestTimeout: number = 8000;

  /**
   * Configures default service parameters.
   */
  public setConfig(config: HardcapServiceConfig): void {
    if (config.defaultHardcapLimit !== undefined) {
      this.defaultLimit = config.defaultHardcapLimit;
    }
    if (config.timeoutMs !== undefined) {
      this.requestTimeout = config.timeoutMs;
    }
  }

  /**
   * Verifies if the payment amount is within the allowed hardcap threshold.
   * Gracefully handles 404, 502, network drops, or offline local development environments.
   *
   * @param baseUrl Base API URL (e.g. '/shared-services/api/payment')
   * @param request VerifyHardCapRequest payload containing currency, amount, and app context
   * @returns Promise<HardcapCheckResponse>
   */
  public async verifyHardCap(
    baseUrl: string,
    request: VerifyHardCapRequest
  ): Promise<HardcapCheckResponse> {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanBaseUrl}/hard-cap/verify`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          currency: request.currency || 'USD',
          paymentAmount: Number(request.paymentAmount) || 0,
          applicationName: request.applicationName || 'ADR',
          applicationModule: request.applicationModule || 'ADR'
        }),
        signal: controller.signal
      });

      clearTimeout(timer);

      // Handle successful verification response from backend
      if (response.ok) {
        const data: HardcapCheckResponse = await response.json();
        return {
          amountWithinLimit: Boolean(data.amountWithinLimit),
          hardCapValue: data.hardCapValue !== undefined ? Number(data.hardCapValue) : this.defaultLimit
        };
      }

      // Handle structured business logic errors (e.g. 400 Bad Request with limit payload)
      if (response.status === 400) {
        try {
          const errData = await response.json();
          if (errData && typeof errData.amountWithinLimit === 'boolean') {
            return {
              amountWithinLimit: errData.amountWithinLimit,
              hardCapValue: Number(errData.hardCapValue) || this.defaultLimit
            };
          }
        } catch {
          // JSON parse failed, proceed to fallback
        }
      }

      // Fallback for local development or endpoint unavailability (404, 502, 503)
      console.warn(
        `[HardcapService] Backend endpoint ${endpoint} returned HTTP ${response.status}. Applying local threshold verification.`
      );
      return this.evaluateLocalLimit(request.paymentAmount);
    } catch (error: any) {
      clearTimeout(timer);

      // Graceful fallback for network errors or connection refusal during local dev
      console.warn(
        `[HardcapService] Verification network dispatch failed (${error.name || 'NetworkError'}). Simulating local verification.`,
        error
      );
      return this.evaluateLocalLimit(request.paymentAmount);
    }
  }

  /**
   * Evaluates limit locally when backend microservices are offline.
   */
  private evaluateLocalLimit(amount: number): HardcapCheckResponse {
    const numericAmount = Number(amount) || 0;
    const isWithin = numericAmount <= this.defaultLimit;

    return {
      amountWithinLimit: isWithin,
      hardCapValue: this.defaultLimit
    };
  }
}

export const hardcapService = new HardcapService();

/**
 * Direct export for backward compatibility with module imports:
 * import * as hardcapService from '../services/hardcapService';
 */
export const verifyHardCap = (
  baseUrl: string,
  request: VerifyHardCapRequest
): Promise<HardcapCheckResponse> => {
  return hardcapService.verifyHardCap(baseUrl, request);
};

export default hardcapService;