// ============================================================================
// RECONSTRUCTED — this file has NO source capture behind it at all, unlike
// everything else in this package. The real Angular app fed checker/repair
// data into payment-parent.component.ts via `DataSharingService.checkerData`
// (an RxJS Subject/Observable, confirmed in the captured ngOnInit — see
// ss-payment-flow-parent-ts-capture.md), but the component that actually
// PUSHES data into that stream (a queue/list page — possibly
// `authorization.component`, seen open in several of your screenshots
// alongside payment-parent.component.ts, but never itself captured) was
// never photographed.
//
// This is a from-scratch build to close that gap, using ONLY the confirmed
// data contract the parent already expects (see PaymentParent.tsx's
// initialCheckerPayload handling): { txnId, securityId, eventRecordDate,
// eventType, issCode, paymentTransactionWorkflow: { isDualBlindKeyChecker1 },
// paymentDetailsRequest }.
//
// The endpoint paths below are ASSUMED, following the same REST pattern as
// the other confirmed endpoints in this app (/api/payments/checker/approve,
// /api/payments/createMakerPayment) — NOT verified against any real
// endpoint. If `authorization.component` (or equivalent) already exists in
// GAB, replace this file's fetch calls with whatever it already uses —
// don't treat these paths as authoritative.
// ============================================================================

export interface QueueItem {
  txnId: string;
  securityId: string;
  eventRecordDate: string;
  eventType: string;
  issCode: string;
  paymentTransactionWorkflow?: { isDualBlindKeyChecker1?: 'Y' | 'N' };
  paymentDetailsRequest: Record<string, any>;
  // Display-only fields for the list UI — not part of the confirmed
  // contract, populated defensively from paymentDetailsRequest if present.
  debtorName?: string;
  creditorName?: string;
  instructedAmount?: number;
  instructedAmountCurrencyCode?: string;
}

const API_BASE = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.REACT_APP_API_URL) || '';

async function getJson(url: string): Promise<any> {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((body && (body.error || body.message)) || `Request failed (${res.status})`);
    err.error = body;
    throw err;
  }
  return body;
}

/** ASSUMED endpoint — GET list of payments pending checker review. */
export async function fetchCheckerQueue(): Promise<QueueItem[]> {
  const body = await getJson(`${API_BASE}/api/payments/checker/pending`);
  return Array.isArray(body) ? body : body.items || [];
}

/** ASSUMED endpoint — GET list of payments pending repair/correction. */
export async function fetchRepairQueue(): Promise<QueueItem[]> {
  const body = await getJson(`${API_BASE}/api/payments/repair/pending`);
  return Array.isArray(body) ? body : body.items || [];
}

export const queueService = { fetchCheckerQueue, fetchRepairQueue };
export default queueService;
