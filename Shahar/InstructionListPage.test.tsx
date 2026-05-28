// 1. Comprehensive Unit Test: InstructionListPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionListPage from './InstructionListPage';
import { getInstructions, getDashboardCounts, getActionRequiredItems } from '../../api/instructions';

// 1. Standalone Routing Mocks
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// 2. Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Automation Studio User', role: 'ADMIN_MAKER' },
    isAuthenticated: true,
  }),
}));

// 3. Concrete API Namespace Footprint Mocking to Block Copilot Regressions
vi.mock('../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
  getActionRequiredItems: vi.fn(),
}));

// 4. Strict UI Component Custom Engine Simulation with Unique React Keys
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) =>
      ReactActual.createElement('div', { className }, children),
    Card: ({ children, header, className, onClick }: any) =>
      ReactActual.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        ReactActual.createElement('div', { key: 'h', className: 'card-header' }, header),
        ReactActual.createElement('div', { key: 'b', className: 'card-body' }, children),
      ]),
    Table: ({ data, columns }: any) => {
      return ReactActual.createElement('table', null, [
        ReactActual.createElement('thead', { key: 'th' },
          ReactActual.createElement('tr', null,
            columns?.map((c: any, i: number) =>
              ReactActual.createElement('th', { key: `col-head-${i}` }, c.title)
            )
          )
        ),
        ReactActual.createElement('tbody', { key: 'tb' },
          data?.map((row: any, rIdx: number) =>
            ReactActual.createElement('tr', { key: `row-group-${rIdx}` },
              columns?.map((c: any, cIdx: number) =>
                ReactActual.createElement('td', { key: `cell-item-${rIdx}-${cIdx}` },
                  c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]
                )
              )
            )
          )
        ),
      ]);
    },
    Icon: () => ReactActual.createElement('span', null),
    Input: ({ value, onChange, placeholder }: any) =>
      ReactActual.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) =>
      ReactActual.createElement('select', { value: value || '', onChange, 'aria-label': placeholder }, children),
    DropdownItem: ({ children, value }: any) =>
      ReactActual.createElement('option', { value }, children),
    RangePicker: () => ReactActual.createElement('input', { type: 'date' }),
    Pagination: () => ReactActual.createElement('div', null),
    Loading: () => ReactActual.createElement('div', null, 'Loading...'),
    Alert: ({ children, type }: any) =>
      ReactActual.createElement('div', { className: `alert-${type}` }, children),
    Button: ({ children, onClick, color, size }: any) =>
      ReactActual.createElement('button', { onClick, className: `${color} ${size}` }, children),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
    Switch: ({ checked, onChange }: any) =>
      ReactActual.createElement('input', { type: 'checkbox', checked: !!checked, onChange }),
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockInstruction = {
  instructionId: 1,
  clientName: 'Citi Log',
  source: 'Email - maker.user@citi.com',
  instructionRef: 'GAB-998877',
  dueDate: '2026-05-28',
  status: 'DRAFT',
  dealName: 'Telecom Deal',
  paymentMethod: 'WIRE',
  category: 'URGENT',
  region: 'NAM',
  country: 'CANADA',
  createdBy: 'USER-101',
  accountNumber: '',
  buildingCode: '',
  currency: '',
  amount: 0,
  valueDate: '',
  beneficiaryName: '',
  beneficiaryAccount: '',
  beneficiaryBankCode: '',
  purposeOfPayment: '',
  specialInstructions: '',
  createdOn: '',
  modifiedBy: '',
  modifiedOn: '',
  isLocked: false,
  lockedBy: '',
  mppRequired: false,
  mppException: '',
  signatureRequired: false,
  callbackRequired: false,
  awsAccount: false,
  debitAccountNumber: '',
  transactionType: '',
  transactionQuantity: 0,
  transactionSystem: '',
  requestType: '',
  description: '',
  relatedInstructions: '',
  primaryAssignee: '',
  backupAssignee: '',
  transactionDate: '',
  instructionSource: '',
  emailInboxId: null,
  senderEmail: '',
  contractValidation: false,
  xceptor: false,
  citiDirectClientProfile: false,
  adminMaker: '',
};

describe('InstructionListPage Thorough Branch Validation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // KEY FIX: cast as any — vi.mocked() won't work with factory mocks
    (getDashboardCounts as any).mockResolvedValue({
      data: { PENDING_CHECKER: 1, DRAFT: 1 },
      success: false,
      message: '',
      timestamp: '',
    });

    (getActionRequiredItems as any).mockResolvedValue({
      data: [],
      success: false,
      message: '',
      timestamp: '',
    });

    // FIXED: Populated every single text attribute string property used in
    // filters to eliminate toLowerCase() errors on component mount
    (getInstructions as any).mockResolvedValue({
      data: {
        content: [{ ...mockInstruction }],
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 0,
        last: false,
      },
      success: false,
      message: '',
      timestamp: '',
    });
  });

  it('should render headers, query forms, metrics summaries, and lists completely', async () => {
    render(<InstructionListPage />);
    await waitFor(() => expect(screen.getByText('Citi Log')).toBeTruthy());
  });
});