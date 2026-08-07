// src/App.test.tsx

import { render, screen } from '@testing-library/react';
import App from './App';

// Mock layout & context to avoid outer dependency failures
jest.mock('./components/layout/AppLayout', () => ({
  __esModule: true,
  default: () => <div data-testid="app-layout" />,
}));

jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('./components/auth/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock all page route components
jest.mock('./pages/dashboard/DashboardPage', () => () => <div>Dashboard Page</div>);
jest.mock('./pages/instructions/InstructionListPage', () => () => <div>Instruction List Page</div>);
jest.mock('./pages/instructions/CreateInstructionPage', () => () => <div>Create Instruction Page</div>);
jest.mock('./pages/instructions/InstructionDetailPage', () => () => <div>Instruction Detail Page</div>);
jest.mock('./pages/instructions/CompletedInstructionsPage', () => () => <div>Completed Instructions Page</div>);
jest.mock('./pages/approval/ApprovalQueuePage', () => () => <div>Approval Queue Page</div>);
jest.mock('./pages/thresholds/ThresholdManagementPage', () => () => <div>Threshold Management Page</div>);
jest.mock('./pages/audit/AuditTrailPage', () => () => <div>Audit Trail Page</div>);
jest.mock('./pages/whitelist/WhitelistManagementPage', () => () => <div>Whitelist Management Page</div>);
jest.mock('./pages/refdata/ReferenceDataPage', () => () => <div>Reference Data Page</div>);
jest.mock('./pages/maintenance/MaintenancePage', () => () => <div>Maintenance Page</div>);
jest.mock('./pages/signature/SignatureVerificationPage', () => () => <div>Signature Verification Page</div>);
jest.mock('./pages/auth/AccessDeniedPage', () => () => <div>Access Denied Page</div>);
jest.mock('./pages/intakeChannels/IntakeChannelsPage', () => () => <div>Intake Channels Page</div>);
jest.mock('./pages/documentViewer/DocumentViewerPage', () => () => <div>Document Viewer Page</div>);
jest.mock('./pages/nativeDocViewer/NativeDocViewerPage', () => () => <div>Native Doc Viewer Page</div>);

describe('App Component', () => {
  test('renders App component with router without crashing', () => {
    // Clear initial window location state
    window.history.pushState({}, 'Test page', '/nextgengab/ui/');

    render(<App />);

    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });
});

// 1. src/utils/auth.test.ts

import { /* import your auth functions here, e.g., getUserRoles, isAuthenticated */ } from './auth';

describe('auth utilities', () => {
  test('executes auth functions correctly', () => {
    // Add tests for functions exported in src/utils/auth.ts
  });
});

// 2. Run Jest with coverage to confirm:

npm test -- --coverage --watchAll=false