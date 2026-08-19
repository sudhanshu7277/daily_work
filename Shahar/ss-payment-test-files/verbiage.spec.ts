import { describe, it, expect } from 'vitest';
import * as VerbiageModule from './verbiages';

describe('verbiages.ts Unit Tests', () => {
  it('should export a defined verbiage module', () => {
    expect(VerbiageModule).toBeDefined();
    expect(typeof VerbiageModule).toBe('object');
  });

  it('should contain non-empty verbiage keys or objects', () => {
    const exportedKeys = Object.keys(VerbiageModule);
    expect(exportedKeys.length).toBeGreaterThan(0);
  });

  it('should verify all exported string values are non-empty', () => {
    const resolved: Record<string, any> =
      (VerbiageModule as any).default ||
      (VerbiageModule as any).verbiages ||
      (VerbiageModule as any).PACS_FORM_VERBIAGES ||
      VerbiageModule;

    Object.entries(resolved).forEach(([key, val]) => {
      if (typeof val === 'string') {
        expect(val.trim().length, `Key ${key} should have a valid string value`).toBeGreaterThan(0);
      } else if (typeof val === 'object' && val !== null) {
        expect(Object.keys(val).length).toBeGreaterThan(0);
      }
    });
  });
});