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
  mockGetTasksByAssignee,
  mockGetTasksByRegion,
  mockGetPendingCount,
  mockCompleteTask,
  mockCreateTask,
  mockGetRefDataByType,
  mockGetUserId,
  mockNavigate,
} = vi.hoisted(() => ({
  mockNotification: {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  mockGetTasksByAssignee: vi.fn(),
  mockGetTasksByRegion: vi.fn(),
  mockGetPendingCount: vi.fn(),
  mockCompleteTask: vi.fn(),
  mockCreateTask: vi.fn(),
  mockGetRefDataByType: vi.fn(),
  mockGetUserId: vi.fn(),
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

vi.mock('../../api/tickler', () => ({
  getTasksByAssignee: (...a: unknown[]) => mockGetTasksByAssignee(...a),
  getTasksByRegion: (...a: unknown[]) => mockGetTasksByRegion(...a),
  getPendingCount: (...a: unknown[]) => mockGetPendingCount(...a),
  completeTask: (...a: unknown[]) => mockCompleteTask(...a),
  createTask: (...a: unknown[]) => mockCreateTask(...a),
}));

vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...a: unknown[]) => mockGetRefDataByType(...a),
}));

vi.mock('../../utils/auth', () => ({
  getUserId: () => mockGetUserId(),
}));

vi.mock('../../utils/format', () => ({
  formatDate: (val: string) => `Formatted: ${val}`,
}));

vi.mock('../../components/common/PriorityTag', () => ({
  default: ({ priority }: { priority: string }) => <div data-testid="priority-tag">{priority}</div>,
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) => (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    ),
    Button: ({ children, onClick, title, disabled, color, size, 'aria-label': ariaLabel }: any) => (
      <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        aria-label={ariaLabel}
        data-testid={`btn-${color || 'default'}`}
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
    TextArea: ({ value, onChange, placeholder, disabled }: any) => (
      <textarea
        placeholder={placeholder}
        value={value ?? ''}
        disabled={disabled}
        onChange={onChange}
        data-testid={`textarea-${placeholder || 'default'}`}
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
    Tab: Object.assign(
      ({ children }: any) => <div data-testid="tabs">{children}</div>,
      {
        TabPane: ({ children, tab }: any) => (
          <div>
            <div>{tab}</div>
            {children}
          </div>
        ),
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
              <div key={colIndex} data-testid={`cell-${col.field || col.colId || colIndex}-${rowIndex}`}>
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

import TicklerTaskPage from './TicklerTaskPage';

// --- Test Data Fixtures ---

const mockTasksList = [
  {
    taskId: 101,
    instructionId: 5001,
    taskDescription: 'Review Compliance Docs',
    assignedTo: 'USER123',
    priority: 'HIGH',
    region: 'NAM',
    dueDate: '2026-09-01',
    completedOn: null,
  },
  {
    taskId: 102,
    instructionId: 5002,
    taskDescription: 'Verify Credit Assessment',
    assignedTo: 'USER123',
    priority: 'MEDIUM',
    region: 'EMEA',
    dueDate: '2026-08-15',
    completedOn: '2026-08-10',
  },
];

const mockRegionRefData = {
  data: [
    { refCode: 'NAM', refValue: 'North America' },
    { refCode: 'EMEA', refValue: 'Europe, Middle East, Africa' },
  ],
};

describe('TicklerTaskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserId.mockReturnValue('USER123');
    mockGetTasksByAssignee.mockResolvedValue({ data: mockTasksList });
    mockGetPendingCount.mockResolvedValue({ data: 1 });
    mockGetRefDataByType.mockResolvedValue(mockRegionRefData);
    mockCompleteTask.mockResolvedValue({ status: 200 });
    mockCreateTask.mockResolvedValue({ status: 200 });
  });

  it('fetches tickler tasks and region refData on mount', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(mockGetTasksByAssignee).toHaveBeenCalledWith('USER123');
      expect(mockGetPendingCount).toHaveBeenCalledTimes(1);
      expect(mockGetRefDataByType).toHaveBeenCalledWith('REGION');
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    expect(screen.getByText(/1 pending/i)).toBeInTheDocument();
  });

  it('displays danger alert if fetching tickler tasks rejects', async () => {
    mockGetTasksByAssignee.mockRejectedValueOnce(new Error('Network error'));

    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
      expect(screen.getByTestId('alert-danger')).toHaveTextContent('Failed to load tasks');
    });
  });

  it('navigates to instruction detail page when clicking instruction ID link in cell', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const link = screen.getByText('#5001');
    fireEvent.click(link);

    expect(mockNavigate).toHaveBeenCalledWith('/instructions/5001');
  });

  it('triggers validation alert if required fields are missing during task creation', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByText('Create Task'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Create'));

    expect(mockNotification.danger).toHaveBeenCalledWith({
      title: 'Validation',
      content: 'Instruction ID, description, and assignee are required',
    });
  });

  it('opens Create Task modal, populates form fields, and submits new task', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    fireEvent.click(screen.getByText('Create Task'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const idInput = screen.getByTestId('input-number');
    fireEvent.change(idInput, { target: { value: '9001' } });

    const descInput = screen.getByPlaceholderText('Task description');
    fireEvent.change(descInput, { target: { value: 'Annual KYC Audit' } });

    const assigneeInput = screen.getByPlaceholderText('User ID');
    fireEvent.change(assigneeInput, { target: { value: 'USER999' } });

    fireEvent.click(screen.getByText('Create'));

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          instructionId: 9001,
          taskDescription: 'Annual KYC Audit',
          assignedTo: 'USER999',
        })
      );
      expect(mockNotification.success).toHaveBeenCalledWith({
        title: 'Created',
        content: 'Task created successfully',
      });
    });
  });

  it('completes pending task via action cell button', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(screen.getByTestId('grid-row-count')).toHaveTextContent('2');
    });

    const completeBtn = screen.getByText('Complete');
    fireEvent.click(completeBtn);

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockCompleteTask).toHaveBeenCalledWith(101);
      expect(mockNotification.success).toHaveBeenCalledWith({
        title: 'Completed',
        content: 'Task marked as complete',
      });
    });
  });

  it('reloads task list when Refresh button is clicked', async () => {
    render(<TicklerTaskPage />);

    await waitFor(() => {
      expect(mockGetTasksByAssignee).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(mockGetTasksByAssignee).toHaveBeenCalledTimes(2);
    });
  });
});