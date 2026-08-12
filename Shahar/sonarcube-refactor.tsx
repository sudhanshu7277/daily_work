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
  getTokenExpiry,
  isTokenExpired,
} from './auth';

// Helper: Converts a string to base64url format without using regex
function toBase64Url(str: string): string {
  // Use Buffer if in Node environment, or btoa fallback
  let b64 = typeof Buffer !== 'undefined'
    ? Buffer.from(str).toString('base64')
    : btoa(str);

  // Convert standard base64 characters to base64url
  b64 = b64.replace(/\+/g, '-').replace(/\//g, '_');

  // Strip trailing '=' padding using simple string slicing (No regex = No Sonar ReDoS)
  while (b64.endsWith('=')) {
    b64 = b64.slice(0, -1);
  }

  return b64;
}

// Build a fake JWT whose payload is base64url-encoded JSON.
function makeToken(payload: Record<string, unknown>): string {
  const headerB64 = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payloadB64 = toBase64Url(JSON.stringify(payload));

  return `${headerB64}.${payloadB64}.sig`;
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