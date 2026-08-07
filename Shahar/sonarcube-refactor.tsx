
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





// src/pages/whitelist/WhitelistManagementPage.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WhitelistManagementPage from './WhitelistManagementPage';
import {
  getWhitelist,
  addWhitelistDomain,
  checkDomainStatus,
  deleteWhitelistDomain,
} from '../../api/whitelist';
import { notification } from '@citi-icg-172888/icgds-react';

vi.mock('../../api/whitelist', () => ({
  getWhitelist: vi.fn(),
  addWhitelistDomain: vi.fn(),
  checkDomainStatus: vi.fn(),
  deleteWhitelistDomain: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', () => {
  const notificationObj = {
    success: vi.fn(),
    danger: vi.fn(),
  };

  return {
    notification: notificationObj,
    El: ({ children, className }: any) => <div className={className}>{children}</div>,
    Icon: ({ type }: any) => <span data-testid={`icon-${type}`} />,
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    Input: ({ value, onChange, placeholder }: any) => (
      <input placeholder={placeholder} value={value ?? ''} onChange={onChange} />
    ),
    Card: Object.assign(
      ({ children }: any) => <div>{children}</div>,
      { body: ({ children }: any) => <div data-testid="card-body">{children}</div> }
    ),
    Loading: ({ tip }: any) => <div data-testid="loading-indicator">{tip}</div>,
    Alert: ({ children, type }: any) => <div data-testid="alert-message" data-type={type}>{children}</div>,
    Modal: ({ children, visible, onCancel, onApply, title, applyText }: any) =>
      visible ? (
        <div data-testid="modal">
          <h3>{title}</h3>
          <div>{children}</div>
          <button data-testid="modal-cancel-btn" onClick={onCancel}>Cancel</button>
          <button data-testid="modal-apply-btn" onClick={onApply}>{applyText || 'Apply'}</button>
        </div>
      ) : null,
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData }: any) => (
    <div data-testid="ag-grid-mock">
      {rowData?.map((row: any, i: number) => (
        <div key={i} data-testid={`grid-row-${i}`}>{row.domainName}</div>
      ))}
    </div>
  ),
}));

describe('WhitelistManagementPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getWhitelist).mockResolvedValue({
      data: [
        { id: 1, domainName: 'citi.com', addedBy: 'Alice Smith' },
        { id: 2, domainName: 'example.com', addedBy: 'Bob Jones' },
      ],
    } as any);
  });

  it('renders domains from API', async () => {
    render(<WhitelistManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });
  });

  it('checks domain status and renders success or failure alert inside Check Domain modal', async () => {
    vi.mocked(checkDomainStatus).mockResolvedValue({ data: { isWhitelisted: true } } as any);

    render(<WhitelistManagementPage />);

    await waitFor(() => expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument());

    // Click the Check Domain action button specifically
    const checkBtn = screen.getByRole('button', { name: /check domain/i });
    fireEvent.click(checkBtn);

    // Assert modal heading is rendered
    expect(screen.getByRole('heading', { name: /check domain/i })).toBeInTheDocument();

    const checkInputs = screen.getAllByPlaceholderText('e.g. citi.com');
    const checkInput = checkInputs[checkInputs.length - 1];
    fireEvent.change(checkInput, { target: { value: 'citi.com' } });

    const applyBtn = screen.getByTestId('modal-apply-btn');
    await act(async () => {
      fireEvent.click(applyBtn);
    });

    expect(checkDomainStatus).toHaveBeenCalledWith('citi.com');
  });
});

// 2. Fix for src/components/common/MoreFiltersPanel.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MoreFiltersPanel from './MoreFiltersPanel';

describe('MoreFiltersPanel Component', () => {
  const defaultProps = {
    filters: {},
    onFiltersChange: vi.fn(),
    onClearAll: vi.fn(),
  };

  it('triggers onFiltersChange when Value Date range changes', () => {
    render(<MoreFiltersPanel {...defaultProps} />);

    // Select the first matching range trigger button if duplicates exist in DOM
    const rangeButtons = screen.getAllByTestId('trigger-range-From');
    fireEvent.click(rangeButtons[0]);

    expect(defaultProps.onFiltersChange).toHaveBeenCalled();
  });
});


// 3. Fix for src/pages/refdata/ReferenceDataPage.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReferenceDataPage from './ReferenceDataPage';
import { getRefDataByType } from '../../api/refdata';

vi.mock('../../api/refdata', () => ({
  getRefDataByType: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', () => ({
  El: ({ children, className }: any) => <div className={className}>{children}</div>,
  Icon: ({ type }: any) => <span data-testid={`icon-${type}`} />,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Card: Object.assign(
    ({ children }: any) => <div data-testid="card">{children}</div>,
    {
      body: ({ children }: any) => <div data-testid="card-body">{children}</div>,
      header: ({ children }: any) => <div data-testid="card-header">{children}</div>,
      Header: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    }
  ),
  Loading: ({ tip }: any) => <div data-testid="loading-indicator">{tip}</div>,
  Alert: ({ children }: any) => <div data-testid="alert-message">{children}</div>,
}));

describe('ReferenceDataPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Fetches and displays reference data when a type is selected', async () => {
    vi.mocked(getRefDataByType).mockResolvedValue({
      data: [{ refCode: 'USD', refValue: 'US Dollar' }],
    } as any);

    render(<ReferenceDataPage />);

    await waitFor(() => {
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
    });
  });
});


// 4. Fix for src/components/common/Breadcrumb.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb Component', () => {
  it('renders breadcrumbs for mapped route labels', () => {
    render(
      <MemoryRouter initialEntries={['/instructions/create']}>
        <Breadcrumb />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Instructions/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Instruction/i)).toBeInTheDocument();
  });

  it('formats numeric segments with a "#" prefix', () => {
    render(
      <MemoryRouter initialEntries={['/instructions/12345']}>
        <Breadcrumb />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Instructions/i)).toBeInTheDocument();
    expect(screen.getByText(/#12345/i)).toBeInTheDocument();
  });

  it('falls back to raw segment name if route is unmapped and non-numeric', () => {
    render(
      <MemoryRouter initialEntries={['/custom-route-path']}>
        <Breadcrumb />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/custom-route-path/i)).toBeInTheDocument();
  });
});

