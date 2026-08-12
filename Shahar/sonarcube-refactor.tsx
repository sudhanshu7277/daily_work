// cmd to run tests locally

npx vitest run --coverage



// 1. Fix src/api/client.test.ts (Delphyne Reliability Issue)
//Problem: Wrapping responseInterceptor.rejected inside an if block allows the test to pass vacuously if the interceptor is missing.
//Solution: Remove the if conditional and explicitly assert the existence of responseInterceptor and its rejected function.

// src/api/client.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

const { mockGetToken, mockClearAuth, mockLogin } = vi.hoisted(() => ({
  mockGetToken: vi.fn(),
  mockClearAuth: vi.fn(),
  mockLogin: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  getToken: mockGetToken,
  clearAuth: mockClearAuth,
  login: mockLogin,
}));

import client from './client';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('attaches authorization bearer token to request headers if token exists', async () => {
    mockGetToken.mockReturnValue('mock-jwt-token');

    const requestInterceptor = (client.interceptors.request as any).handlers[0];
    const mockConfig = { headers: {} } as InternalAxiosRequestConfig;

    const config = await requestInterceptor.fulfilled(mockConfig);

    expect(config.headers.Authorization).toBe('Bearer mock-jwt-token');
  });

  it('clears authentication upon receiving a 401 response', async () => {
    const mockAxiosError = {
      config: { _retry: false },
      response: { status: 401, data: { message: 'Unauthorized' } },
    };

    const responseInterceptor = (client.interceptors.response as any).handlers[0];

    // Fail explicitly if interceptor or handler is missing (eliminates silent skipping)
    expect(responseInterceptor).toBeDefined();
    expect(typeof responseInterceptor.rejected).toBe('function');

    try {
      await responseInterceptor.rejected(mockAxiosError);
    } catch {
      // Interceptor re-throws after cleanup
    }

    expect(mockClearAuth).toHaveBeenCalled();
  });
});


// 2. Fix CommonJS require('react') in ES Module Mocks
//Problem: Using const R = require('react') inside synchronous vi.mock factories causes build/runtime failures in ES module environments.
//Solution: Convert all design system mock factories to

// Apply this pattern across 
// 
// CitiSftIntakeAuditPage.test.tsx, 
// EmailIntakeAuditPage.test.tsx, 
// DocumentViewerPage.test.tsx,
//  SignatureValidationPage.test.tsx


// Replace:
// vi.mock('@citi-icg-172888/icgds-react', () => {
//   const R = require('react');

// With async factory:
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, 'aria-label': ariaLabel }: any) =>
      R.createElement('button', { onClick, title, disabled, 'aria-label': ariaLabel }, children),
    Input: ({ value, onChange, placeholder, disabled, style }: any) =>
      R.createElement('input', {
        placeholder,
        value: value ?? '',
        disabled,
        style,
        onChange,
        'data-testid': `input-${placeholder || 'default'}`,
      }),
    Alert: ({ children, type }: any) => R.createElement('div', { 'data-testid': `alert-${type}` }, children),
    Loading: ({ tip }: any) => R.createElement('div', null, tip),
    Icon: ({ type, className }: any) => R.createElement('i', { className: `icon-${type} ${className || ''}` }),
  };
});


// Verify that vitest.config.ts or vite.config.ts exports coverage in lcov format:

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
  },
});

// sonar-project.properties

sonar.javascript.lcov.reportPaths=coverage/lcov.info



// 1. Ensure Vitest Outputs coverage/lcov.info
//In your vite.config.ts or vitest.config.ts, verify or update the 
// test coverage configuration so it outputs the standard lcov format:


// vite.config.ts or vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8', // or 'c8' / 'istanbul'
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});



// Option A: Centralize Mocks in src/test-utils/setupMocks.ts
// Create src/test-utils/setupMocks.ts:

// src/test-utils/setupMocks.ts
import { vi } from 'vitest';
import React from 'react';

export const mockNotification = {
  success: vi.fn(),
  danger: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

export function setupCommonMocks() {
  vi.mock('@citi-icg-172888/icgds-react', async () => {
    const R = await vi.importActual<typeof import('react')>('react');
    return {
      El: ({ children, className, style, ...props }: any) =>
        R.createElement('div', { className, style, ...props }, children),
      Button: ({ children, onClick, title, disabled }: any) =>
        R.createElement('button', { onClick, title, disabled }, children),
      Input: ({ value, onChange, placeholder, disabled, type }: any) =>
        R.createElement('input', { placeholder, value: value ?? '', disabled, type, onChange }),
      Card: Object.assign(
        ({ children, className }: any) => R.createElement('div', { className }, children),
        { body: ({ children }: any) => R.createElement('div', null, children) }
      ),
      Modal: ({ visible, onCancel, onApply, title, children, applyText, cancelText }: any) =>
        visible
          ? R.createElement('div', { 'data-testid': 'modal' },
              R.createElement('h2', null, title),
              children,
              R.createElement('button', { onClick: onCancel }, cancelText || 'Cancel'),
              R.createElement('button', { onClick: onApply }, applyText || 'Apply')
            )
          : null,
      Dropdown: Object.assign(
        ({ value, onChange, children, disabled, placeholder }: any) =>
          R.createElement('select', { value: value ?? '', disabled, onChange: (e: any) => onChange(e.target.value) },
            placeholder && R.createElement('option', { value: '' }, placeholder),
            children
          ),
        { Item: ({ value, children }: any) => R.createElement('option', { value }, children) }
      ),
      Alert: ({ children, type }: any) => R.createElement('div', { 'data-testid': `alert-${type}` }, children),
      Loading: ({ tip }: any) => R.createElement('div', null, tip),
      Icon: ({ type, className }: any) => R.createElement('i', { className: `icon-${type} ${className || ''}` }),
      notification: mockNotification,
    };
  });
}


/// Then in your test files, import setupCommonMocks() or reference setup files in vitest.config.ts:

// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./src/test-utils/setupMocks.ts'],
  },
});