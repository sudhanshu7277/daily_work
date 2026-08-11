// cmd to run tests locally

npx vitest run --coverage

// src/pages/audit/AuditTrailPage.test.tsx

// src/pages/audit/AuditTrailPage.test.tsx

// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// API Mocks
const mockGetAuditLogs = vi.fn();

vi.mock('../../api/audit', () => ({
  getAuditLogs: (...a: unknown[]) => mockGetAuditLogs(...a),
}));

vi.mock('../../api/refdata', () => ({
  getRefDataByType: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('../../api/aws', () => ({
  getAllClientList: vi.fn().mockResolvedValue({ data: [] }),
  getAllDealList: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('../../api/gabUser', () => ({
  fetchGabUser: vi.fn().mockResolvedValue({ data: null }),
}));

vi.mock('../../utils/format', () => ({
  formatDateTime: (v: string) => v,
}));

const mockHasAnyRole = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ hasAnyRole: mockHasAnyRole }),
}));

vi.mock('../../components/common/SearchableDropdown', () => ({
  default: (p: any) => React.createElement('div', { 'data-testid': `searchable-${p.label}` }, p.label),
}));

vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-theme-quartz.css', () => ({}));

vi.mock('ag-grid-react', () => ({
  AgGridReact: (props: any) =>
    React.createElement('div', {
      'data-testid': 'ag-grid',
      'data-rowcount': props.rowData?.length ?? 0,
      'data-colcount': props.columnDefs?.length ?? 0,
    }),
}));

const notificationDanger = vi.fn();
const notificationSuccess = vi.fn();

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  const El = ({ children, className, style, onClick }: any) =>
    R.createElement('div', { className, style, onClick }, children);
  const Dropdown: any = ({ children, value, onChange, placeholder }: any) =>
    R.createElement(
      'select',
      {
        'data-testid': 'dropdown',
        value: value ?? '',
        onChange: (e: any) => onChange?.(e.target.value),
        'aria-label': placeholder,
      },
      children,
    );
  Dropdown.Item = ({ children, value }: any) => R.createElement('option', { value }, children);
  const Modal = ({ visible, children, title, onApply, applyText, onCancel, cancelText }: any) =>
    visible
      ? R.createElement(
          'div',
          { 'data-testid': 'modal', 'data-title': title },
          children,
          R.createElement('button', { onClick: onApply }, applyText),
          R.createElement('button', { onClick: onCancel }, cancelText),
        )
      : null;

  return {
    El,
    Dropdown,
    Modal,
    Icon: (p: any) => R.createElement('i', { 'data-testid': `icon-${p.type}` }),
    Button: (p: any) => R.createElement('button', { onClick: p.onClick, title: p.title }, p.children),
    Input: (p: any) => {
      const { iconPrefix, iconSuffix, allowClear, ...rest } = p;
      return R.createElement('input', rest);
    },
    TextArea: (p: any) =>
      R.createElement('textarea', { value: p.value, onChange: p.onChange, placeholder: p.placeholder }),
    Loading: (p: any) => R.createElement('div', null, p.tip || 'loading'),
    Alert: (p: any) => R.createElement('div', { role: 'alert' }, p.children),
    notification: { danger: notificationDanger, success: notificationSuccess },
  };
});

import AuditTrailPage from './AuditTrailPage';

describe('AuditTrailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasAnyRole.mockReturnValue(true);
    mockGetAuditLogs.mockResolvedValue({ data: [] });
  });

  it('renders AuditTrailPage without crashing', async () => {
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});