import { HardcapCheckResponse, VerifyHardCapRequest } from '../types/models';

// Ported from hardcap.service.ts (see memory: ss-payment-flow-dependencies-capture.md).
// Original was an Angular HttpClient-based Observable-returning service; this
// is the fetch/Promise equivalent used by both PaymentChild and PaymentParent
// (both call this independently — see CRITICAL FLAG: duplicate hardcap
// validation path, preserved faithfully rather than de-duplicated).

export async function verifyHardCap(
  baseUrl: string,
  request: VerifyHardCapRequest,
): Promise<HardcapCheckResponse> {
  const url = `${baseUrl || ''}/api/hardcap/verify`;
  // NOTE: exact hardcap endpoint path was not independently re-confirmed in
  // this capture pass; using the pattern documented for hardcapService in
  // ss-payment-flow-dependencies-capture.md. Confirm against the real
  // hardcap.service.ts if available.
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Hardcap verification failed: ${response.status}`);
  }
  return response.json();
}
