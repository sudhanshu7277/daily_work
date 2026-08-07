
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





// src/pages/tickler/TicklerTaskPage.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TicklerTaskPage from './TicklerTaskPage';
import { createTask, getTasksByAssignee, getTasksByRegion, completeTask, getPendingCount } from '../../api/tickler';
import { getRefDataByType } from '../../api/refdata';
import { notification } from '@citi-icg-172888/icgds-react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../api/tickler', () => ({
  createTask: vi.fn(),
  getTasksByAssignee: vi.fn(),
  getTasksByRegion: vi.fn(),
  completeTask: vi.fn(),
  getPendingCount: vi.fn(),
}));

vi.mock('../../api/refdata', () => ({
  getRefDataByType: vi.fn(),
}));

vi.mock('../../utils/auth', () => ({
  getUserId: () => 'USER123',
}));

vi.mock('../../utils/format', () => ({
  formatDate: (val: string) => `Formatted:${val}`,
}));

vi.mock('../../components/common/PriorityTag', () => ({
  default: ({ priority }: any) => <span data-testid="priority-tag">{priority}</span>,
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
    Icon: ({ type, className }: any) => (
      <span data-testid={`icon-${type}`} className={className} />
    ),
    Button: ({ children, onClick, color }: any) => (
      <button data-color={color} onClick={onClick}>{children}</button>
    ),
    Input: ({ value, onChange, placeholder, type }: any) => (
      <input
        type={type || 'text'}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
      />
    ),
    TextArea: ({ value, onChange, placeholder }: any) => (
      <textarea
        placeholder={placeholder}
        value={value ?? ''}
        onChange={onChange}
      />
    ),
    Card: Object.assign(
      ({ children, className }: any) => <div className={className}>{children}</div>,
      { body: ({ children }: any) => <div data-testid="card-body">{children}</div> }
    ),
    Loading: ({ tip }: any) => <div data-testid="loading-indicator">{tip}</div>,
    Alert: ({ children, type }: any) => <div data-testid="alert-error" data-type={type}>{children}</div>,
    Modal: ({ children, visible, onCancel, onApply, applyText, title }: any) =>
      visible ? (
        <div data-testid="modal">
          <h2>{title}</h2>
          <div data-testid="modal-content">{children}</div>
          <button data-testid="modal-cancel-btn" onClick={onCancel}>Cancel</button>
          <button data-testid="modal-apply-btn" onClick={onApply}>{applyText}</button>
        </div>
      ) : null,
    Dropdown: Object.assign(
      ({ children, value, onChange, placeholder }: any) => (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} data-testid="dropdown">
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      ),
      { Item: ({ children, value }: any) => <option value={value}>{children}</option> }
    ),
    Tab: Object.assign(
      ({ children, activeKey, onChange }: any) => (
        <div>
          <div data-testid="tab-headers">
            {React.Children.map(children, (child: any) => (
              <button
                key={child.key || child.props.key}
                data-testid={`tab-${child.key || child.props.key}`}
                onClick={() => onChange(child.key || child.props.key)}
              >
                {child.props.tab}
              </button>
            ))}
          </div>
          <div>
            {React.Children.map(children, (child: any) =>
              (child.key || child.props.key) === activeKey ? child.props.children : null
            )}
          </div>
        </div>
      ),
      { TabPane: ({ children }: any) => <div>{children}</div> }
    ),
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => {
    const instCol = columnDefs?.find((c: any) => c.field === 'instructionId');
    const priorityCol = columnDefs?.find((c: any) => c.field === 'priority');
    const actionsCol = columnDefs?.find((c: any) => c.colId === 'actions');

    return (
      <div data-testid="ag-grid">
        {rowData?.map((row: any, idx: number) => (
          <div key={row.taskId || idx} data-testid={`grid-row-${idx}`}>
            <span data-testid={`task-id-${idx}`}>{row.taskId}</span>
            <div data-testid={`instruction-cell-${idx}`}>
              {instCol?.cellRenderer ? instCol.cellRenderer({ value: row.instructionId }) : null}
            </div>
            <div data-testid={`priority-cell-${idx}`}>
              {priorityCol?.cellRenderer ? priorityCol.cellRenderer({ value: row.priority }) : null}
            </div>
            <div data-testid={`actions-cell-${idx}`}>
              {actionsCol?.cellRenderer ? actionsCol.cellRenderer({ data: row }) : null}
            </div>
          </div>
        ))}
      </div>
    );
  },
}));

describe('TicklerTaskPage Component', () => {
  const mockTasks = [
    {
      taskId: 1,
      instructionId: 5001,
      taskDescription: 'Review payment details',
      assignedTo: 'USER123',
      priority: 'HIGH',
      region: 'NAM',
      dueDate: '2026-08-15',
      completedOn: null,
    },
    {
      taskId: 2,
      instructionId: 5002,
      taskDescription: 'Completed task',
      assignedTo: 'USER123',
      priority: 'LOW',
      region: 'EMEA',
      dueDate: '2026-08-10',
      completedOn: '2026-08-11',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTasksByAssignee).mockResolvedValue({ data: mockTasks } as any);
    vi.mocked(getPendingCount).mockResolvedValue({ data: 3 } as any);
    vi.mocked(getRefDataByType).mockResolvedValue({
      data: [
        { refCode: 'NAM', refValue: 'North America' },
        { refCode: 'EMEA', refValue: 'Europe, Middle East, Africa' },
      ],
    } as any);
  });

  it('renders heading and loads initial tasks and pending count', async () => {
    render(<TicklerTaskPage />);

    expect(await screen.findByRole('heading', { level: 2, name: /tickler tasks/i })).toBeInTheDocument();
    expect(screen.getByText('(3 pending)')).toBeInTheDocument();
    expect(screen.getByTestId('ag-grid')).toBeInTheDocument();

    expect(getTasksByAssignee).toHaveBeenCalledWith('USER123');
    expect(getPendingCount).toHaveBeenCalled();
    expect(getRefDataByType).toHaveBeenCalledWith('REGION');
  });

  it('navigates to instruction details when clicking instruction link', async () => {
    render(<TicklerTaskPage />);

    const instructionLink = await screen.findByText('#5001');
    fireEvent.click(instructionLink);

    expect(mockNavigate).toHaveBeenCalledWith('/instructions/5001');
  });

  it('completes a task successfully', async () => {
    vi.mocked(completeTask).mockResolvedValue({} as any);

    render(<TicklerTaskPage />);

    const completeBtn = await screen.findByRole('button', { name: /complete/i });
    await act(async () => {
      fireEvent.click(completeBtn);
    });

    expect(completeTask).toHaveBeenCalledWith(1);
    expect(notification.success).toHaveBeenCalledWith({
      title: 'Completed',
      content: 'Task marked as complete',
    });
  });

  it('shows error notification when completeTask fails', async () => {
    vi.mocked(completeTask).mockRejectedValue(new Error('Complete failed'));

    render(<TicklerTaskPage />);

    const completeBtn = await screen.findByRole('button', { name: /complete/i });
    await act(async () => {
      fireEvent.click(completeBtn);
    });

    expect(notification.danger).toHaveBeenCalledWith({
      title: 'Error',
      content: 'Complete failed',
    });
  });

  it('switches to region tab and searches by region', async () => {
    vi.mocked(getTasksByRegion).mockResolvedValue({ data: [mockTasks[0]] } as any);

    render(<TicklerTaskPage />);

    const regionTab = await screen.findByTestId('tab-region');
    fireEvent.click(regionTab);

    const dropdowns = screen.getAllByTestId('dropdown');
    fireEvent.change(dropdowns[0], { target: { value: 'NAM' } });

    const searchButtons = screen.getAllByRole('button', { name: /search/i });
    await act(async () => {
      fireEvent.click(searchButtons[searchButtons.length - 1]);
    });

    expect(getTasksByRegion).toHaveBeenCalledWith('NAM');
  });

  it('opens create modal, validates required fields, and creates a task', async () => {
    vi.mocked(createTask).mockResolvedValue({} as any);

    render(<TicklerTaskPage />);

    const createBtn = await screen.findByRole('button', { name: /create task/i });
    fireEvent.click(createBtn);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    const applyBtn = screen.getByTestId('modal-apply-btn');

    // Trigger validation with empty fields
    await act(async () => {
      fireEvent.click(applyBtn);
    });

    expect(notification.danger).toHaveBeenCalledWith({
      title: 'Validation',
      content: 'Instruction ID, description, and assignee are required',
    });

    // Fill in required fields
    const inputs = screen.getAllByRole('textbox');
    const descTextarea = screen.getByPlaceholderText('Task description');
    const numberInputs = screen.getAllByRole('spinbutton');

    fireEvent.change(numberInputs[0], { target: { value: '9999' } });
    fireEvent.change(descTextarea, { target: { value: 'New Test Task' } });
    fireEvent.change(inputs.find((i) => i.getAttribute('placeholder') === 'User ID')!, {
      target: { value: 'USER999' },
    });

    await act(async () => {
      fireEvent.click(applyBtn);
    });

    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        instructionId: 9999,
        taskDescription: 'New Test Task',
        assignedTo: 'USER999',
      })
    );
    expect(notification.success).toHaveBeenCalledWith({
      title: 'Created',
      content: 'Task created successfully',
    });
  });

  it('handles error during initial loading', async () => {
    vi.mocked(getTasksByAssignee).mockRejectedValue(new Error('Failed to load tasks'));

    render(<TicklerTaskPage />);

    expect(await screen.findByTestId('alert-error')).toHaveTextContent('Failed to load tasks');
  });
});