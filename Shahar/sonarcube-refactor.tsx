// cmd to run tests locally

npx vitest run --coverage


// src/pages/audit/AuditTrailPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// --- Hoisted Mock Declarations ---
// vi.hoisted guarantees these mock variables are initialized BEFORE any vi.mock factories run
const {
  mockNotification,
  mockGetAuditTrail,
  mockNavigate,
} = vi.hoisted(() => ({
  mockNotification: {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  mockGetAuditTrail: vi.fn(),
  mockNavigate: vi.fn(),
}));

// --- Mocks ---

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/audit', () => ({
  getAuditTrail: (...a: unknown[]) => mockGetAuditTrail(...a),
  getAuditLogs: (...a: unknown[]) => mockGetAuditTrail(...a),
}));

vi.mock('@citi-icg-172888/icgds-react', () => ({
  El: ({ children, className, style, ...props }: any) => (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, title, disabled, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} title={title} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
  Input: ({ value, onChange, placeholder, disabled, style }: any) => (
    <input
      placeholder={placeholder}
      value={value ?? ''}
      disabled={disabled}
      style={style}
      onChange={onChange}
      data-testid={`input-${placeholder || 'default'}`}
    />
  ),
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  Tab: ({ children }: any) => <div>{children}</div>,
  Alert: ({ children, type }: any) => <div data-testid={`alert-${type}`}>{children}</div>,
  Loading: ({ tip }: any) => <div>{tip}</div>,
  Icon: ({ type, className }: any) => <i className={`icon-${type} ${className || ''}`} />,
  notification: mockNotification,
}));

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      <div data-testid="grid-row-count">{rowData?.length ?? 0}</div>
      {rowData?.map((row: any, rowIndex: number) => (
        <div key={row.id || rowIndex} data-testid={`grid-row-${rowIndex}`}>
          {columnDefs?.map((col: any, colIndex: number) => {
            const cellParams = {
              data: row,
              value: row[col.field],
              node: { data: row },
            };
            return (
              <div key={colIndex} data-testid={`cell-${col.field || col.headerName || colIndex}-${rowIndex}`}>
                {col.cellRenderer ? col.cellRenderer(cellParams) : String(row[col.field] ?? '')}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  ),
}));

import AuditTrailPage from './AuditTrailPage';

// --- Test Data Fixtures ---

const mockAuditLogs = [
  {
    id: '1',
    action: 'UPDATE_MAPPING',
    user: 'AB12345',
    timestamp: '2026-08-11T10:00:00Z',
    details: 'Updated document mapping record #101',
  },
  {
    id: '2',
    action: 'CREATE_TASK',
    user: 'CD67890',
    timestamp: '2026-08-11T11:00:00Z',
    details: 'Created new tickler task #202',
  },
];

describe('AuditTrailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuditTrail.mockResolvedValue(mockAuditLogs);
  });

  it('fetches and displays audit log entries in AG Grid on mount', async () => {
    render(<AuditTrailPage />);

    await waitFor(() => {
      expect(mockGetAuditTrail).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });
  });

  it('renders a danger alert if fetching audit records fails', async () => {
    mockGetAuditTrail.mockRejectedValueOnce(new Error('Failed to fetch audit records'));

    render(<AuditTrailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });
  });

  it('filters audit grid items when typing into search input', async () => {
    render(<AuditTrailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'UPDATE' } });

    expect(screen.getByTestId('grid-row-count')).toHaveTextContent('1');
  });

  it('reloads audit records when refresh button is clicked', async () => {
    render(<AuditTrailPage />);

    await waitFor(() => {
      expect(mockGetAuditTrail).toHaveBeenCalledTimes(1);
    });

    const refreshBtn = screen.getByTitle(/refresh/i);
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(mockGetAuditTrail).toHaveBeenCalledTimes(2);
    });
  });
});