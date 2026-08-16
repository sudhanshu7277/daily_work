import { HardcapCheckResponse, VerifyHardCapRequest } from '../types/models';

export async function verifyHardCap(
  baseUrl: string,
  request: VerifyHardCapRequest
): Promise<HardcapCheckResponse> {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const res = await fetch(`${cleanBaseUrl}/hard-cap/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(body?.error || body?.message || `Hard cap check failed (${res.status})`);
    err.error = body;
    throw err;
  }
  return body as HardcapCheckResponse;
}

export const hardcapService = {
  verifyHardCap
};