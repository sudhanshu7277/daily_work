// npx vitest run --coverage
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getUserId,
  setUserId,
  getUserRole,
  setUserRole,
  getToken,
  setToken,
  clearAuth,
  bootstrapUserId,
  login,
  getTokenExpiry,
  isTokenExpired,
} from './auth';

vi.mock('axios');

describe('auth utility functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('User ID and Role helpers', () => {
    it('returns fallback default when localStorage is empty', () => {
      expect(getUserId()).toBe('SYSTEM');
      expect(getUserRole()).toBe('ROLE_VIEW_ONLY');
      expect(getToken()).toBeNull();
    });

    it('sets and retrieves user ID, role, and token correctly', () => {
      setUserId('AB12345');
      setUserRole('ROLE_ADMIN_MAKER');
      setToken('mock-jwt-token');

      expect(getUserId()).toBe('AB12345');
      expect(getUserRole()).toBe('ROLE_ADMIN_MAKER');
      expect(getToken()).toBe('mock-jwt-token');
    });

    it('clears all authentication items from localStorage', () => {
      setUserId('AB12345');
      setUserRole('ROLE_ADMIN_MAKER');
      setToken('mock-jwt-token');

      clearAuth();

      expect(localStorage.getItem('gab-user-id')).toBeNull();
      expect(localStorage.getItem('gab-user-role')).toBeNull();
      expect(localStorage.getItem('gab-jwt-token')).toBeNull();
    });
  });

  describe('bootstrapUserId', () => {
    it('fetches and sets user ID when API returns a valid soeid', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { data: { soeid: 'XY98765' } },
      });

      await bootstrapUserId();

      expect(getUserId()).toBe('XY98765');
    });

    it('does not update user ID if soeid is missing in API response', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: { data: {} },
      });

      await bootstrapUserId();

      expect(getUserId()).toBe('SYSTEM');
    });

    it('handles network/API errors gracefully without throwing', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(bootstrapUserId()).resolves.not.toThrow();
      expect(getUserId()).toBe('SYSTEM');
    });
  });

  describe('login', () => {
    it('calls login API, sets local storage values, and returns user data', async () => {
      const mockAuthData = {
        token: 'sample.jwt.token',
        soeid: 'LOGIN123',
        roles: ['ROLE_PAYMENT_MAKER'],
      };

      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { data: mockAuthData },
      });

      const result = await login();

      expect(result).toEqual(mockAuthData);
      expect(getToken()).toBe('sample.jwt.token');
      expect(getUserId()).toBe('LOGIN123');
    });
  });

  describe('JWT token expiry helpers', () => {
    // Utility helper to construct a Base64-encoded JWT token
    const createMockToken = (payloadObj: object) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(payloadObj))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      return `${header}.${payload}.signature`;
    };

    it('correctly extracts exp from a valid JWT token', () => {
      const mockToken = createMockToken({ exp: 1800000000 });
      expect(getTokenExpiry(mockToken)).toBe(1800000000);
    });

    it('returns 0 for invalid or unparseable JWT tokens', () => {
      expect(getTokenExpiry('invalid-token-string')).toBe(0);
      
      const noExpToken = createMockToken({ user: 'test' });
      expect(getTokenExpiry(noExpToken)).toBe(0);
    });

    it('correctly checks whether a token is expired', () => {
      const nowInSeconds = Math.floor(Date.now() / 1000);

      // 1. Missing token
      expect(isTokenExpired(null)).toBe(true);

      // 2. Unparseable token
      expect(isTokenExpired('garbage-token')).toBe(true);

      // 3. Expired token (past time)
      const expiredToken = createMockToken({ exp: nowInSeconds - 100 });
      expect(isTokenExpired(expiredToken)).toBe(true);

      // 4. Token expiring within default buffer (60s)
      const nearExpiryToken = createMockToken({ exp: nowInSeconds + 30 });
      expect(isTokenExpired(nearExpiryToken, 60_000)).toBe(true);

      // 5. Valid active token far in future
      const validToken = createMockToken({ exp: nowInSeconds + 3600 });
      expect(isTokenExpired(validToken)).toBe(false);
    });
  });
});

// npx vitest run src/utils/auth.test.ts --coverage
npx vitest run --coverage


// 1. src/utils/auth.test.ts

import { /* import your auth functions here, e.g., getUserRoles, isAuthenticated */ } from './auth';

describe('auth utilities', () => {
  test('executes auth functions correctly', () => {
    // Add tests for functions exported in src/utils/auth.ts
  });
});

// 2. Run Jest with coverage to confirm:

npm test -- --coverage --watchAll=false