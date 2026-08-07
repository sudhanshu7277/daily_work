
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





// src/pages/refdata/ReferenceDataPage.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReferenceDataPage from './ReferenceDataPage';
import { getRefDataByType } from '../../api/refdata';

vi.mock('../../api/refdata', () => ({
  getRefDataByType: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', () => ({
  El: ({ children, className, style }: any) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  Icon: ({ type, style, className }: any) => (
    <span data-testid={`icon-${type}`} style={style} className={className} />
  ),
  Card: Object.assign(
    ({ children, className }: any) => <div className={className}>{children}</div>,
    {
      header: ({ children }: any) => <div data-testid="card-header">{children}</div>,
      body: ({ children }: any) => <div data-testid="card-body">{children}</div>,
    }
  ),
  Loading: ({ tip }: any) => <div data-testid="loading-indicator">{tip}</div>,
  Alert: ({ children, type }: any) => <div data-testid="alert-error" data-type={type}>{children}</div>,
  Dropdown: Object.assign(
    ({ children, value, onChange, placeholder }: any) => (
      <select
        data-testid="ref-type-dropdown"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    ),
    {
      Item: ({ children, value }: any) => <option value={value}>{children}</option>,
    }
  ),
}));

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => {
    const activeCol = columnDefs?.find((col: any) => col.field === 'isActive');
    return (
      <div data-testid="ag-grid">
        <span data-testid="grid-row-count">{rowData?.length}</span>
        {rowData?.map((row: any, idx: number) => (
          <div key={row.refId || idx} data-testid={`grid-row-${idx}`}>
            <span>{row.refCode}</span>
            <div data-testid={`active-cell-${idx}`}>
              {activeCol?.cellRenderer ? activeCol.cellRenderer({ value: row.isActive }) : null}
            </div>
          </div>
        ))}
      </div>
    );
  },
}));

describe('ReferenceDataPage Component', () => {
  const mockRefData = [
    {
      refId: 101,
      refType: 'CURRENCY',
      refCode: 'USD',
      refValue: 'US Dollar',
      description: 'United States Dollar',
      isActive: true,
      sortOrder: 1,
    },
    {
      refId: 102,
      refType: 'CURRENCY',
      refCode: 'EUR',
      refValue: 'Euro',
      description: 'Euro Currency',
      isActive: false,
      sortOrder: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading and dropdown options', () => {
    render(<ReferenceDataPage />);

    expect(screen.getByRole('heading', { level: 2, name: /reference data/i })).toBeInTheDocument();
    expect(screen.getByTestId('ref-type-dropdown')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'CURRENCY' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'COUNTRY' })).toBeInTheDocument();
  });

  it('fetches and displays reference data when a type is selected', async () => {
    vi.mocked(getRefDataByType).mockResolvedValue({ data: mockRefData } as any);

    render(<ReferenceDataPage />);

    const select = screen.getByTestId('ref-type-dropdown');

    await act(async () => {
      fireEvent.change(select, { target: { value: 'CURRENCY' } });
    });

    expect(getRefDataByType).toHaveBeenCalledWith('CURRENCY');
    expect(await screen.findByTestId('card-header')).toHaveTextContent('CURRENCY (2 records)');
    expect(screen.getByTestId('ag-grid')).toBeInTheDocument();
    expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');

    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
    expect(screen.getByTestId('icon-x-circle')).toBeInTheDocument();
  });

  it('renders empty state message when no records are returned', async () => {
    vi.mocked(getRefDataByType).mockResolvedValue({ data: [] } as any);

    render(<ReferenceDataPage />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('ref-type-dropdown'), { target: { value: 'REGION' } });
    });

    expect(await screen.findByText(/no reference data found for type "REGION"/i)).toBeInTheDocument();
    expect(screen.queryByTestId('ag-grid')).not.toBeInTheDocument();
  });

  it('renders error alert on fetch failure', async () => {
    vi.mocked(getRefDataByType).mockRejectedValue(new Error('Fetch failed'));

    render(<ReferenceDataPage />);

    await act(async () => {
      fireEvent.change(screen.getByTestId('ref-type-dropdown'), { target: { value: 'PRIORITY' } });
    });

    expect(await screen.findByTestId('alert-error')).toHaveTextContent('Failed to load reference data');
  });
});