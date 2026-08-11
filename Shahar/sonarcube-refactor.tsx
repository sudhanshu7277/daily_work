// cmd to run tests locally

npx vitest run --coverage

// src/api/client.test.ts

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

    // Cast interceptors to access internal handlers array safely in TypeScript
    const requestInterceptor = (client.interceptors.request as any).handlers[0];
    const mockConfig = { headers: {} } as InternalAxiosRequestConfig;

    const config = await requestInterceptor.fulfilled(mockConfig);

    expect(config.headers.Authorization).toBe('Bearer mock-jwt-token');
  });

  it('clears authentication upon receiving a 401 response', async () => {
    const errorResponse = {
      response: { status: 401 },
    };

    const responseInterceptor = (client.interceptors.response as any).handlers[0];

    if (responseInterceptor?.rejected) {
      await expect(responseInterceptor.rejected(errorResponse)).rejects.toEqual(errorResponse);
      expect(mockClearAuth).toHaveBeenCalled();
    }
  });
});