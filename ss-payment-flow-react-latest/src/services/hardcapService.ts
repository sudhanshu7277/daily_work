import { HardcapCheckResponse } from '../types/models';

export interface VerifyHardCapRequest {
  currency: string;
  paymentAmount: number;
  applicationName: string;
  applicationModule: string;
}

/**
 * Called as hardcapService.verifyHardCap(baseUrl, request) from BOTH
 * PaymentChild.tsx and PaymentParent.tsx (the duplicate-validation-calls
 * behavior is preserved intentionally — see PaymentParent's DECISION #5).
 * No auth token is threaded through here because neither real file passes
 * one to this call — if your Java backend needs auth on this endpoint,
 * that needs adding, but I'm not inventing a signature neither component
 * actually uses.
 */
export async function verifyHardCap(baseUrl: string, request: VerifyHardCapRequest): Promise<HardcapCheckResponse> {
  const res = await fetch(`${baseUrl}/hard-cap/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((body && (body.error || body.message)) || `Hard cap check failed (${res.status})`);
    err.error = body;
    throw err;
  }
  return body as HardcapCheckResponse;
}
