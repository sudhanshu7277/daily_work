
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





// src/pages/thresholds/ThresholdManagementPage.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThresholdManagementPage from './ThresholdManagementPage';
import {
  getActiveThresholds,
  createThreshold,
  updateThreshold,
  deactivateThreshold,
} from '../../api/thresholds';
import { getRefDataByType } from '../../api/refdata';
import { notification } from '@citi-icg-172888/icgds-react';

vi.mock('../../api/thresholds', () => ({
  getActiveThresholds: vi.fn(),
  createThreshold: vi.fn(),
  updateThreshold: vi.fn(),
  deactivateThreshold: vi.fn(),
}));

vi.mock('../../api/refdata', () => ({
  getRefDataByType: vi.fn(),
}));

vi.mock('../../utils/format', () => ({
  formatCurrency: (amount: number, currency: string) => `${currency} ${amount}`,
}));

vi.mock('@citi-icg-172888/icgds-react', () => {
  const notificationObj = {
    success: vi.fn(),
    danger: vi.fn(),
  };

  const DropdownComponent = ({ value, onChange, children, label }: any) => (
    <div data-testid="dropdown">
      {label && <span>{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="dropdown-select"
      >
        {children}
      </select>
    </div>
  );

  DropdownComponent.Item = ({ value, children }: any) => (
    <option value={value}>{children}</option>
  );

  return {
    notification: notificationObj,
    El: ({ children, className, style }: any) => (
      <div className={className} style={style}>{children}</div>
    ),
    Icon: ({ type, className, style }: any) => (
      <span data-testid={`icon-${type}`} className={className} style={style} />
    ),
    Button: ({ children, onClick, color, size }: any) => (
      <button data-color={color} data-size={size} onClick={onClick}>{children}</button>
    ),
    Input: ({ value, onChange, placeholder, type }: any) => (
      <input
        type={type || 'text'}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
      />
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
    Dropdown: DropdownComponent,
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid-mock">
      {rowData?.map((row: any, rowIndex: number) => (
        <div key={row.key || rowIndex} data-testid={`grid-row-${rowIndex}`}>
          {columnDefs?.map((col: any) => (
            <span key={col.field || col.headerName} data-testid={`cell-${col.field}-${rowIndex}`}>
              {col.valueFormatter
                ? col.valueFormatter({ value: row[col.field], data: row })
                : col.cellRenderer
                ? col.cellRenderer({ value: row[col.field], data: row })
                : String(row[col.field] ?? '')}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe('ThresholdManagementPage Component', () => {
  const mockThresholds = [
    {
      thresholdId: 1,
      currency: 'USD',
      region: 'GLOBAL',
      thresholdAmount: 100000,
      requiresSuperChecker: true,
      description: 'Global USD Limit',
    },
    {
      thresholdId: 2,
      currency: 'EUR',
      region: 'EMEA',
      thresholdAmount: 50000,
      requiresSuperChecker: false,
      description: 'EMEA EUR Limit',
    },
  ];

  const mockRegionRefData = {
    data: [
      { refCode: 'GLOBAL', refValue: 'Global Region' },
      { refCode: 'EMEA', refValue: 'Europe, Middle East, Africa' },
      { refCode: 'APAC', refValue: 'Asia Pacific' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActiveThresholds).mockResolvedValue({ data: mockThresholds } as any);
    vi.mocked(getRefDataByType).mockResolvedValue(mockRegionRefData as any);
  });

  it('renders title, fetches active thresholds, and loads region refdata', async () => {
    render(<ThresholdManagementPage />);

    expect(screen.getByTestId('loading-indicator')).toHaveTextContent('Loading thresholds...');

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });

    expect(screen.getByText('Payment Thresholds')).toBeInTheDocument();
    expect(getActiveThresholds).toHaveBeenCalledTimes(1);
    expect(getRefDataByType).toHaveBeenCalledWith('REGION');
  });

  it('displays alert message when thresholds API fails', async () => {
    vi.mocked(getActiveThresholds).mockRejectedValue(new Error('Failed to load thresholds'));

    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-message')).toHaveTextContent('Failed to load thresholds');
    });
  });

  it('opens Create Threshold modal, fills all fields including description & super checker, and submits', async () => {
    vi.mocked(createThreshold).mockResolvedValue({} as any);

    render(<ThresholdManagementPage />);

    await waitFor(() => expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument());

    const addBtn = screen.getByRole('button', { name: /add threshold/i });
    fireEvent.click(addBtn);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Create Threshold')).toBeInTheDocument();

    // Fill form inputs
    const amountInput = screen.getByRole('spinbutton');
    fireEvent.change(amountInput, { target: { value: '250000' } });

    const descInput = screen.getByPlaceholderText('Threshold description');
    fireEvent.change(descInput, { target: { value: 'High Value Threshold' } });

    // Select Super Checker Option
    const selects = screen.getAllByTestId('dropdown-select');
    const superCheckerSelect = selects[selects.length - 1];
    fireEvent.change(superCheckerSelect, { target: { value: 'false' } });

    const applyBtn = screen.getByTestId('modal-apply-btn');

    await act(async () => {
      fireEvent.click(applyBtn);
    });

    expect(createThreshold).toHaveBeenCalledWith({
      currency: 'USD',
      region: 'GLOBAL',
      thresholdAmount: 250000,
      requiresSuperChecker: false,
      description: 'High Value Threshold',
    });
    expect(notification.success).toHaveBeenCalledWith({
      title: 'Created',
      content: 'Threshold created',
    });
    expect(getActiveThresholds).toHaveBeenCalledTimes(2);
  });

  it('handles errors when createThreshold fails', async () => {
    vi.mocked(createThreshold).mockRejectedValue(new Error('Save failed'));

    render(<ThresholdManagementPage />);

    await waitFor(() => expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /add threshold/i }));

    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-apply-btn'));
    });

    expect(notification.danger).toHaveBeenCalledWith({
      title: 'Error',
      content: 'Save failed',
    });
  });

  it('reloads data on clicking Refresh button', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument());

    const refreshBtn = screen.getByRole('button', { name: /refresh/i });

    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    expect(getActiveThresholds).toHaveBeenCalledTimes(2);
  });
});