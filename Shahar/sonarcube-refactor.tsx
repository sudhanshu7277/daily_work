// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// IntakeChannelsPage.test.tsx


// src/pages/intakeChannels/IntakeChannelsPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---- Vitest Hoisted Mocks ----
const { mockNotification } = vi.hoisted(() => ({
  mockNotification: {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// ---- API Mocks ----
const mockGetIntakeChannels = vi.fn();
const mockUpdateIntakeChannel = vi.fn();

vi.mock('../../api/intakeChannels', () => ({
  getIntakeChannels: (...a: unknown[]) => mockGetIntakeChannels(...a),
  updateIntakeChannel: (...a: unknown[]) => mockUpdateIntakeChannel(...a),
}));

// ---- Utils & Formatting Mocks ----
vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => v,
  formatDateTime: (v: string) => v,
}));

// ---- AG-Grid Mocks ----
vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-theme-quartz.css', () => ({}));
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData }: { rowData: unknown[] }) =>
    React.createElement('div', {
      'data-testid': 'ag-grid',
      'data-rowcount': rowData?.length ?? 0,
    }),
}));

// ---- Design System Mock ----
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, type }: any) =>
      R.createElement('button', { onClick, title, disabled, type }, children),
    Input: ({ value, onChange, placeholder, disabled, style, name }: any) =>
      R.createElement('input', {
        name,
        placeholder,
        value: value ?? '',
        disabled,
        style,
        onChange,
        'data-testid': `input-${name || placeholder || 'default'}`,
      }),
    Alert: ({ children, type }: any) =>
      R.createElement('div', { role: 'alert', 'data-testid': `alert-${type}` }, children),
    Loading: ({ tip }: any) =>
      R.createElement('div', { 'data-testid': 'loading' }, tip || 'Loading...'),
    Icon: ({ type, className }: any) =>
      R.createElement('i', { className: `icon-${type} ${className || ''}` }),
    Card: ({ children, className, style }: any) =>
      R.createElement('div', { className, style }, children),
    Tag: ({ children, color }: any) =>
      R.createElement('span', { 'data-color': color }, children),
    Modal: ({ visible, children, title, onCancel, onApply }: any) =>
      visible
        ? R.createElement(
            'div',
            { role: 'dialog', 'data-testid': 'modal' },
            R.createElement('h2', null, title),
            children,
            R.createElement('button', { type: 'button', onClick: onCancel }, 'Cancel'),
            R.createElement('button', { type: 'button', onClick: onApply }, 'Save')
          )
        : null,
    Dropdown: Object.assign(
      ({ value, onChange, children, disabled, placeholder }: any) =>
        R.createElement(
          'select',
          {
            role: 'combobox',
            value: value ?? '',
            disabled,
            onChange: (e: any) => onChange(e.target.value),
          },
          placeholder && R.createElement('option', { value: '' }, placeholder),
          children
        ),
      { Item: ({ value, children }: any) => R.createElement('option', { value }, children) }
    ),
    notification: mockNotification,
  };
});

import IntakeChannelsPage from './IntakeChannelsPage';

const sampleChannels = {
  data: {
    content: [
      { id: 1, channelName: 'SWIFT', channelType: 'SWIFT_MT', status: 'ACTIVE' },
      { id: 2, channelName: 'EMAIL_INTAKE', channelType: 'EMAIL', status: 'ACTIVE' },
    ],
    totalElements: 2,
  },
};

describe('IntakeChannelsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIntakeChannels.mockResolvedValue(sampleChannels);
    mockUpdateIntakeChannel.mockResolvedValue({ success: true });
  });

  it('renders intake channels page and loads data on mount', async () => {
    render(<IntakeChannelsPage />);

    expect(screen.getByTestId('loading')).toBeTruthy();

    await waitFor(() => {
      expect(mockGetIntakeChannels).toHaveBeenCalled();
    });

    const grid = await screen.findByTestId('ag-grid');
    expect(grid.getAttribute('data-rowcount')).toBe('2');
  });

  it('displays an error alert when intake channel fetch fails', async () => {
    mockGetIntakeChannels.mockRejectedValueOnce(new Error('Failed to load intake channels'));

    render(<IntakeChannelsPage />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to load intake channels');
  });

  it('triggers refresh when refresh button is clicked', async () => {
    render(<IntakeChannelsPage />);

    await screen.findByTestId('ag-grid');

    const refreshBtn = screen.getByText(/Refresh/i);
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(mockGetIntakeChannels).toHaveBeenCalledTimes(2);
    });
  });
});