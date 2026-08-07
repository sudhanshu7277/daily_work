
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





// src/pages/intakeChannels/IntakeChannelsPage.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IntakeChannelsPage from './IntakeChannelsPage';

vi.mock('../aws-sync/AwsTicklerSyncPage', () => ({
  default: () => <div data-testid="aws-sync-page">AWS Tickler Sync Page Content</div>,
}));

vi.mock('../emailIntake/EmailIntakeAuditPage', () => ({
  default: () => <div data-testid="email-intake-page">Email Intake Page Content</div>,
}));

vi.mock('../citiSftIntake/CitiSftIntakeAuditPage', () => ({
  default: () => <div data-testid="citisft-intake-page">CitiSFT Intake Page Content</div>,
}));

vi.mock('../tickler/TicklerTaskPage', () => ({
  default: () => <div data-testid="tickler-tasks-page">Tickler Tasks Page Content</div>,
}));

vi.mock('@citi-icg-172888/icgds-react', () => ({
  El: ({ children, className, style }: any) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  Icon: ({ type, className, style }: any) => (
    <span data-testid={`icon-${type}`} className={className} style={style} />
  ),
  Card: ({ children, onClick, className, layer }: any) => (
    <div
      data-testid="channel-card"
      data-layer={layer}
      className={className}
      onClick={onClick}
    >
      {children}
    </div>
  ),
}));

describe('IntakeChannelsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and all 4 channel cards initially with no active channel content', () => {
    render(<IntakeChannelsPage />);

    expect(screen.getByRole('heading', { level: 2, name: /intake channels/i })).toBeInTheDocument();
    expect(screen.getByTestId('icon-inbox')).toBeInTheDocument();

    expect(screen.getByText('AWS Tickler Sync')).toBeInTheDocument();
    expect(screen.getByText('Email Intake')).toBeInTheDocument();
    expect(screen.getByText('CitiSFT Intake')).toBeInTheDocument();
    expect(screen.getByText('Tickler Tasks')).toBeInTheDocument();

    expect(screen.queryByTestId('aws-sync-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('email-intake-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('citisft-intake-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tickler-tasks-page')).not.toBeInTheDocument();
  });

  it('activates channel component when channel card is clicked', () => {
    render(<IntakeChannelsPage />);

    const awsCard = screen.getByText('AWS Tickler Sync').closest('[data-testid="channel-card"]');
    expect(awsCard).toBeInTheDocument();

    fireEvent.click(awsCard!);

    expect(screen.getByTestId('aws-sync-page')).toBeInTheDocument();
  });

  it('switches active channel component when another channel card is clicked', () => {
    render(<IntakeChannelsPage />);

    const emailCard = screen.getByText('Email Intake').closest('[data-testid="channel-card"]');
    const citisftCard = screen.getByText('CitiSFT Intake').closest('[data-testid="channel-card"]');

    fireEvent.click(emailCard!);
    expect(screen.getByTestId('email-intake-page')).toBeInTheDocument();

    fireEvent.click(citisftCard!);
    expect(screen.queryByTestId('email-intake-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('citisft-intake-page')).toBeInTheDocument();
  });

  it('deselects and hides channel content when clicking an already active channel card', () => {
    render(<IntakeChannelsPage />);

    const tasksCard = screen.getByText('Tickler Tasks').closest('[data-testid="channel-card"]');

    fireEvent.click(tasksCard!);
    expect(screen.getByTestId('tickler-tasks-page')).toBeInTheDocument();

    fireEvent.click(tasksCard!);
    expect(screen.queryByTestId('tickler-tasks-page')).not.toBeInTheDocument();
  });
});