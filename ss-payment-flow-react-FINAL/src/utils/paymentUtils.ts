import { Pain001Model, createEmptyPain001 } from '../types/models';

/** Ported from PaymentParentComponent.parseCommaSeparated. */
export function parseCommaSeparated(input: string): string[] {
  if (!input || !input.trim()) return [];
  return input.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Normalizes a date-ish string to YYYY-MM-DD for <input type="date">.
 * Accepts ISO datetimes, plain YYYY-MM-DD, or anything Date can parse.
 * Returns '' for anything it can't parse, rather than throwing — this feeds
 * directly into checkerDataFromParent, which is read-only display context,
 * so a blank is a safer failure mode than a crash.
 */
export function formatDateForInput(date: string | undefined | null): string {
  if (!date) return '';
  const trimmed = String(date).trim();
  if (!trimmed) return '';
  // Already in YYYY-MM-DD form
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return '';
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const NUMERIC_FIELDS = new Set(['instructedAmount', 'chargesAmount']);

/**
 * Reverse of payloadPreperation() — takes a paymentDetailsRequest-shaped
 * object (from a checker/repair payload) and produces a typed Pain001Model.
 * Field names line up almost 1:1 with emptyPaymentDetailsRequest() in
 * PaymentParent.tsx, so this is mostly a straight copy with numeric
 * coercion for the two amount fields.
 */
export function buildPain001ModelFromDetails(details: any): Pain001Model {
  const base = createEmptyPain001();
  if (!details || typeof details !== 'object') return base;

  const result: Record<string, any> = { ...base };
  Object.keys(base).forEach((key) => {
    if (details[key] === undefined) return;
    result[key] = NUMERIC_FIELDS.has(key) ? Number(details[key]) || 0 : String(details[key] ?? '');
  });

  // creditorAgentAccountNumber -> creditorAgentPostalAddress bridge, same
  // reasoning as buildPain001FromForm below.
  if (details.creditorAgentAccountNumber !== undefined && !details.creditorAgentPostalAddress) {
    result.creditorAgentPostalAddress = String(details.creditorAgentAccountNumber ?? '');
  }

  return result as Pain001Model;
}

/**
 * Mutates `target` (a paymentDetailsRequest-shaped object) in place,
 * copying matching keys from `source` (a checker/repair payload's
 * paymentDetailsRequest). Used by PaymentParent's
 * populatePaymentDetailsFromChecker to seed paymentDetailsRequestRef before
 * the child's own emitOutput/payloadPreperation cycle overwrites it with
 * live form data.
 */
export function populatePaymentDetailsFromSource<T extends Record<string, any>>(target: T, source: any): T {
  if (!source || typeof source !== 'object') return target;
  Object.keys(target).forEach((key) => {
    if (source[key] !== undefined) {
      (target as any)[key] = source[key];
    }
  });
  return target;
}

/**
 * Converts PaymentChild's all-string formValues map into a typed
 * Pain001Model. Numeric fields (instructedAmount, chargesAmount) are
 * parsed; everything else copies through as-is.
 *
 * BRIDGE: PaymentChild.tsx renders a field named 'creditorAgentAccountNumber'
 * (renderField call, own label), but PaymentParent's payloadPreperation()
 * only ever reads paymentData.creditorAgentPostalAddress — never
 * creditorAgentAccountNumber. Without bridging these, whatever the user
 * types into that field would be silently dropped before it ever reaches
 * the backend payload. This copies the entered value into
 * creditorAgentPostalAddress (only when that field itself is still empty,
 * so it doesn't clobber a value arriving some other way) so data actually
 * survives the round trip. Flag if your backend contract expects these to
 * stay genuinely separate instead.
 */
export function buildPain001FromForm(formValues: Record<string, string>): Pain001Model {
  const base = createEmptyPain001();
  const result: Record<string, any> = { ...base };

  Object.keys(base).forEach((key) => {
    if (formValues[key] === undefined) return;
    result[key] = NUMERIC_FIELDS.has(key) ? (parseFloat(formValues[key]) || 0) : formValues[key];
  });

  if (formValues.creditorAgentAccountNumber && !result.creditorAgentPostalAddress) {
    result.creditorAgentPostalAddress = formValues.creditorAgentAccountNumber;
  }

  return result as Pain001Model;
}

/**
 * Imported by PaymentChild.tsx but not visibly used in the shown code —
 * likely referenced only in an omitted dead-code path (e.g. the legacy
 * multi-line address textarea). Exported for import-safety.
 */
export function splitMultiline(value: string): string[] {
  if (!value) return [];
  return value.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
}
