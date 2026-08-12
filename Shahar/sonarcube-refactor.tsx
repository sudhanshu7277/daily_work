// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit



// src/pages/citiSftIntake/CitiSftIntakeAuditPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// --- API Mocks ---
const mockGetAuditPage = vi.fn();
const mockGetCitiSftPage = vi.fn();

vi.mock('../../api/citiSftIntake', () => ({
  getAuditPage: (...a: unknown[]) => mockGetAuditPage(...a),
  getCitiSftPage: (...a: unknown[]) => mockGetCitiSftPage(...a),
}));

// --- Format Util Mock ---
vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => v,
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

import CitiSftIntakeAuditPage from './CitiSftIntakeAuditPage';

const auditPage = {
  data: {
    content: [
      {
        auditId: 1,
        citiSftId: 10,
        eventType: 'FILE_RECEIVED',
        eventDetail: 'got it',
        status: 'COMPLETED',
        createdOn: '2026-01-01',
      },
    ],
    totalElements: 1,
    totalPages: 1,
  },
};

const inboxPage = {
  data: {
    content: [
      {
        citiSftId: 10,
        fileName: 'a.csv',
        countryCode: 'US',
        processingStatus: 'COMPLETED',
        gabInstructionId: 99,
        receivedOn: '2026-01-01',
      },
      {
        citiSftId: 11,
        fileName: 'b.csv',
        countryCode: 'GB',
        processingStatus: 'FAILED',
        gabInstructionId: null,
        receivedOn: '2026-01-02',
      },
    ],
    totalElements: 2,
    totalPages: 1,
  },
};

describe('CitiSftIntakeAuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuditPage.mockResolvedValue(auditPage);
    mockGetCitiSftPage.mockResolvedValue(inboxPage);
  });

  it('loads the audit tab on mount and renders its grid', async () => {
    render(<CitiSftIntakeAuditPage />);

    expect(screen.getByTestId('loading')).toBeTruthy();

    await waitFor(() => {
      expect(mockGetAuditPage).toHaveBeenCalledWith(0, 20, undefined);
    });

    const grid = await screen.findByTestId('ag-grid');
    expect(grid.getAttribute('data-rowcount')).toBe('1');
    expect(mockGetCitiSftPage).not.toHaveBeenCalled();
  });

  it('switches to the inbox tab and calls getCitiSftPage', async () => {
    render(<CitiSftIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    fireEvent.click(screen.getByText(/CitiSftIntake Inbox/i));

    await waitFor(() => {
      expect(mockGetCitiSftPage).toHaveBeenCalledWith(0, 20, undefined);
    });

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid').getAttribute('data-rowcount')).toBe('2');
    });
  });

  it('shows an error alert when the audit load fails', async () => {
    mockGetAuditPage.mockRejectedValueOnce(new Error('boom'));

    render(<CitiSftIntakeAuditPage />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('boom');
  });

  it('re-invokes the active loader when Refresh is clicked', async () => {
    render(<CitiSftIntakeAuditPage />);

    await screen.findByTestId('ag-grid');
    expect(mockGetAuditPage).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/Refresh/i));

    await waitFor(() => {
      expect(mockGetAuditPage).toHaveBeenCalledTimes(2);
    });
  });

  it('applies the event-type filter to the audit query', async () => {
    render(<CitiSftIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'FILE_RECEIVED' } });

    await waitFor(() => {
      expect(mockGetAuditPage).toHaveBeenCalledWith(0, 20, 'FILE_RECEIVED');
    });
  });
});