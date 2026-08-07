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





// ilterPresetBar.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterPresetBar } from './FilterPresetBar';
import {
  listFilterPrefs,
  saveFilterPref,
  deleteFilterPref,
} from '../../api/filterPreferences';
import {
  serializeFilters,
  deserializeFilters,
} from '../../utils/filterSerialization';

vi.mock('@citi-icg-172888/icgds-react', () => ({
  El: ({ children, className }: any) => <div className={className}>{children}</div>,
  Dropdown: Object.assign(
    ({ children, value, onChange, placeholder }: any) => (
      <select
        data-testid="dropdown"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    ),
    {
      Item: ({ children, value }: any) => <option value={value}>{children}</option>,
    },
  ),
  Input: ({ placeholder, value, onChange }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid="view-name-input"
    />
  ),
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock('../../api/filterPreferences', () => ({
  listFilterPrefs: vi.fn(),
  saveFilterPref: vi.fn(),
  deleteFilterPref: vi.fn(),
}));

vi.mock('../../utils/filterSerialization', () => ({
  serializeFilters: vi.fn((filters) => JSON.stringify(filters)),
  deserializeFilters: vi.fn((json) => (json ? JSON.parse(json) : {})),
}));

describe('FilterPresetBar Component', () => {
  const defaultProps = {
    pageKey: 'test-page',
    currentFilters: { status: 'ACTIVE' },
    dateFields: ['createdAt'],
    onApply: vi.fn(),
  };

  const mockPrefs = [
    {
      filterPrefId: 1,
      pageKey: 'test-page',
      prefName: 'View 1',
      filtersJson: '{"status":"ACTIVE"}',
      isDefault: false,
    },
    {
      filterPrefId: 2,
      pageKey: 'test-page',
      prefName: 'View 2',
      filtersJson: '{"status":"COMPLETED"}',
      isDefault: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads preferences on mount and automatically applies default preference', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValueOnce({ data: mockPrefs } as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    expect(listFilterPrefs).toHaveBeenCalledWith('test-page');
    expect(deserializeFilters).toHaveBeenCalledWith('{"status":"COMPLETED"}', ['createdAt']);
    expect(defaultProps.onApply).toHaveBeenCalledWith({ status: 'COMPLETED' });
    expect(screen.getByRole('option', { name: 'View 2 (default)' })).toBeInTheDocument();
  });

  it('handles empty preference list response safely', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValueOnce({ data: undefined } as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    expect(listFilterPrefs).toHaveBeenCalledWith('test-page');
    expect(defaultProps.onApply).not.toHaveBeenCalled();
  });

  it('applies selected filter preset when dropdown changes', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValue({ data: mockPrefs } as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    const dropdown = screen.getByTestId('dropdown');

    await act(async () => {
      fireEvent.change(dropdown, { target: { value: '1' } });
    });

    expect(deserializeFilters).toHaveBeenCalledWith('{"status":"ACTIVE"}', ['createdAt']);
    expect(defaultProps.onApply).toHaveBeenCalledWith({ status: 'ACTIVE' });
  });

  it('ignores invalid or non-numeric selection in dropdown', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValue({ data: mockPrefs } as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    defaultProps.onApply.mockClear();

    const dropdown = screen.getByTestId('dropdown');

    await act(async () => {
      fireEvent.change(dropdown, { target: { value: 'invalid-id' } });
    });

    expect(defaultProps.onApply).not.toHaveBeenCalled();
  });

  it('does not trigger save view if view name input is empty or whitespace', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValue({ data: [] } as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    const saveButton = screen.getByRole('button', { name: 'Save view' });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(saveFilterPref).not.toHaveBeenCalled();
  });

  it('saves view with name and checkbox selection then reloads preferences', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValue({ data: [] } as any);
    vi.mocked(saveFilterPref).mockResolvedValueOnce({} as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    const input = screen.getByPlaceholderText('View name');
    const checkbox = screen.getByRole('checkbox', { name: 'Set as default' });
    const saveButton = screen.getByRole('button', { name: 'Save view' });

    fireEvent.change(input, { target: { value: '   My New View   ' } });
    fireEvent.click(checkbox);

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(serializeFilters).toHaveBeenCalledWith({ status: 'ACTIVE' });
    expect(saveFilterPref).toHaveBeenCalledWith({
      pageKey: 'test-page',
      prefName: 'My New View',
      filtersJson: '{"status":"ACTIVE"}',
      isDefault: true,
    });
    expect(input).toHaveValue('');
    expect(checkbox).not.toBeChecked();
    expect(listFilterPrefs).toHaveBeenCalledTimes(2);
  });

  it('deletes selected preset and reloads preferences', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValue({ data: mockPrefs } as any);
    vi.mocked(deleteFilterPref).mockResolvedValueOnce({} as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(deleteFilterPref).toHaveBeenCalledWith(2);
    expect(listFilterPrefs).toHaveBeenCalledTimes(2);
  });

  it('does not call delete when no preset is selected', async () => {
    vi.mocked(listFilterPrefs).mockResolvedValue({
      data: [
        {
          filterPrefId: 1,
          pageKey: 'test-page',
          prefName: 'View 1',
          filtersJson: '{"status":"ACTIVE"}',
          isDefault: false,
        },
      ],
    } as any);

    await act(async () => {
      render(<FilterPresetBar {...defaultProps} />);
    });

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeDisabled();

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(deleteFilterPref).not.toHaveBeenCalled();
  });
});