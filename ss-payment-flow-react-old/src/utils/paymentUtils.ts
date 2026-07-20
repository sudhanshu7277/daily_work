import { Pain001Model, createEmptyPain001, PAIN001_STRING_FIELDS, PAIN001_NUMERIC_FIELDS, PAIN001_ARRAY_FIELDS } from '../types/models';

// ---------------------------------------------------------------------------
// From payment-parent.component.ts imports: buildPain001ModelFromDetails,
// populatePaymentDetailsFromSource, formatDateForInput.
// These live in 'src/app/shared/utils/payment-details.util' in the Angular
// source and were NOT independently photographed — reconstructed here from
// their call sites and the shape of paymentDetailsRequest / Pain001Model.
// Flagged: confirm against the real payment-details.util.ts if it's ever
// captured, rather than treating this reconstruction as gospel.
// ---------------------------------------------------------------------------

/** Builds a Pain001Model from a flat "checker sample" / paymentDetailsRequest-shaped object. */
export function buildPain001ModelFromDetails(details: Record<string, any> | null | undefined): Pain001Model {
  const model = createEmptyPain001();
  if (!details) return model;
  const modelRaw = model as unknown as Record<string, any>;
  Object.keys(details).forEach((key) => {
    modelRaw[key] = details[key];
  });
  return model;
}

/** Copies fields from `source` onto `target` in place (mutates target), used
 *  by populatePaymentDetailsFromChecker(). */
export function populatePaymentDetailsFromSource(target: Record<string, any>, source: Record<string, any> | null | undefined): void {
  if (!source) return;
  Object.keys(target).forEach((key) => {
    if (source[key] !== undefined) {
      target[key] = source[key];
    }
  });
}

/** Normalizes a date string/Date into the yyyy-MM-dd shape an <input type="date"> expects. */
export function formatDateForInput(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Child component's own private helpers (ss-payment-flow.component.ts)
// ---------------------------------------------------------------------------

/** private splitMultiline(value): string[] — lines 1229-1234 of the child .ts */
export function splitMultiline(value: string | undefined | null): string[] {
  if (!value) return [];
  return value.split('\n').filter((line) => line.trim().length > 0);
}

/** private buildPain001FromForm(raw) — lines ~1210-1227 of the child .ts.
 *  Builds a full Pain001Model from a raw form-values object using the
 *  PAIN001_STRING_FIELDS / PAIN001_NUMERIC_FIELDS / PAIN001_ARRAY_FIELDS
 *  groupings, exactly as the Angular getPaymentData()/buildPain001FromForm did. */
export function buildPain001FromForm(raw: Record<string, any>): Pain001Model {
  const result = createEmptyPain001();
  const resultRaw = result as unknown as Record<string, any>;
  PAIN001_STRING_FIELDS.forEach((field) => {
    resultRaw[field as string] = raw[field as string];
  });
  PAIN001_NUMERIC_FIELDS.forEach((field) => {
    resultRaw[field as string] = parseFloat(raw[field as string]) || 0;
  });
  PAIN001_ARRAY_FIELDS.forEach((field) => {
    resultRaw[field as string] = splitMultiline(raw[field as string]);
  });
  return result;
}

/** private parseCommaSeparated(input): string[] — identical implementation
 *  appears in BOTH the child and the parent .ts (parent's copy is the one
 *  used to build `paymentInput.hideFieldsList` / `.dualBlindKeyFields` /
 *  `.rejectedFieldList`). */
export function parseCommaSeparated(input: string | undefined | null): string[] {
  if (!input || !input.trim()) return [];
  return input.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
}
