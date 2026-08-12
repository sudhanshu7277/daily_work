// cmd to run tests locally

npx vitest run --coverage


// src/utils/auth.test.ts

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import {
  getToken,
  setToken,
  clearAuth,
  login,
  getTokenExpiry,
  isTokenExpired,
} from './auth';

// Build a fake JWT whose payload is base64url-encoded JSON.
function makeToken(payload: Record<string, unknown>): string {
  const b64 = (obj: unknown) => {
    const str = typeof btoa !== 'undefined' 
      ? btoa(JSON.stringify(obj)) 
      : Buffer.from(JSON.stringify(obj)).toString('base64');

    return str
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/={1,2}$/, ''); // Bounded quantifier {1,2} fixes SonarQube ReDoS without breaking JWT format
  };

  return `${b64({ alg: 'none' })}.${b64(payload)}.sig`;
}

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves token correctly', () => {
    setToken('test-jwt-token');
    expect(getToken()).toBe('test-jwt-token');
  });

  it('clears token on clearAuth', () => {
    setToken('test-jwt-token');
    clearAuth();
    expect(getToken()).toBeNull();
  });

  it('extracts token expiry correctly from mock token', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeToken({ exp });

    expect(getTokenExpiry(token)).toBe(exp);
    expect(isTokenExpired(token)).toBe(false);
  });
});