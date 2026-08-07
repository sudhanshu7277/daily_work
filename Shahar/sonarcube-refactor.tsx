
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





// src/pages/auth/AccessDeniedPage.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccessDeniedPage from './AccessDeniedPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@citi-icg-172888/icgds-react', () => ({
  El: ({ children, className, style }: any) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  Icon: ({ type, style }: any) => (
    <span data-testid={`icon-${type}`} style={style} />
  ),
  Button: ({ children, onClick, type }: any) => (
    <button data-type={type} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('AccessDeniedPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders access denied heading, icon, and explanation text', () => {
    render(<AccessDeniedPage />);

    expect(screen.getByRole('heading', { level: 2, name: 'Access Denied' })).toBeInTheDocument();
    expect(
      screen.getByText(/you do not have the required permissions to view this page/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('icon-lock')).toBeInTheDocument();
  });

  it('navigates to dashboard ("/") when "Return to Dashboard" button is clicked', () => {
    render(<AccessDeniedPage />);

    const button = screen.getByRole('button', { name: 'Return to Dashboard' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});