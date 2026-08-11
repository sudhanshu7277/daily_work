// cmd to run tests locally

npx vitest run --coverage

// src/pages/tickler/TicklerTaskPage.test.tsx

// src/pages/tickler/TicklerTaskPage.test.tsx

// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { notification } from '@citi-icg-172888/icgds-react';
import React from 'react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockCreateTask = vi.fn();
const mockGetTasksByAssignee = vi.fn();
const mockGetTasksByRegion = vi.fn();
const mockCompleteTask = vi.fn();
const mockGetPendingCount = vi.fn();

vi.mock('../../api/tickler', () => ({
  createTask: (...a: unknown[]) => mockCreateTask(...a),
  getTasksByAssignee: (...a: unknown[]) => mockGetTasksByAssignee(...a),
  getTasksByRegion: (...a: unknown[]) => mockGetTasksByRegion(...a),
  completeTask: (...a: unknown[]) => mockCompleteTask(...a),
  getPendingCount: (...a: unknown[]) => mockGetPendingCount(...a),
}));

const mockGetRefDataByType = vi.fn();
vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...a: unknown[]) => mockGetRefDataByType(...a),
}));

vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => v,
}));

vi.mock('../../utils/auth', () => ({
  getUserId: () => 'AB12345',
}));

const mockNotification = {
  success: vi.fn(),
  danger: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock('@citi-icg-172888/icgds-react', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    notification: mockNotification,
  };
});

import TicklerTaskPage from './TicklerTaskPage';

const sampleTask = {
  taskId: 5,
  instructionId: 200,
  taskDescription: 'Follow up on callback',
  assignedTo: 'AB12345',
  priority: 'HIGH',
  region: 'NAM',
  dueDate: '2026-06-01',
  completedOn: null,
};

describe('TicklerTaskPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTasksByAssignee.mockResolvedValue({ data: [] });
    mockGetPendingCount.mockResolvedValue({ data: 0 });
    mockGetRefDataByType.mockResolvedValue({ data: [] });
  });

  it('renders the page header with the pending count', async () => {
    mockGetPendingCount.mockResolvedValue({ data: 7 });
    render(<TicklerTaskPage />);
    await waitFor(() => {
      expect(screen.getByText('Tickler Tasks')).toBeInTheDocument();
      expect(screen.getByText('(7 pending)')).toBeInTheDocument();
    });
  });

  it('loads tasks and pending count on mount using the default assignee', async () => {
    render(<TicklerTaskPage />);
    await waitFor(() => {
      expect(mockGetTasksByAssignee).toHaveBeenCalledWith('AB12345');
      expect(mockGetPendingCount).toHaveBeenCalled();
    });
  });

  it('unwraps a paged response via the .content branch', async () => {
    mockGetTasksByAssignee.mockResolvedValue({ data: { content: [sampleTask] } });
    render(<TicklerTaskPage />);
    await waitFor(() => {
      expect(screen.getByText('Follow up on callback')).toBeInTheDocument();
    });
  });

  it('displays task data in the grid', async () => {
    mockGetTasksByAssignee.mockResolvedValue({ data: [sampleTask] });
    render(<TicklerTaskPage />);
    await waitFor(() => {
      expect(screen.getByText('Follow up on callback')).toBeInTheDocument();
      expect(screen.getByText('#200')).toBeInTheDocument();
    });
  });

  it('shows an error alert when loading fails', async () => {
    mockGetTasksByAssignee.mockRejectedValue(new Error('Network error'));
    render(<TicklerTaskPage />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('falls back to a default message for non-Error throws', async () => {
    mockGetTasksByAssignee.mockRejectedValue('boom');
    render(<TicklerTaskPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });
  });

  it('navigates to the instruction detail when the link is clicked', async () => {
    mockGetTasksByAssignee.mockResolvedValue({ data: [sampleTask] });
    render(<TicklerTaskPage />);
    await waitFor(() => expect(screen.getByText('#200')).toBeInTheDocument());
    fireEvent.click(screen.getByText('#200'));
    expect(mockNavigate).toHaveBeenCalledWith('/instructions/200');
  });

  it('completes a task from the Complete action button', async () => {
    mockGetTasksByAssignee.mockResolvedValue({ data: [sampleTask] });
    mockCompleteTask.mockResolvedValue({ data: {} });
    render(<TicklerTaskPage />);
    await waitFor(() => expect(screen.getByText('Complete')).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText('Complete'));
    });

    expect(mockCompleteTask).toHaveBeenCalledWith(5);
    await waitFor(() => expect(notification.success).toHaveBeenCalled());
  });

  it('shows a validation error when creating a task with missing fields', async () => {
    render(<TicklerTaskPage />);
    await waitFor(() => expect(screen.getByText('Create Task')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Task'));
    await waitFor(() => expect(screen.getByText('Create')).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText('Create'));
    });

    expect(notification.danger).toHaveBeenCalledWith({
      title: 'Validation',
      content: 'Instruction ID, description, and assignee are required',
    });
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('creates a task when the form is valid', async () => {
    mockCreateTask.mockResolvedValue({ data: {} });
    render(<TicklerTaskPage />);
    await waitFor(() => expect(screen.getByText('Create Task')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Task'));
    await waitFor(() => expect(screen.getByText('Create')).toBeInTheDocument());
    const instructionInput = screen.getByRole('spinbutton');
    fireEvent.change(instructionInput, { target: { value: '200' } });
    const description = screen.getByPlaceholderText('Task description');
    fireEvent.change(description, { target: { value: 'Do the thing' } });
    const assignee = screen.getByPlaceholderText('User ID');
    fireEvent.change(assignee, { target: { value: 'CD67890' } });
    await act(async () => {
      fireEvent.click(screen.getByText('Create'));
    });

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        instructionId: 200,
        taskDescription: 'Do the thing',
        assignedTo: 'CD67890',
      }),
    );

    await waitFor(() => expect(notification.success).toHaveBeenCalled());
  });

  it('shows a create error notification when createTask fails', async () => {
    mockCreateTask.mockRejectedValue(new Error('Create failed'));
    render(<TicklerTaskPage />);
    await waitFor(() => expect(screen.getByText('Create Task')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Create Task'));
    await waitFor(() => expect(screen.getByText('Create')).toBeInTheDocument());
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Task description'), { target: { value: 'x' } });
    fireEvent.change(screen.getByPlaceholderText('User ID'), { target: { value: 'y' } });
    await act(async () => {
      fireEvent.click(screen.getByText('Create'));
    });
    await waitFor(() => expect(notification.danger).toHaveBeenCalled());
  });
});