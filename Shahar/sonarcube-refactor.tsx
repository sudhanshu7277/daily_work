// cmd to run tests locally

npx vitest run --coverage

// src/App.test.tsx
// src/App.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Array to record protected roles received by route guards during renders
let protectedRoles: string[][] = [];

// Mock sub-components and pages rendered by routes
vi.mock('./pages/InstructionDetail', () => ({
  default: () => <div data-testid="instruction-detail">Instruction Detail</div>,
}));

// Mock ProtectedRoute to capture allowedRoles configuration
vi.mock('./components/ProtectedRoute', () => ({
  default: ({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) => {
    protectedRoles.push(allowedRoles);
    return <>{children}</>;
  },
}));

import App from './App';

/**
 * Helper to update browser location state and render the App component
 */
const renderAt = (path: string) => {
  window.history.pushState({}, 'Test page', path);
  return render(<App />);
};

describe('App route wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    protectedRoles = [];
  });

  it('guards /whitelist with only ROLE_MAINTENANCE_SET_UP', () => {
    renderAt('/whitelist');

    expect(protectedRoles[0]).toEqual(['ROLE_MAINTENANCE_SET_UP']);
  });

  it('guards /thresholds with the maintenance/checker roles', () => {
    renderAt('/thresholds');

    expect(protectedRoles[0]).toEqual([
      'ROLE_MAINTENANCE_SET_UP',
      'ROLE_PAYMENT_CHECKER',
      'ROLE_SUPER_CHECKER',
    ]);
  });

  it('matches the dynamic :id param route for instruction detail', () => {
    renderAt('/instructions/12345');

    expect(screen.getByTestId('instruction-detail')).toBeTruthy();
  });
});