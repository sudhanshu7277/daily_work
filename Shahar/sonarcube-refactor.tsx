// cmd to run tests locally

npx vitest run --coverage

// src/context/AuthContext.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// --- Hoisted Mock Declarations ---
// Using vi.hoisted guarantees these mock functions are initialized BEFORE vi.mock factories execute.
const {
  mockGetCurrentUserRoles,
  mockLogin,
  mockGetToken,
  mockIsTokenExpired,
  mockGetTokenExpiry,
  mockSetUserRole,
} = vi.hoisted(() => ({
  mockGetCurrentUserRoles: vi.fn(),
  mockLogin: vi.fn(),
  mockGetToken: vi.fn(),
  mockIsTokenExpired: vi.fn(),
  mockGetTokenExpiry: vi.fn(),
  mockSetUserRole: vi.fn(),
}));

// --- Mock the roles API ---
vi.mock('../api/roles', () => ({
  getCurrentUserRoles: (...a: unknown[]) => mockGetCurrentUserRoles(...a),
}));

// --- Mock the auth utils ---
vi.mock('../utils/auth', () => ({
  login: (...a: unknown[]) => mockLogin(...a),
  getToken: (...a: unknown[]) => mockGetToken(...a),
  isTokenExpired: (...a: unknown[]) => mockIsTokenExpired(...a),
  getTokenExpiry: (...a: unknown[]) => mockGetTokenExpiry(...a),
  setUserRole: (...a: unknown[]) => mockSetUserRole(...a),
}));

import { AuthProvider, useAuth } from './AuthContext';

// A tiny consumer that surfaces the context state as text/buttons
function Consumer() {
  const {
    soeid,
    roles,
    activeRole,
    region,
    error,
    hasRole,
    hasAnyRole,
    hasPermission,
    setActiveRole,
  } = useAuth();

  return (
    <div>
      <span data-testid="soeid">{soeid}</span>
      <span data-testid="roles">{roles.join(',')}</span>
      <span data-testid="active-role">{activeRole ?? 'none'}</span>
      <span data-testid="region">{region ?? 'none'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <span data-testid="has-latam">{String(hasRole('ROLE_USERS_LATAM'))}</span>
      <span data-testid="has-any">{String(hasAnyRole(['ROLE_USERS_NAM']))}</span>
      <span data-testid="has-perm">{String(hasPermission('CAN_EDIT'))}</span>
      <button onClick={() => setActiveRole('ROLE_USERS_NAM')}>switch</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Enable fake timers with shouldAdvanceTime: true so RTL waitFor polling functions work cleanly
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // getTokenExpiry drives scheduleRefresh; return 0 so it early-returns and schedules nothing.
    mockGetTokenExpiry.mockReturnValue(0);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('uses the existing valid token path (getCurrentUserRoles) and resolves region + activeRole', async () => {
    mockGetToken.mockReturnValue('valid.token');
    mockIsTokenExpired.mockReturnValue(false);
    mockGetCurrentUserRoles.mockResolvedValue({
      data: { soeid: 'AB12345', roles: ['ROLE_USERS_LATAM', 'ROLE_MAKER'] },
    });

    renderWithProvider();

    // While loading, the splash shows instead of the consumer.
    expect(screen.getByText('Authenticating...')).toBeInTheDocument();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('soeid')).toHaveTextContent('AB12345');
    });

    expect(mockGetCurrentUserRoles).toHaveBeenCalledTimes(1);
    expect(mockLogin).not.toHaveBeenCalled();
    expect(screen.getByTestId('roles')).toHaveTextContent('ROLE_USERS_LATAM,ROLE_MAKER');

    // First role becomes activeRole, and setUserRole is persisted.
    expect(screen.getByTestId('active-role')).toHaveTextContent('ROLE_USERS_LATAM');
    expect(mockSetUserRole).toHaveBeenCalledWith('ROLE_USERS_LATAM');

    // LATAM has highest region priority.
    expect(screen.getByTestId('region')).toHaveTextContent('LATAM');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('falls back to login() when there is no valid token', async () => {
    mockGetToken.mockReturnValue(null);
    mockIsTokenExpired.mockReturnValue(true);
    mockLogin.mockResolvedValue({
      token: 'fresh.token',
      soeid: 'CD67890',
      roles: ['ROLE_USERS_EMEA'],
    });

    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('soeid')).toHaveTextContent('CD67890');
    });

    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockGetCurrentUserRoles).not.toHaveBeenCalled();
    expect(screen.getByTestId('region')).toHaveTextContent('EMEA');
  });

  it('sets NO_REGION_MESSAGE error when the user has no region role', async () => {
    mockGetToken.mockReturnValue('valid.token');
    mockIsTokenExpired.mockReturnValue(false);
    mockGetCurrentUserRoles.mockResolvedValue({
      data: { soeid: 'EF00000', roles: ['ROLE_MAKER'] },
    });

    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('soeid')).toHaveTextContent('EF00000');
    });

    expect(screen.getByTestId('region')).toHaveTextContent('none');
    expect(screen.getByTestId('error')).toHaveTextContent(/no region assigned/i);
  });

  it('sets an error message when fetchRoles rejects', async () => {
    mockGetToken.mockReturnValue(null);
    mockIsTokenExpired.mockReturnValue(true);
    mockLogin.mockRejectedValue(new Error('login failed'));

    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('login failed');
    });
  });

  it('dedupes duplicate roles via the Set', async () => {
    mockGetToken.mockReturnValue('valid.token');
    mockIsTokenExpired.mockReturnValue(false);
    mockGetCurrentUserRoles.mockResolvedValue({
      data: { soeid: 'GH11111', roles: ['ROLE_USERS_NAM', 'ROLE_USERS_NAM', 'ROLE_MAKER'] },
    });

    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('roles')).toHaveTextContent('ROLE_USERS_NAM,ROLE_MAKER');
    });
  });

  it('exposes working hasRole / hasAnyRole / hasPermission helpers', async () => {
    mockGetToken.mockReturnValue('valid.token');
    mockIsTokenExpired.mockReturnValue(false);
    mockGetCurrentUserRoles.mockResolvedValue({
      data: { soeid: 'IJ22222', roles: ['ROLE_USERS_LATAM'] },
    });

    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('has-latam')).toHaveTextContent('true');
    });

    // hasAnyRole(['ROLE_USERS_NAM']) -> false (user only has LATAM)
    expect(screen.getByTestId('has-any')).toHaveTextContent('false');

    // permissions are always [] in this implementation
    expect(screen.getByTestId('has-perm')).toHaveTextContent('false');
  });

  it('setActiveRole updates activeRole and persists via setUserRole', async () => {
    mockGetToken.mockReturnValue('valid.token');
    mockIsTokenExpired.mockReturnValue(false);
    mockGetCurrentUserRoles.mockResolvedValue({
      data: { soeid: 'KL33333', roles: ['ROLE_USERS_LATAM', 'ROLE_USERS_NAM'] },
    });

    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('active-role')).toHaveTextContent('ROLE_USERS_LATAM');
    });

    mockSetUserRole.mockClear();

    act(() => {
      fireEvent.click(screen.getByText('switch'));
    });

    expect(screen.getByTestId('active-role')).toHaveTextContent('ROLE_USERS_NAM');
    expect(mockSetUserRole).toHaveBeenCalledWith('ROLE_USERS_NAM');
  });

  it('useAuth throws when used outside an AuthProvider', () => {
    // Silence the expected React error boundary logging.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function Orphan() {
      useAuth();
      return null;
    }

    expect(() => render(<Orphan />)).toThrow('useAuth must be used within an AuthProvider');

    spy.mockRestore();
  });
});