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




Phase 1: Pure API Layer Batch (Quick Coverage Spike)
Why: API files contain pure functions calling Axios. They require zero DOM rendering, can be tested in batches using simple vi.mock('axios') patterns, and will instantly cover 1,500+ lines of code.

Target Files (0% -> 100%):

src/api/audit.ts

src/api/comments.ts

src/api/citiSftIntake.ts

src/api/documents.ts (111 lines)

src/api/roles.ts

src/api/thresholds.ts

src/api/tickler.ts

src/api/whitelist.ts

src/api/emailIntake.ts & src/api/emails.ts

Phase 2: Context & Utility Cleanup
Why: Contexts wrap large sections of the app, and utilities are straightforward logic branches with high line density.

Target Files:

src/context/AuthContext.tsx (183 lines — test login, logout, role check hooks, and provider state)

src/utils/exportExcel.ts

src/utils/arrayUtils.ts

Phase 3: Lightweight Common Components
Why: Reusable common UI elements render quickly with minimal prop mocking and cover significant UI branch logic.

Target Files:

src/components/common/Breadcrumb.tsx (45 lines)

src/components/common/PresetBar.tsx (101 lines)

src/components/common/PriorityTag.tsx (15 lines)

src/components/common/RadioGroup.tsx (27 lines)

src/components/common/StatusTag.tsx (27 lines)

src/components/common/FilterPanel.tsx (219 lines)

Phase 4: Small & Medium Leaf Pages
Why: Smaller, dedicated sub-pages have simpler logic than the main Dashboard/Instruction List pages, giving high line returns without getting bogged down in complex AG-Grid or table state mocks.

Target Files:

src/pages/auth/AccessDeniedPage.tsx (23 lines)

src/pages/intakeChannels/IntakeChannelsPage.tsx (89 lines)

src/pages/refdata/ReferenceDataPage.tsx (169 lines)

src/pages/tickler/TicklerTaskPage.tsx (250 lines)

src/pages/whitelist/WhitelistManagementPage.tsx (329 lines)

src/pages/thresholds/ThresholdManagementPage.tsx (431 lines)

Recommended Execution Path
Starting with Phase 1 (The API Layer) will immediately jump your overall statement coverage from 34% to over 55% in a single batch.





// src/components/common/StatusTag.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusTag from './StatusTag';
import { statusColor, statusLabel } from '../../utils/format';

vi.mock('@citi-icg-172888/icgds-react', () => ({
  Tag: ({ children, color, className, style }: any) => (
    <span
      data-testid="status-tag"
      data-color={color}
      className={className}
      style={style}
    >
      {children}
    </span>
  ),
}));

vi.mock('../../utils/format', () => ({
  statusColor: vi.fn((status) => `color-for-${status}`),
  statusLabel: vi.fn((status) => `Label: ${status}`),
}));

describe('StatusTag Component', () => {
  it('renders status label, color, className, and inline styles', () => {
    render(<StatusTag status={'APPROVED' as any} />);

    const tag = screen.getByTestId('status-tag');
    expect(tag).toBeInTheDocument();
    expect(statusColor).toHaveBeenCalledWith('APPROVED');
    expect(statusLabel).toHaveBeenCalledWith('APPROVED');

    expect(tag).toHaveTextContent('Label: APPROVED');
    expect(tag).toHaveAttribute('data-color', 'color-for-APPROVED');
    expect(tag).toHaveClass('lmn-mx-4px');
    expect(tag).toHaveStyle({ display: 'inline-flex', fontSize: '11px' });
  });
});