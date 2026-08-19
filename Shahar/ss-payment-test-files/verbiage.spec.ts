import { describe, it, expect } from 'vitest';
import * as VerbiageModule from '../verbiages';

describe('verbiages.ts Unit Tests', () => {
  // Resolve dictionary whether it's exported as a default object, named object, or top-level keys
  const resolvedVerbiages: Record<string, any> =
    (VerbiageModule as any).verbiages ||
    (VerbiageModule as any).PACS_VERBIAGES ||
    (VerbiageModule as any).default ||
    VerbiageModule;

  it('should export a defined verbiage dictionary or named constants', () => {
    expect(VerbiageModule).toBeDefined();
    expect(Object.keys(resolvedVerbiages).length).toBeGreaterThan(0);
  });

  it('should verify all exported verbiage values are non-empty strings', () => {
    Object.entries(resolvedVerbiages).forEach(([key, value]) => {
      // Ignore helper functions if any exist in the module
      if (typeof value === 'string') {
        expect(value.trim().length, `Verbiage for key "${key}" should not be empty`).toBeGreaterThan(0);
      }
    });
  });

  it('should contain key label entries used in the payment forms', () => {
    const stringValues = Object.values(resolvedVerbiages).filter(v => typeof v === 'string') as string[];

    // Verify key core labels exist in the verbiage values
    const expectedLabels = [
      'Value Date',
      'Currency',
      'Transaction Amount',
      'Debtor Name',
      'Creditor Name',
      'Payment Details'
    ];

    expectedLabels.forEach(label => {
      const exists = stringValues.some(val => val.toLowerCase() === label.toLowerCase());
      expect(exists, `Expected "${label}" to exist in verbiages.ts`).toBe(true);
    });
  });

  it('should verify helper functions if exported (e.g. getVerbiage)', () => {
    if (typeof (VerbiageModule as any).getVerbiage === 'function') {
      const fn = (VerbiageModule as any).getVerbiage;
      expect(fn('ValueDate', 'Fallback Date')).toBeTruthy();
      expect(fn('NON_EXISTENT_KEY', 'Custom Fallback')).toBe('Custom Fallback');
    }
  });
});