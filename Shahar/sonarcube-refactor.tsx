// src/App.test.tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock AppLayout (renders child routes)
vi.mock('./components/layout/AppLayout', () => ({
  __esModule: true,
  default: () => <div data-testid="app-layout">App Layout</div>,
}));

// Mock AuthProvider context wrapper
vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock ProtectedRoute wrapper
vi.mock('./components/auth/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock all imported page components
vi.mock('./pages/dashboard/DashboardPage', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('./pages/instructions/InstructionListPage', () => ({ default: () => <div>Instruction List Page</div> }));
vi.mock('./pages/instructions/CreateInstructionPage', () => ({ default: () => <div>Create Instruction Page</div> }));
vi.mock('./pages/instructions/InstructionDetailPage', () => ({ default: () => <div>Instruction Detail Page</div> }));
vi.mock('./pages/instructions/CompletedInstructionsPage', () => ({ default: () => <div>Completed Instructions Page</div> }));
vi.mock('./pages/approval/ApprovalQueuePage', () => ({ default: () => <div>Approval Queue Page</div> }));
vi.mock('./pages/thresholds/ThresholdManagementPage', () => ({ default: () => <div>Threshold Management Page</div> }));
vi.mock('./pages/audit/AuditTrailPage', () => ({ default: () => <div>Audit Trail Page</div> }));
vi.mock('./pages/whitelist/WhitelistManagementPage', () => ({ default: () => <div>Whitelist Management Page</div> }));
vi.mock('./pages/refdata/ReferenceDataPage', () => ({ default: () => <div>Reference Data Page</div> }));
vi.mock('./pages/maintenance/MaintenancePage', () => ({ default: () => <div>Maintenance Page</div> }));
vi.mock('./pages/signature/SignatureVerificationPage', () => ({ default: () => <div>Signature Verification Page</div> }));
vi.mock('./pages/auth/AccessDeniedPage', () => ({ default: () => <div>Access Denied Page</div> }));
vi.mock('./pages/intakeChannels/IntakeChannelsPage', () => ({ default: () => <div>Intake Channels Page</div> }));
vi.mock('./pages/documentViewer/DocumentViewerPage', () => ({ default: () => <div>Document Viewer Page</div> }));
vi.mock('./pages/nativeDocViewer/NativeDocViewerPage', () => ({ default: () => <div>Native Doc Viewer Page</div> }));

import App from './App';

describe('App Component', () => {
  it('renders application router and auth provider without crashing', () => {
    // Set URL path matching the basename
    window.history.pushState({}, 'Test Page', '/nextgengab/ui/');

    render(<App />);

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });
});

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