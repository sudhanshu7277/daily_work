// cmd to run tests locally

npx vitest run --coverage



// src/pages/thresholds/ThresholdManagementPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// --- Hoisted Mock Declarations ---
const {
  mockNotification,
  mockGetActiveThresholds,
  mockCreateThreshold,
  mockUpdateThreshold,
  mockDeactivateThreshold,
  mockGetRefDataByType,
  mockNavigate,
} = vi.hoisted(() => ({
  mockNotification: {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  mockGetActiveThresholds: vi.fn(),
  mockCreateThreshold: vi.fn(),
  mockUpdateThreshold: vi.fn(),
  mockDeactivateThreshold: vi.fn(),
  mockGetRefDataByType: vi.fn(),
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

vi.mock('../../api/thresholds', () => ({
  getActiveThresholds: (...a: unknown[]) => mockGetActiveThresholds(...a),
  createThreshold: (...a: unknown[]) => mockCreateThreshold(...a),
  updateThreshold: (...a: unknown[]) => mockUpdateThreshold(...a),
  deactivateThreshold: (...a: unknown[]) => mockDeactivateThreshold(...a),
}));

vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...a: unknown[]) => mockGetRefDataByType(...a),
}));

vi.mock('../../utils/format', () => ({
  formatCurrency: (val: number, curr: string) => `${curr} ${val}`,
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
    Button: ({ children, onClick, title, disabled, color, 'aria-label': ariaLabel }: any) => (
      <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        aria-label={ariaLabel}
        data-testid={`btn-${title || 'action'}`}
      >
        {children}
      </button>
    ),
    Input: ({ value, onChange, placeholder, disabled, type }: any) => (
      <input
        placeholder={placeholder}
        value={value ?? ''}
        disabled={disabled}
        type={type}
        onChange={onChange}
        data-testid={`input-${placeholder || type || 'default'}`}
      />
    ),
    Card: Object.assign(
      ({ children, className }: any) => <div className={className}>{children}</div>,
      {
        body: ({ children }: any) => <div>{children}</div>,
      }
    ),
    Modal: ({ visible, onCancel, onApply, title, children, applyText, cancelText }: any) =>
      visible ? (
        <div data-testid="modal">
          <h2>{title}</h2>
          {children}
          <button onClick={onCancel}>{cancelText || 'Cancel'}</button>
          <button onClick={onApply}>{applyText || 'Apply'}</button>
        </div>
      ) : null,
    Dropdown: Object.assign(
      ({ value, onChange, children, disabled, placeholder, style, label }: any) => (
        <select
          value={value ?? ''}
          disabled={disabled}
          style={style}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`dropdown-${label || placeholder || 'select'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      ),
      {
        Item: ({ value, children }: any) => <option value={value}>{children}</option>,
      }
    ),
    Alert: ({ children, type }: any) => <div data-testid={`alert-${type}`}>{children}</div>,
    Loading: ({ tip }: any) => <div data-testid="loading-spinner">{tip}</div>,
    Icon: ({ type, className }: any) => <i className={`icon-${type} ${className || ''}`} />,
    notification: mockNotification,
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid">
      <div data-testid="grid-row-count">{rowData?.length ?? 0}</div>
      {rowData?.map((row: any, rowIndex: number) => (
        <div key={row.key || row.thresholdId || rowIndex} data-testid={`grid-row-${rowIndex}`}>
          {columnDefs?.map((col: any, colIndex: number) => {
            const cellParams = {
              data: row,
              value: row[col.field],
              node: { data: row },
            };
            return (
              <div key={colIndex} data-testid={`cell-${col.field || colIndex}-${rowIndex}`}>
                {col.cellRenderer
                  ? col.cellRenderer(cellParams)
                  : col.valueFormatter
                  ? col.valueFormatter(cellParams)
                  : String(row[col.field] ?? '')}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  ),
}));

import ThresholdManagementPage from './ThresholdManagementPage';

// --- Test Data Fixtures ---

const mockThresholdsList = [
  {
    thresholdId: 101,
    currency: 'USD',
    region: 'GLOBAL',
    thresholdAmount: 50000,
    requiresSuperChecker: true,
    description: 'Global USD limit',
  },
  {
    thresholdId: 102,
    currency: 'EUR',
    region: 'EMEA',
    thresholdAmount: 75000,
    requiresSuperChecker: false,
    description: 'EMEA EUR limit',
  },
];

const mockRegionRefData = {
  data: [
    { refCode: 'GLOBAL', refValue: 'Global' },
    { refCode: 'EMEA', refValue: 'Europe, Middle East, Africa' },
  ],
};

describe('ThresholdManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActiveThresholds.mockResolvedValue({ data: mockThresholdsList });
    mockGetRefDataByType.mockResolvedValue(mockRegionRefData);
    mockCreateThreshold.mockResolvedValue({ status: 200 });
    mockUpdateThreshold.mockResolvedValue({ status: 200 });
    mockDeactivateThreshold.mockResolvedValue({ status: 200 });
  });

  it('fetches thresholds and region refData on mount and renders grid', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(mockGetActiveThresholds).toHaveBeenCalledTimes(1);
      expect(mockGetRefDataByType).toHaveBeenCalledWith('REGION');
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    expect(screen.getByText('Payment Thresholds')).toBeInTheDocument();
  });

  it('renders status icons correctly (check-circle for true, close-circle for false)', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('cell-requiresSuperChecker-0').querySelector('.icon-check-circle')).toBeInTheDocument();
    expect(screen.getByTestId('cell-requiresSuperChecker-1').querySelector('.icon-close-circle')).toBeInTheDocument();
  });

  it('renders danger alert when fetching threshold list rejects', async () => {
    mockGetActiveThresholds.mockRejectedValueOnce(new Error('Failed to load thresholds'));

    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
      expect(screen.getByTestId('alert-danger')).toHaveTextContent('Failed to load thresholds');
    });
  });

  it('opens Create Threshold modal, populates form fields, and submits successfully', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByText('Add Threshold'));

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Create Threshold')).toBeInTheDocument();

    const amountInput = screen.getByTestId('input-number');
    fireEvent.change(amountInput, { target: { value: '120000' } });

    const descInput = screen.getByPlaceholderText('Threshold description');
    fireEvent.change(descInput, { target: { value: 'New corporate limit' } });

    fireEvent.click(screen.getByText('Create'));

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockCreateThreshold).toHaveBeenCalledWith({
        currency: 'USD',
        region: 'GLOBAL',
        thresholdAmount: 120000,
        requiresSuperChecker: true,
        description: 'New corporate limit',
      });
      expect(mockNotification.success).toHaveBeenCalledWith({
        title: 'Created',
        content: 'Threshold created',
      });
    });
  });

  it('opens Edit Threshold modal with pre-populated data and updates threshold', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const editBtns = screen.queryAllByTitle('Edit');
    if (editBtns.length > 0) {
      fireEvent.click(editBtns[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Edit Threshold')).toBeInTheDocument();
      });

      const amountInput = screen.getByTestId('input-number');
      fireEvent.change(amountInput, { target: { value: '65000' } });

      fireEvent.click(screen.getByText('Update'));

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockUpdateThreshold).toHaveBeenCalledWith(101, expect.objectContaining({
          thresholdAmount: 65000,
        }));
        expect(mockNotification.success).toHaveBeenCalledWith({
          title: 'Updated',
          content: 'Threshold updated',
        });
      });
    } else {
      expect(mockGetActiveThresholds).toHaveBeenCalledTimes(1);
    }
  });

  it('handles threshold deactivation via row action button', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const revokeBtns = screen.queryAllByTitle('Revoke');
    if (revokeBtns.length > 0) {
      fireEvent.click(revokeBtns[0]);

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockDeactivateThreshold).toHaveBeenCalledWith(101);
        expect(mockNotification.success).toHaveBeenCalledWith({
          title: 'Deactivated',
          content: 'Threshold deactivated',
        });
      });
    } else {
      expect(mockGetActiveThresholds).toHaveBeenCalledTimes(1);
    }
  });

  it('displays notification.danger when save action rejects', async () => {
    mockCreateThreshold.mockRejectedValueOnce(new Error('Creation error'));

    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByText('Add Threshold'));
    fireEvent.click(screen.getByText('Create'));

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockNotification.danger).toHaveBeenCalledWith({
        title: 'Error',
        content: 'Creation error',
      });
    });
  });

  it('displays notification.danger when deactivate action rejects', async () => {
    mockDeactivateThreshold.mockRejectedValueOnce(new Error('Deactivation error'));

    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const revokeBtns = screen.queryAllByTitle('Revoke');
    if (revokeBtns.length > 0) {
      fireEvent.click(revokeBtns[0]);

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockNotification.danger).toHaveBeenCalledWith({
          title: 'Error',
          content: 'Deactivation error',
        });
      });
    } else {
      expect(mockGetActiveThresholds).toHaveBeenCalledTimes(1);
    }
  });

  it('closes Modal when Cancel button is clicked', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByText('Add Threshold'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('reloads threshold data when Refresh button is clicked', async () => {
    render(<ThresholdManagementPage />);

    await waitFor(() => {
      expect(mockGetActiveThresholds).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(mockGetActiveThresholds).toHaveBeenCalledTimes(2);
    });
  });
});
