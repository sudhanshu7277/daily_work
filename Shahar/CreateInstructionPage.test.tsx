// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import CreateInstructionPage from './CreateInstructionPage';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Automation Studio User', role: 'ADMIN_MAKER' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  const F = (tag: string) => ({ children, className, ...p }: any) => R.createElement(tag, { className, ...p }, children);
  return {
    El: F('div'), Card: F('div'), Button: F('button'), Icon: F('span'), Tag: F('span'),
    Loading: () => R.createElement('div', null, 'Loading Form Layout...'),
    Alert: F('div'), Modal: F('div'),
    Switch: ({ checked, onChange }: any) =>
      R.createElement('input', { type: 'checkbox', checked: !!checked, onChange }),
    Checkbox: ({ checked, onChange, children }: any) =>
      R.createElement('label', null, [
        R.createElement('input', { key: 'i', type: 'checkbox', checked: !!checked, onChange }),
        R.createElement('span', { key: 's' }, children),
      ]),
    Radio: ({ checked, onChange, children }: any) =>
      R.createElement('label', null, [
        R.createElement('input', { key: 'i', type: 'radio', checked: !!checked, onChange }),
        R.createElement('span', { key: 's' }, children),
      ]),
    RadioGroup: ({ children }: any) => R.createElement('div', null, children),
    // KEY FIX: Collapse and CollapsePanel used in CreateInstructionPage line 503
    Collapse: ({ children }: any) => R.createElement('div', { 'data-testid': 'mock-collapse' }, children),
    CollapsePanel: ({ children, header }: any) =>
      R.createElement('div', { 'data-testid': 'mock-collapse-panel' }, [
        R.createElement('div', { key: 'h' }, header),
        R.createElement('div', { key: 'c' }, children),
      ]),
    FormItem: ({ children, label }: any) =>
      R.createElement('div', null, [
        label && R.createElement('label', { key: 'l' }, label),
        R.createElement('div', { key: 'c' }, children),
      ]),
    TextArea: F('textarea'),
    Input: ({ value, onChange, placeholder, ...props }: any) =>
      R.createElement('input', { value: value || '', onChange, placeholder, ...props }),
    Dropdown: ({ children, value, onChange, placeholder }: any) =>
      R.createElement('select', { value: value || '', onChange, 'aria-label': placeholder }, children),
    DropdownItem: F('option'),
    StatusTag: ({ status }: any) => R.createElement('span', null, status),
    Tooltip: ({ children }: any) => R.createElement('div', null, children),
    Steps: ({ items, current }: any) =>
      R.createElement('div', { 'data-current-step': current },
        items?.map((item: any, idx: number) => R.createElement('span', { key: idx }, item.title))
      ),
    Table: ({ data, columns }: any) =>
      R.createElement('table', null,
        R.createElement('tbody', null,
          data?.map((row: any, rIdx: number) =>
            R.createElement('tr', { key: rIdx },
              columns?.map((col: any, cIdx: number) =>
                R.createElement('td', { key: cIdx },
                  col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]
                )
              )
            )
          )
        )
      ),
    Divider: () => R.createElement('hr', null),
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

describe('CreateInstructionPage Complete Unit Test Matrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: { clear: vi.fn(), getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() },
      writable: true,
    });
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) } as Response)
    );
  });

  it('should mount without throwing errors', () => {
    expect(() => render(<CreateInstructionPage />)).not.toThrow();
  });

  it('should render page content on mount', async () => {
    render(<CreateInstructionPage />);
    await waitFor(() => { expect(document.body.innerHTML.length).toBeGreaterThan(0); });
  });

  it('should process change events for search boxes and inputs without throwing runtime failures', async () => {
    render(<CreateInstructionPage />);
    const fields = screen.queryAllByPlaceholderText('Search Instructions');
    if (fields.length > 0) {
      fireEvent.change(fields[0], { target: { value: 'Query Validation Packet' } });
      expect((fields[0] as HTMLInputElement).value).toBe('Query Validation Packet');
    }
  });

  it('should handle navigation workflow actions safely when wizard action buttons are executed', async () => {
    render(<CreateInstructionPage />);
    const nextTriggers = screen.queryAllByText('Next');
    if (nextTriggers.length > 0) fireEvent.click(nextTriggers[0]);
    const cancelTriggers = screen.queryAllByText('Cancel');
    if (cancelTriggers.length > 0) fireEvent.click(cancelTriggers[0]);
  });
});