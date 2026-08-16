import { Pain001Model, createEmptyPain001, PAIN001_NUMERIC_FIELDS } from '../types/models';

const NUMERIC_FIELDS = new Set(PAIN001_NUMERIC_FIELDS);

export function parseCommaSeparated(input: string | undefined | null): string[] {
  if (!input || !input.trim()) return [];
  return input
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function formatDateForInput(date: string | undefined | null): string {
  if (!date) return '';
  const trimmed = String(date).trim();
  if (!trimmed) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return '';

  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function buildPain001ModelFromDetails(details: any): Pain001Model {
  const base = createEmptyPain001();
  if (!details || typeof details !== 'object') return base;

  const result: Record<string, any> = { ...base };
  Object.keys(base).forEach(key => {
    if (details[key] === undefined) return;
    result[key] = NUMERIC_FIELDS.has(key as any)
      ? (Number(details[key]) || 0)
      : String(details[key] ?? '');
  });

  if (details.creditorAgentAccountNumber !== undefined && !details.creditorAgentPostalAddress) {
    result.creditorAgentPostalAddress = String(details.creditorAgentAccountNumber ?? '');
  }

  return result as Pain001Model;
}

export function populatePaymentDetailsFromSource<T extends Record<string, any>>(target: T, source: any): T {
  if (!source || typeof source !== 'object') return target;
  Object.keys(target).forEach(key => {
    if (source[key] !== undefined) {
      (target as any)[key] = source[key];
    }
  });
  return target;
}

export function buildPain001FromForm(formValues: Record<string, string | number>): Pain001Model {
  const base = createEmptyPain001();
  const result: Record<string, any> = { ...base };

  Object.keys(base).forEach(key => {
    if (formValues[key] === undefined) return;
    result[key] = NUMERIC_FIELDS.has(key as any)
      ? (parseFloat(String(formValues[key])) || 0)
      : formValues[key];
  });

  if ((formValues as any).creditorAgentAccountNumber && !result.creditorAgentPostalAddress) {
    result.creditorAgentPostalAddress = (formValues as any).creditorAgentAccountNumber;
  }

  return result as Pain001Model;
}

export function splitMultiline(value: string): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}