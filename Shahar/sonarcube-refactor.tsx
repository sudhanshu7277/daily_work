// cmd to run tests locally

npx vitest run --coverage

// src/pages/audit/AuditTrailPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// --- Hoisted Mock Declarations ---
const {
  mockGetInstructionHistory,
  mockGetFieldHistory,
  mockNavigate,
} = vi.hoisted(() => ({
  mockGetInstructionHistory: vi.fn(),
  mockGetFieldHistory: vi.fn(),
  mockNavigate: vi.fn(),
}));

// --- Module Mocks ---

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api/audit', () => ({
  getInstructionHistory: (...a: unknown[]) => mockGetInstructionHistory(...a),
  getFieldHistory: (...a: unknown[]) => mockGetFieldHistory(...a),
}));

vi.mock('../../utils/format', () => ({
  formatDateTime: (val: string) => `Formatted: ${val}`,
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
    Button: ({ children, onClick, disabled, color, className }: any) => (
      <button onClick={onClick} disabled={disabled} className={className} data-testid="search-button">
        {children}
      </button>
    ),
    Input: ({ value, onChange, placeholder, disabled, onPressEnter }: any) => (
      <input
        placeholder={placeholder}
        value={value ?? ''}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onPressEnter) {
            onPressEnter();
          }
        }}
        data-testid="instruction-input"
      />
    ),
    Card: Object.assign(
      ({ children, className }: any) => <div className={className}>{children}</div>,
      {
        body: ({ children }: any) => <div>{children}</div>,
      }
    ),
    Tab: Object.assign(
      ({ children }: any) => <div data-testid="tabs">{children}</div>,
      {
        TabPane: ({ children, tab }: any) => (
          <div data-testid="tab-pane">
            <div data-testid="tab-header">{tab}</div>
            {children}
          </div>
        ),
      }
    ),
    Alert: ({ children, type }: any) => <div data-testid={`alert-${type}`}>{children}</div>,
    Loading: ({ tip }: any) => <div data-testid="loading-spinner">{tip}</div>,
    Icon: ({ type, className }: any) => <i className={`icon-${type} ${className || ''}`} />,
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      <div data-testid="grid-row-count">{rowData?.length ?? 0}</div>
      {rowData?.map((row: any, rowIndex: number) => (
        <div key={row.key || rowIndex} data-testid={`grid-row-${rowIndex}`}>
          {columnDefs?.map((col: any, colIndex: number) => (
            <div key={colIndex} data-testid={`cell-${col.field || colIndex}-${rowIndex}`}>
              {row[col.field] ?? ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

import AuditTrailPage from './AuditTrailPage';

// --- Test Fixtures ---

const mockHistoryResponse = {
  data: [
    {
      auditId: 1,
      instructionId: 101,
      action: 'STATUS_CHANGE',
      oldStatus: 'NEW',
      newStatus: 'APPROVED',
      comments: 'Approved by manager',
      performedBy: 'USER01',
      performedOn: '2026-08-11T10:00:00Z',
    },
  ],
};

const mockFieldHistoryResponse = {
  data: [
    {
      fieldName: 'amount',
      oldValue: '1000',
      newValue: '2000',
      changedBy: 'USER01',
      changedOn: '2026-08-11T10:05:00Z',
    },
  ],
};

describe('AuditTrailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInstructionHistory.mockResolvedValue(mockHistoryResponse);
    mockGetFieldHistory.mockResolvedValue(mockFieldHistoryResponse);
  });

  it('renders initial page state with disabled search button', () => {
    render(<AuditTrailPage />);

    expect(screen.getByText('Audit Trail')).toBeInTheDocument();

    const searchBtn = screen.getByTestId('search-button') as HTMLButtonElement;
    expect(searchBtn.disabled).toBe(true);
  });

  it('fetches history data when Instruction ID is entered and Search is clicked', async () => {
    render(<AuditTrailPage />);

    const input = screen.getByTestId('instruction-input');
    fireEvent.change(input, { target: { value: '101' } });

    const searchBtn = screen.getByTestId('search-button') as HTMLButtonElement;
    expect(searchBtn.disabled).toBe(false);

    fireEvent.click(searchBtn);

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockGetInstructionHistory).toHaveBeenCalledWith(101);
      expect(mockGetFieldHistory).toHaveBeenCalledWith(101);
    });

    expect(screen.getByText(/Action History/i)).toBeInTheDocument();
    expect(screen.getByText(/Field Changes/i)).toBeInTheDocument();
  });

  it('triggers search when Enter key is pressed inside the input field', async () => {
    render(<AuditTrailPage />);

    const input = screen.getByTestId('instruction-input');
    fireEvent.change(input, { target: { value: '202' } });

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockGetInstructionHistory).toHaveBeenCalledWith(202);
      expect(mockGetFieldHistory).toHaveBeenCalledWith(202);
    });
  });

  it('displays empty state messages when search returns no action or field history', async () => {
    mockGetInstructionHistory.mockResolvedValueOnce({ data: [] });
    mockGetFieldHistory.mockResolvedValueOnce({ data: [] });

    render(<AuditTrailPage />);

    const input = screen.getByTestId('instruction-input');
    fireEvent.change(input, { target: { value: '999' } });

    fireEvent.click(screen.getByTestId('search-button'));

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText('No action history found')).toBeInTheDocument();
      expect(screen.getByText('No field changes found')).toBeInTheDocument();
    });
  });

  it('displays danger alert when API fetch fails', async () => {
    mockGetInstructionHistory.mockRejectedValueOnce(new Error('Network Error'));

    render(<AuditTrailPage />);

    const input = screen.getByTestId('instruction-input');
    fireEvent.change(input, { target: { value: '101' } });

    fireEvent.click(screen.getByTestId('search-button'));

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
      expect(screen.getByTestId('alert-danger')).toHaveTextContent('Network Error');
    });
  });
});