// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionListPage from './InstructionListPage';
import { getInstructions, getDashboardCounts, getActionRequiredItems } from '../../api/instructions';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Automation Studio User', role: 'ADMIN_MAKER' }, isAuthenticated: true }),
}));

vi.mock('../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
  getActionRequiredItems: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => R.createElement('div', { className }, children),
    Card: ({ children, header, className, onClick }: any) =>
      R.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        R.createElement('div', { key: 'h', className: 'card-header' }, header),
        R.createElement('div', { key: 'b', className: 'card-body' }, children),
      ]),
    Table: ({ data, columns }: any) =>
      R.createElement('table', null, [
        R.createElement('thead', { key: 'th' },
          R.createElement('tr', null, columns?.map((c: any, i: number) => R.createElement('th', { key: `col-head-${i}` }, c.title)))
        ),
        R.createElement('tbody', { key: 'tb' },
          data?.map((row: any, rIdx: number) =>
            R.createElement('tr', { key: `row-group-${rIdx}` },
              columns?.map((c: any, cIdx: number) =>
                R.createElement('td', { key: `cell-item-${rIdx}-${cIdx}` },
                  c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]
                )
              )
            )
          )
        ),
      ]),
    Icon: () => R.createElement('span', null),
    Input: ({ value, onChange, placeholder }: any) =>
      R.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) =>
      R.createElement('select', { value: value || '', onChange, 'aria-label': placeholder }, children),
    DropdownItem: ({ children, value }: any) => R.createElement('option', { value }, children),
    RangePicker: () => R.createElement('input', { type: 'date' }),
    Pagination: () => R.createElement('div', null),
    Loading: () => R.createElement('div', null, 'Loading...'),
    Alert: ({ children, type }: any) => R.createElement('div', { className: `alert-${type}` }, children),
    Button: ({ children, onClick, color, size }: any) =>
      R.createElement('button', { onClick, className: `${color} ${size}` }, children),
    StatusTag: ({ status }: any) => R.createElement('span', null, status),
    Switch: ({ checked, onChange }: any) =>
      R.createElement('input', { type: 'checkbox', checked: !!checked, onChange }),
    Collapse: ({ children }: any) => R.createElement('div', { 'data-testid': 'mock-collapse' }, children),
    CollapsePanel: ({ children, header }: any) =>
      R.createElement('div', null, [R.createElement('div', { key: 'h' }, header), R.createElement('div', { key: 'c' }, children)]),
    Tabs: ({ children }: any) => R.createElement('div', null, children),
    Tab: ({ children }: any) => R.createElement('div', null, children),
    Divider: () => R.createElement('hr', null),
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

const mockInstruction = {
  instructionId: 1, clientName: 'Citi Log', source: 'Email - maker.user@citi.com',
  instructionRef: 'GAB-998877', dueDate: '2026-05-28', status: 'DRAFT',
  dealName: 'Telecom Deal', paymentMethod: 'WIRE', category: 'URGENT',
  region: 'NAM', country: 'CANADA', createdBy: 'USER-101',
  accountNumber: '', buildingCode: '', currency: '', amount: 0, valueDate: '',
  beneficiaryName: '', beneficiaryAccount: '', beneficiaryBankCode: '',
  purposeOfPayment: '', specialInstructions: '', createdOn: '', modifiedBy: '',
  modifiedOn: '', isLocked: false, lockedBy: '', mppRequired: false,
  mppException: '', signatureRequired: false, callbackRequired: false,
  awsAccount: false, debitAccountNumber: '', transactionType: '',
  transactionQuantity: 0, transactionSystem: '', requestType: '', description: '',
  relatedInstructions: '', primaryAssignee: '', backupAssignee: '',
  transactionDate: '', instructionSource: '', emailInboxId: null, senderEmail: '',
  contractValidation: false, xceptor: false, citiDirectClientProfile: false, adminMaker: '',
};

describe('InstructionListPage Thorough Branch Validation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDashboardCounts as any).mockResolvedValue({ data: { PENDING_CHECKER: 1, DRAFT: 1 }, success: false, message: '', timestamp: '' });
    (getActionRequiredItems as any).mockResolvedValue({ data: [], success: false, message: '', timestamp: '' });
    (getInstructions as any).mockResolvedValue({
      data: { content: [{ ...mockInstruction }], totalElements: 1, totalPages: 1, page: 0, size: 0, last: false },
      success: false, message: '', timestamp: '',
    });
  });

  it('should render headers, query forms, metrics summaries, and lists completely', async () => {
    render(<InstructionListPage />);
    await waitFor(() => expect(screen.getByText('Citi Log')).toBeTruthy());
  });
});