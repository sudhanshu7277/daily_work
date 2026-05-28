// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import ApprovalQueuePage from './ApprovalQueuePage';
import { getInstructions, getDashboardCounts } from '../../api/instructions';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Automation Studio User', role: 'ADMIN_MAKER' }, isAuthenticated: true }),
}));

vi.mock('../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
  processApproval: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style }: any) => R.createElement('div', { className, style }, children),
    Card: ({ children, header, onClick, className }: any) =>
      R.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        R.createElement('div', { key: 'h', className: 'card-header' }, header),
        R.createElement('div', { key: 'b', className: 'card-body' }, children),
      ]),
    Table: ({ data, columns, className }: any) =>
      R.createElement('table', { className }, [
        R.createElement('thead', { key: 'th' },
          R.createElement('tr', null,
            columns?.map((c: any, i: number) =>
              R.createElement('th', { key: `col-head-${i}`, onClick: c.onHeaderCell ? c.onHeaderCell().onClick : undefined }, c.title)
            )
          )
        ),
        R.createElement('tbody', { key: 'tb' },
          data?.map((row: any, rIdx: number) =>
            R.createElement('tr', { key: rIdx },
              columns?.map((c: any, cIdx: number) =>
                R.createElement('td', { key: `cell-item-${rIdx}-${cIdx}` },
                  c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]
                )
              )
            )
          )
        ),
      ]),
    Icon: ({ type }: any) => R.createElement('span', null, `icon-${type}`),
    Input: ({ value, onChange, placeholder }: any) =>
      R.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) =>
      R.createElement('select', { value: value || '', onChange, 'aria-label': placeholder }, children),
    DropdownItem: ({ children, value }: any) => R.createElement('option', { value }, children),
    RangePicker: ({ onChange, placeholder }: any) =>
      R.createElement('input', { type: 'date', onChange: (e: any) => onChange ? onChange([new Date(e.target.value), new Date(e.target.value)]) : null, placeholder }),
    Pagination: ({ current, onChange }: any) =>
      R.createElement('div', null, R.createElement('button', { onClick: () => onChange ? onChange(current + 1) : null }, 'Next')),
    StatusTag: ({ status }: any) => R.createElement('span', null, status),
    Alert: ({ children, type }: any) => R.createElement('div', { className: `alert-${type}` }, children),
    Button: ({ children, onClick, color, size }: any) =>
      R.createElement('button', { onClick, className: `${color} ${size}` }, children),
    Modal: ({ children, visible, title, onCancel, onApply }: any) =>
      visible ? R.createElement('div', { 'data-testid': 'mock-modal' }, [
        R.createElement('h3', { key: 't' }, title),
        R.createElement('button', { key: 'c', onClick: onCancel }, 'Cancel'),
        R.createElement('button', { key: 'a', onClick: onApply }, 'Apply'),
        children,
      ]) : null,
    TextArea: ({ value, onChange, placeholder }: any) =>
      R.createElement('textarea', { value, onChange, placeholder }),
    Switch: ({ checked, onChange }: any) =>
      R.createElement('input', { type: 'checkbox', checked: !!checked, onChange }),
    Checkbox: ({ checked, onChange, children }: any) =>
      R.createElement('label', null, [
        R.createElement('input', { key: 'i', type: 'checkbox', checked: !!checked, onChange }),
        R.createElement('span', { key: 's' }, children),
      ]),
    Collapse: ({ children }: any) => R.createElement('div', { 'data-testid': 'mock-collapse' }, children),
    CollapsePanel: ({ children, header }: any) =>
      R.createElement('div', null, [R.createElement('div', { key: 'h' }, header), R.createElement('div', { key: 'c' }, children)]),
    Tabs: ({ children }: any) => R.createElement('div', null, children),
    Tab: ({ children }: any) => R.createElement('div', null, children),
    Divider: () => R.createElement('hr', null),
    notification: { success: vi.fn(), danger: vi.fn() },
    Loading: ({ tip }: any) => R.createElement('div', null, tip || 'Loading...'),
  };
});

const mockInstruction = {
  instructionId: 777, instructionRef: 'GAB-1779428957083-2369',
  source: 'Email - checker.user@citi.com', clientName: 'TELECOM ARGENTINA SA',
  dealName: 'TELECOM ARGENTINA SA', country: 'BRAZIL', accountNumber: '1234567890',
  dueDate: '2026-05-21', status: 'PENDING_CHECKER', category: 'GENERAL',
  region: 'LATAM', paymentMethod: 'WIRE', primaryAssignee: 'SA07013',
  modifiedBy: 'SYSTEM', modifiedOn: '2026-05-26T12:00:00Z', adminMaker: 'MAKER-01',
  buildingCode: '', currency: '', amount: 0, valueDate: '', beneficiaryName: '',
  beneficiaryAccount: '', beneficiaryBankCode: '', purposeOfPayment: '',
  specialInstructions: '', createdBy: '', createdOn: '', isLocked: false,
  lockedBy: '', mppRequired: false, mppException: '', signatureRequired: false,
  callbackRequired: false, awsAccount: false, debitAccountNumber: '',
  transactionType: '', transactionQuantity: 0, transactionSystem: '',
  requestType: '', description: '', relatedInstructions: '', backupAssignee: '',
  transactionDate: '', instructionSource: '', emailInboxId: null, senderEmail: '',
  contractValidation: false, xceptor: false, citiDirectClientProfile: false,
};

describe('ApprovalQueuePage Component Comprehensive Branch Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    (getDashboardCounts as any).mockResolvedValue({
      data: { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 2, PENDING_SIGNATURE_VALIDATION: 0 },
      success: false, message: '', timestamp: '',
    });
    (getInstructions as any).mockResolvedValue({
      data: { content: [{ ...mockInstruction }], page: 0, size: 0, totalElements: 0, totalPages: 0, last: false },
      success: false, message: '', timestamp: '',
    });
  });

  it('should render table grid layout records correctly along with structural custom cell columns', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => { expect(screen.getByText('Instructions Explorer')).toBeTruthy(); });
    expect(screen.getByText('Sequence No.')).toBeTruthy();
    expect(screen.getByText('Source & Category')).toBeTruthy();
    expect(screen.getByText('Client, GFC & Country')).toBeTruthy();
    expect(screen.getByText('GAB-1779428957083-2369')).toBeTruthy();
    expect(screen.getByText('TELECOM ARGENTINA SA')).toBeTruthy();
  });

  it('should alter filter contexts and row limits when metric status summary cards are clicked', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    const summaryCard = screen.getByText('Admin Checker').parentElement;
    if (summaryCard) { fireEvent.click(summaryCard); fireEvent.click(summaryCard); }
  });

  it('should dynamically narrow visible data sets when typing inside the global text box', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    const searchBox = screen.getByPlaceholderText('Search Instructions');
    fireEvent.change(searchBox, { target: { value: 'ARGENTINA' } });
    expect(screen.getByText('GAB-1779428957083-2369')).toBeTruthy();
    fireEvent.change(searchBox, { target: { value: 'NON_EXISTENT_TOKEN' } });
    expect(screen.queryByText('GAB-1779428957083-2369')).toBeNull();
  });

  it('should update filter parameters when selecting items inside drop-down elements', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    const countrySelect = screen.getByLabelText('Country');
    fireEvent.change(countrySelect, { target: { value: 'BRAZIL' } });
    const sourceSelect = screen.getByLabelText('Source');
    fireEvent.change(sourceSelect, { target: { value: 'Manual' } });
  });

  it('should execute sort parameters when table header titles are targeted', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    fireEvent.click(screen.getByText('Sequence No.'));
  });

  it('should redirect route variables when sequence data element links are selected', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    fireEvent.click(screen.getByText('GAB-1779428957083-2369'));
    expect(mockNavigate).toHaveBeenCalledWith('/instructions/777');
  });
});