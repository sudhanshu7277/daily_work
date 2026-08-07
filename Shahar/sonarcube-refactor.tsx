
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
import { getActiveWhitelist, checkDomain, addDomain, deactivateDomain } from '../../api/whitelist';
import { fetchGabUser } from '../../api/gabUser';
import { notification } from '@citi-icg-172888/icgds-react';

vi.mock('../../api/whitelist', () => ({
  getActiveWhitelist: vi.fn(),
  checkDomain: vi.fn(),
  addDomain: vi.fn(),
  deactivateDomain: vi.fn(),
}));

vi.mock('../../api/gabUser', () => ({
  fetchGabUser: vi.fn(),
}));

vi.mock('../../utils/format', () => ({
  formatDateTime: (d: string) => `FormattedDate:${d}`,
}));

vi.mock('@citi-icg-172888/icgds-react', () => {
  const notificationObj = {
    success: vi.fn(),
    danger: vi.fn(),
  };

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
    Input: ({ value, onChange, placeholder }: any) => (
      <input
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
    Modal: ({ children, visible, onCancel, onApply, title }: any) =>
      visible ? (
        <div data-testid="modal">
          <h3>{title}</h3>
          <div>{children}</div>
          <button data-testid="modal-cancel-btn" onClick={onCancel}>Cancel</button>
          <button data-testid="modal-apply-btn" onClick={onApply}>Apply</button>
        </div>
      ) : null,
    Table: ({ data, columns }: any) => (
      <table data-testid="whitelist-table">
        <thead>
          <tr>
            {columns?.map((col: any) => (
              <th key={col.key || col.dataIndex}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row: any, rowIndex: number) => (
            <tr key={row.key || rowIndex} data-testid={`row-${rowIndex}`}>
              {columns?.map((col: any) => (
                <td key={col.key || col.dataIndex} data-testid={`cell-${col.key || col.dataIndex}-${rowIndex}`}>
                  {col.render
                    ? col.render(row[col.dataIndex], row)
                    : String(row[col.dataIndex] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
  };
});

describe('WhitelistManagementPage Component', () => {
  const mockWhitelistData = [
    {
      whitelistId: 101,
      domainName: 'citi.com',
      description: 'Corporate domain',
      createdBy: 'USER1',
      modifiedBy: 'USER2',
      createdOn: '2026-01-15T10:00:00Z',
      isActive: true,
    },
    {
      whitelistId: 102,
      domainName: 'partner.org',
      description: 'Partner domain',
      createdBy: 'SYSTEM',
      updatedBy: 'USER1',
      createdOn: '2026-02-01T12:00:00Z',
      isActive: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActiveWhitelist).mockResolvedValue({ data: mockWhitelistData } as any);
    vi.mocked(fetchGabUser).mockImplementation((key: string) => {
      if (key === 'USER1') {
        return Promise.resolve({ data: { firstName: 'Alice', lastName: 'Smith' } } as any);
      }
      if (key === 'USER2') {
        return Promise.resolve({ data: { firstName: 'Bob', lastName: 'Jones' } } as any);
      }
      return Promise.resolve({ data: null } as any);
    });
  });

  it('renders title and loads whitelist table with formatted data', async () => {
    render(<WhitelistManagementPage />);

    expect(screen.getByText('Loading whitelist...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('whitelist-table')).toBeInTheDocument();
    });

    expect(screen.getByText('Domain Whitelist')).toBeInTheDocument();
    expect(screen.getByText('citi.com')).toBeInTheDocument();
    expect(screen.getByText('partner.org')).toBeInTheDocument();
    expect(screen.getByText('FormattedDate:2026-01-15T10:00:00Z')).toBeInTheDocument();
  });

  it('resolves user SOEIDs and renders resolved full names', async () => {
    render(<WhitelistManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    expect(fetchGabUser).toHaveBeenCalledWith('USER1');
    expect(fetchGabUser).toHaveBeenCalledWith('USER2');
  });

  it('displays alert message when initial data fetch fails', async () => {
    vi.mocked(getActiveWhitelist).mockRejectedValue(new Error('Network Error'));

    render(<WhitelistManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-message')).toHaveTextContent('Network Error');
    });
  });

  it('opens Add Domain modal, validates input, and successfully adds a domain', async () => {
    vi.mocked(addDomain).mockResolvedValue({} as any);

    render(<WhitelistManagementPage />);

    await waitFor(() => expect(screen.getByText('citi.com')).toBeInTheDocument());

    const addBtn = screen.getByRole('button', { name: /add domain/i });
    fireEvent.click(addBtn);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Add Domain to Whitelist')).toBeInTheDocument();

    const applyBtn = screen.getByTestId('modal-apply-btn');

    // Submit with empty domain
    await act(async () => {
      fireEvent.click(applyBtn);
    });

    expect(notification.danger).toHaveBeenCalledWith({
      title: 'Validation',
      content: 'Domain name is required',
    });

    // Enter valid domain and description
    const domainInput = screen.getByPlaceholderText('e.g. citi.com');
    const descInput = screen.getByPlaceholderText('Description');

    fireEvent.change(domainInput, { target: { value: 'example.com' } });
    fireEvent.change(descInput, { target: { value: 'Test description' } });

    await act(async () => {
      fireEvent.click(applyBtn);
    });

    expect(addDomain).toHaveBeenCalledWith({
      domainName: 'example.com',
      description: 'Test description',
    });
    expect(notification.success).toHaveBeenCalledWith({
      title: 'Added',
      content: 'Domain "example.com" added to whitelist',
    });
    expect(getActiveWhitelist).toHaveBeenCalledTimes(2);
  });

  it('shows error notification when addDomain API call fails', async () => {
    vi.mocked(addDomain).mockRejectedValue(new Error('Domain already exists'));

    render(<WhitelistManagementPage />);

    await waitFor(() => expect(screen.getByText('citi.com')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /add domain/i }));

    const domainInput = screen.getByPlaceholderText('e.g. citi.com');
    fireEvent.change(domainInput, { target: { value: 'duplicate.com' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-apply-btn'));
    });

    expect(notification.danger).toHaveBeenCalledWith({
      title: 'Error',
      content: 'Domain already exists',
    });
  });

  it('checks domain status and renders success or failure alert inside Check Domain modal', async () => {
    vi.mocked(checkDomain).mockResolvedValue({ data: true } as any);

    render(<WhitelistManagementPage />);

    await waitFor(() => expect(screen.getByText('citi.com')).toBeInTheDocument());

    const checkBtn = screen.getByRole('button', { name: /check domain/i });
    fireEvent.click(checkBtn);

    expect(screen.getByText('Check Domain')).toBeInTheDocument();

    const checkInput = screen.getAllByPlaceholderText('e.g. citi.com').pop()!;

    // Positive check (whitelisted)
    fireEvent.change(checkInput, { target: { value: 'citi.com' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-apply-btn'));
    });

    expect(checkDomain).toHaveBeenCalledWith('citi.com');
    expect(await screen.findByText('`citi.com` is whitelisted')).toBeInTheDocument();

    // Negative check (NOT whitelisted)
    vi.mocked(checkDomain).mockResolvedValue({ data: false } as any);
    fireEvent.change(checkInput, { target: { value: 'unknown.com' } });

    await act(async () => {
      fireEvent.click(screen.getByTestId('modal-apply-btn'));
    });

    expect(checkDomain).toHaveBeenCalledWith('unknown.com');
    expect(await screen.findByText('`unknown.com` is NOT whitelisted')).toBeInTheDocument();
  });

  it('clears state when cancelling the Check Domain modal', async () => {
    render(<WhitelistManagementPage />);

    await waitFor(() => expect(screen.getByText('citi.com')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /check domain/i }));

    const cancelBtn = screen.getByTestId('modal-cancel-btn');
    fireEvent.click(cancelBtn);

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('reloads data when clicking Refresh button', async () => {
    render(<WhitelistManagementPage />);

    await waitFor(() => expect(screen.getByText('citi.com')).toBeInTheDocument());

    const refreshBtn = screen.getByRole('button', { name: /refresh/i });
    await act(async () => {
      fireEvent.click(refreshBtn);
    });

    expect(getActiveWhitelist).toHaveBeenCalledTimes(2);
  });
});