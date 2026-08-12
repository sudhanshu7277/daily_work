// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// src/pages/emailIntake/EmailIntakeAuditPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---- Stub DOM Blob/URL APIs for jsdom ----
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:http://localhost/mock-blob-url'),
    writable: true,
  });
}
if (typeof window.URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: vi.fn(),
    writable: true,
  });
}

// --- API Mocks ---
const mockGetAuditPage = vi.fn();
const mockGetInboxPage = vi.fn();

vi.mock('../../api/emailIntake', () => ({
  getAuditPage: (...a: unknown[]) => mockGetAuditPage(...a),
  getInboxPage: (...a: unknown[]) => mockGetInboxPage(...a),
}));

// --- Export Utility Mock ---
const mockExportToCsv = vi.fn();
vi.mock('../../utils/exportExcel', () => ({
  exportToCsv: (...a: unknown[]) => mockExportToCsv(...a),
}));

// --- Format Utility Mock ---
vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => v,
  formatDateTime: (v: string) => v,
}));

// --- AG-Grid Mocks ---
vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-theme-quartz.css', () => ({}));
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData }: { rowData: unknown[] }) =>
    React.createElement('div', {
      'data-testid': 'ag-grid',
      'data-rowcount': rowData?.length ?? 0,
    }),
}));

// --- Design System Mock ---
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, 'aria-label': ariaLabel }: any) =>
      R.createElement('button', { onClick, title, disabled, 'aria-label': ariaLabel }, children),
    Input: ({ value, onChange, placeholder, disabled, style }: any) =>
      R.createElement('input', {
        placeholder,
        value: value ?? '',
        disabled,
        style,
        onChange,
        'data-testid': `input-${placeholder || 'default'}`,
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
  };
});

import EmailIntakeAuditPage from './EmailIntakeAuditPage';

const auditData = {
  data: {
    content: [
      {
        id: 1,
        emailSubject: 'Payment Instruction',
        sender: 'client@example.com',
        status: 'PROCESSED',
        receivedAt: '2026-01-01',
      },
    ],
    totalElements: 1,
    totalPages: 1,
  },
};

const inboxData = {
  data: {
    content: [
      {
        id: 2,
        emailSubject: 'Urgent Wire',
        sender: 'vendor@example.com',
        status: 'PENDING',
        receivedAt: '2026-01-02',
      },
      {
        id: 3,
        emailSubject: 'Statement Request',
        sender: 'info@example.com',
        status: 'COMPLETED',
        receivedAt: '2026-01-03',
      },
    ],
    totalElements: 2,
    totalPages: 1,
  },
};

describe('EmailIntakeAuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuditPage.mockResolvedValue(auditData);
    mockGetInboxPage.mockResolvedValue(inboxData);
  });

  it('loads audit data on mount and renders the grid with the audit rows', async () => {
    render(<EmailIntakeAuditPage />);

    expect(screen.getByTestId('loading')).toBeTruthy();

    await waitFor(() => {
      expect(mockGetAuditPage).toHaveBeenCalled();
    });

    const grid = await screen.findByTestId('ag-grid');
    expect(grid.getAttribute('data-rowcount')).toBe('1');
  });

  it('switches to the inbox tab and loads inbox data', async () => {
    render(<EmailIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    const inboxTab = screen.getByText(/Inbox/i);
    fireEvent.click(inboxTab);

    await waitFor(() => {
      expect(mockGetInboxPage).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid').getAttribute('data-rowcount')).toBe('2');
    });
  });

  it('shows an error alert when the audit fetch fails', async () => {
    mockGetAuditPage.mockRejectedValueOnce(new Error('Failed to fetch audit data'));

    render(<EmailIntakeAuditPage />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to fetch audit data');
  });

  it('exports CSV when audit data is present', async () => {
    render(<EmailIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    const exportBtn = screen.getByText(/Export CSV/i);
    fireEvent.click(exportBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('does not export when there is no audit content', async () => {
    mockGetAuditPage.mockResolvedValueOnce({
      data: { content: [], totalElements: 0, totalPages: 0 },
    });

    render(<EmailIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    const exportBtn = screen.getByText(/Export CSV/i);
    fireEvent.click(exportBtn);

    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });
});