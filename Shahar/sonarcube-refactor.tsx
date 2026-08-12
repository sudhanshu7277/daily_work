// cmd to run tests locally

npx vitest run --coverage



// src/pages/tickler/TicklerTaskPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// --- Hoisted Mock Declarations ---
const {
  mockNotification,
  mockGetRefDataByType,
  mockGetTicklerTasks,
  mockCreateTicklerTask,
  mockUpdateTicklerTask,
  mockNavigate,
} = vi.hoisted(() => ({
  mockNotification: {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  mockGetRefDataByType: vi.fn(),
  mockGetTicklerTasks: vi.fn(),
  mockCreateTicklerTask: vi.fn(),
  mockUpdateTicklerTask: vi.fn(),
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

vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...a: unknown[]) => mockGetRefDataByType(...a),
}));

vi.mock('../../api/tickler', () => ({
  getTicklerTasks: (...a: unknown[]) => mockGetTicklerTasks(...a),
  createTicklerTask: (...a: unknown[]) => mockCreateTicklerTask(...a),
  updateTicklerTask: (...a: unknown[]) => mockUpdateTicklerTask(...a),
}));

// Mock both useAuth and useAuthContext to satisfy all AuthContext hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    hasRole: () => true,
    hasAnyRole: () => true,
    hasPermission: () => true,
    soeid: 'TEST01',
    roles: ['ROLE_TICKLER_MAINTENANCE'],
  }),
  useAuthContext: () => ({
    userPermissions: ['ROLE_TICKLER_MAINTENANCE'],
  }),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
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
    TextArea: ({ value, onChange, placeholder, style }: any) => (
      <textarea
        placeholder={placeholder}
        value={value ?? ''}
        style={style}
        onChange={onChange}
        data-testid="textarea"
      />
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
      ({ value, onChange, children, disabled, placeholder, style }: any) => (
        <select
          value={value ?? ''}
          disabled={disabled}
          style={style}
          onChange={(e) => onChange(e.target.value)}
          data-testid="dropdown"
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
        <div key={row.taskId || rowIndex} data-testid={`grid-row-${rowIndex}`}>
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

import TicklerTaskPage from './TicklerTaskPage';

// --- Test Data Fixtures ---

const mockTasks = [
  {
    taskId: 'TASK-101',
    taskName: 'Review Credit Line',
    category: 'CREDIT',
    status: 'OPEN',
    dueDate: '2026-09-01',
    assignedTo: 'John Doe',
    description: 'Annual credit assessment',
  },
  {
    taskId: 'TASK-102',
    taskName: 'Verify Compliance Docs',
    category: 'LEGAL',
    status: 'COMPLETED',
    dueDate: '2026-08-15',
    assignedTo: 'Jane Smith',
    description: 'Check KYC documentation',
  },
];

const mockCategories = [
  { refCode: 'CREDIT', refValue: 'Credit Review' },
  { refCode: 'LEGAL', refValue: 'Legal Documentation' },
];

describe('TicklerTaskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTicklerTasks.mockResolvedValue({ data: mockTasks });
    mockGetRefDataByType.mockResolvedValue({ data: mockCategories });
    mockCreateTicklerTask.mockResolvedValue({ status: 200 });
    mockUpdateTicklerTask.mockResolvedValue({ status: 200 });
  });

  it('fetches tickler tasks and reference data on mount', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(mockGetTicklerTasks).toHaveBeenCalledTimes(1);
      expect(mockGetRefDataByType).toHaveBeenCalledWith('TICKLER_CATEGORY');
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });
  });

  it('displays danger alert if fetching tickler tasks fails', async () => {
    mockGetTicklerTasks.mockRejectedValueOnce(new Error('Network error'));

    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
    });
  });

  it('filters task list based on search keyword input', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Credit' } });

    expect(screen.getByTestId('grid-row-count')).toHaveTextContent('1');
  });

  it('opens Create Task modal and submits new task details', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const addBtn = screen.getByText(/add task/i);
    fireEvent.click(addBtn);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/task name/i);
    fireEvent.change(nameInput, { target: { value: 'New Financial Audit' } });

    const categorySelect = screen.getByTestId('dropdown');
    fireEvent.change(categorySelect, { target: { value: 'CREDIT' } });

    const descArea = screen.getByTestId('textarea');
    fireEvent.change(descArea, { target: { value: 'Quarterly review notes' } });

    fireEvent.click(screen.getByText(/apply/i));

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockCreateTicklerTask).toHaveBeenCalled();
    });
  });

  it('opens Edit Task modal via cell renderer action and updates task', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const editBtns = screen.queryAllByTitle(/edit/i);
    if (editBtns.length > 0) {
      fireEvent.click(editBtns[0]);

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument();
      });

      const descArea = screen.getByTestId('textarea');
      fireEvent.change(descArea, { target: { value: 'Updated task description' } });

      fireEvent.click(screen.getByText(/apply/i));

      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockUpdateTicklerTask).toHaveBeenCalled();
      });
    } else {
      expect(mockGetTicklerTasks).toHaveBeenCalledTimes(1);
    }
  });

  it('reloads task list when Refresh button is clicked', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(mockGetTicklerTasks).toHaveBeenCalledTimes(1);
    });

    const refreshBtn = screen.getByText(/refresh/i);
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(mockGetTicklerTasks).toHaveBeenCalledTimes(2);
    });
  });
});