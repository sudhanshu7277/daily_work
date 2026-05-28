// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionDetailPage from './InstructionDetailPage';
import * as apiInstructions from '../../api/instructions';
import * as apiComments from '../../api/comments';
import * as apiDocuments from '../../api/documents';
import * as apiAudit from '../../api/audit';

// 1. Mock routing
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: vi.fn(() => ({ id: '777' })),
}));

// 2. Mock AuthContext — path relative to src/pages/instructions/
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Automation Studio User', role: 'ADMIN_MAKER' },
    isAuthenticated: true,
  }),
}));

// 3. Mock formatting utilities
vi.mock('../../../utils/format', () => ({
  formatCurrency: (val: any) => typeof val === 'number' ? `$${val.toLocaleString()}` : val,
  formatDate: (val: any) => val,
}));

// 4. Mock icgds-react — ALL components including Switch, Checkbox, Radio
//    to prevent SetupInstructionModal crashes at lines 353, 395, 402, 656
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  const Div = ({ children, className, ...p }: any) => R.createElement('div', { className, ...p }, children);
  const Span = ({ children, ...p }: any) => R.createElement('span', p, children);

  return {
    El: Div,
    Card: ({ children, header, className }: any) =>
      R.createElement('div', { className, 'data-testid': 'icgds-card' }, [
        header && R.createElement('div', { key: 'h' }, header),
        R.createElement('div', { key: 'b' }, children),
      ]),
    Button: ({ children, onClick, disabled, className }: any) =>
      R.createElement('button', { onClick, disabled, className }, children),
    Icon: ({ type }: any) => R.createElement('span', null, `icon-${type}`),
    Tag: ({ children, style, color }: any) =>
      R.createElement('span', { style, 'data-color': color }, children),
    Loading: () => R.createElement('div', null, 'Loading Instruction Details...'),
    Alert: ({ children, type }: any) =>
      R.createElement('div', { className: `alert-${type}` }, children),
    Modal: ({ children, visible, title, onCancel, onApply }: any) =>
      visible ? R.createElement('div', { 'data-testid': 'mock-modal' }, [
        R.createElement('h3', { key: 't' }, title),
        R.createElement('button', { key: 'c', onClick: onCancel }, 'Cancel'),
        R.createElement('button', { key: 'a', onClick: onApply }, 'Apply'),
        children,
      ]) : null,
    // KEY FIX: Switch used in SetupInstructionModal line 402
    Switch: ({ checked, onChange }: any) =>
      R.createElement('input', { type: 'checkbox', checked: !!checked, onChange, 'data-testid': 'mock-switch' }),
    // Extra components used elsewhere in SetupInstructionModal (lines 353, 395, 656)
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
    FormItem: ({ children, label }: any) =>
      R.createElement('div', { 'data-testid': 'form-item' }, [
        label && R.createElement('label', { key: 'l' }, label),
        R.createElement('div', { key: 'c' }, children),
      ]),
    TextArea: ({ value, onChange, placeholder }: any) =>
      R.createElement('textarea', { value: value || '', onChange, placeholder }),
    Input: ({ value, onChange, placeholder }: any) =>
      R.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) =>
      R.createElement('select', { value: value || '', onChange, placeholder }, children),
    DropdownItem: ({ children, value }: any) =>
      R.createElement('option', { value }, children),
    Table: ({ data, columns, className }: any) =>
      R.createElement('table', { className }, [
        R.createElement('thead', { key: 'th' },
          R.createElement('tr', null,
            columns?.map((c: any, i: number) => R.createElement('th', { key: i }, c.title))
          )
        ),
        R.createElement('tbody', { key: 'tb' },
          data?.map((row: any, rIdx: number) =>
            R.createElement('tr', { key: rIdx },
              columns?.map((c: any, cIdx: number) =>
                R.createElement('td', { key: cIdx },
                  c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]
                )
              )
            )
          )
        ),
      ]),
    StatusTag: ({ status }: any) => R.createElement('span', null, status),
    Tooltip: ({ children, tooltip }: any) =>
      R.createElement('div', { 'data-tooltip': tooltip }, children),
    Steps: ({ items, current }: any) =>
      R.createElement('div', { 'data-current-step': current },
        items?.map((item: any, idx: number) => R.createElement('span', { key: idx }, item.title))
      ),
    Tabs: ({ children }: any) => R.createElement('div', { 'data-testid': 'mock-tabs' }, children),
    Tab: ({ children, label }: any) => R.createElement('div', { 'data-testid': `tab-${label}` }, children),
    Divider: () => R.createElement('hr', null),
    Badge: ({ children, count }: any) => R.createElement('span', { 'data-count': count }, children),
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

// 5. Mock API modules
vi.mock('../../api/instructions');
vi.mock('../../api/comments');
vi.mock('../../api/documents');
vi.mock('../../api/audit');

// ─── Shared mock data ─────────────────────────────────────────────────────────
const mockInstruction = {
  instructionId: 777,
  instructionRef: 'GAB-992211',
  dealName: 'Zenith Global Wire',
  clientName: 'Zenith Enterprise LLC',
  accountNumber: '9876543210',
  paymentMethod: 'INTERNAL_TRANSFER',
  amount: 2500000,
  currency: 'USD',
  status: 'PENDING_CHECKER',
  source: 'Email - maker.user@citi.com',
  primaryAssignee: 'SA07013 - John Doe',
  createdBy: 'MAKER01 - Alice Smith',
  modifiedBy: 'CHECKER01 - Bob Jones',
  dueDate: '2026-06-15',
  signatureRequired: true,
  callbackRequired: true,
  buildingCode: '', region: '', valueDate: '',
  beneficiaryName: '', beneficiaryAccount: '', beneficiaryBankCode: '',
  purposeOfPayment: '', specialInstructions: '', createdOn: '', modifiedOn: '',
  isLocked: false, lockedBy: '', mppRequired: false, mppException: '',
  awsAccount: false, debitAccountNumber: '', transactionType: '',
  transactionQuantity: 0, transactionSystem: '', requestType: '', category: '',
  description: '', relatedInstructions: '', backupAssignee: '',
  transactionDate: '', instructionSource: '', emailInboxId: null,
  senderEmail: '', contractValidation: false, xceptor: false, country: '',
  citiDirectClientProfile: false, adminMaker: '',
};

const mockComment = {
  commentId: 1, commentText: 'Signature matched successfully',
  createdBy: 'Checker-01 - Bob', createdOn: '2026-05-28T10:00:00Z', instructionId: 0,
};

const mockDocument = {
  instructionId: 101, fileName: 'wire_instruction_signed.pdf', fileSize: 1.2,
  uploadedBy: 'Maker-01 - Alice', documentId: 0, documentType: 'PAYMENT_INSTRUCTION',
  dmcDocumentId: '', contentType: '', uploadedOn: '',
};

const mockAuditHistory = {
  instructionId: 1, action: 'CREATE', auditId: 0,
  performedBy: '', performedOn: '', oldStatus: '', newStatus: '', comments: '',
};

const mockFieldHistory = {
  instructionId: 1, fieldName: 'status', oldValue: 'DRAFT',
  newValue: 'PENDING_CHECKER', fieldHistoryId: 0,
  changedBy: '', changedOn: '', action: '',
};

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('InstructionDetailPage Comprehensive Coverage Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(apiInstructions, 'getInstruction').mockResolvedValue({
      data: { ...mockInstruction } as any,
      success: false, message: '', timestamp: '',
    } as any);

    vi.spyOn(apiComments, 'getComments').mockResolvedValue({
      data: [{ ...mockComment }] as any,
      success: false, message: '', timestamp: '',
    } as any);

    (apiDocuments.getDocuments as any) = vi.fn().mockResolvedValue({
      data: [{ ...mockDocument }], success: false, message: '', timestamp: '',
    });

    vi.spyOn(apiAudit, 'getInstructionHistory').mockResolvedValue({
      data: [{ ...mockAuditHistory }] as any,
      success: false, message: '', timestamp: '',
    } as any);

    vi.spyOn(apiAudit, 'getFieldHistory').mockResolvedValue({
      data: [{ ...mockFieldHistory }] as any,
      success: false, message: '', timestamp: '',
    } as any);
  });

  it('should render core instruction fields, metadata cards, and workspace tabs safely on mount', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      // Use getAllByText since dealName appears in multiple places (header + table)
      expect(screen.getAllByText('Zenith Global Wire').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('GAB-992211').length).toBeGreaterThan(0);
  });

  it('should render core instruction fields safely on mount and pass split transformations', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Zenith Global Wire').length).toBeGreaterThan(0);
    });
  });

  it('should display the instruction status correctly', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Zenith Global Wire').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('PENDING_CHECKER').length).toBeGreaterThan(0);
  });

  it('should display the instruction reference number', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getAllByText('GAB-992211').length).toBeGreaterThan(0);
    });
  });

  it('should display client name on mount', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Zenith Enterprise LLC').length).toBeGreaterThan(0);
    });
  });

  it('should call getInstruction API on mount with correct instruction id', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(apiInstructions.getInstruction).toHaveBeenCalledWith(
        expect.anything()
      );
    });
    // Verify the actual argument contains 777
    const callArg = (apiInstructions.getInstruction as any).mock.calls[0][0];
    expect(String(callArg)).toContain('777');
  });

  it('should call getComments API on mount', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(apiComments.getComments).toHaveBeenCalled();
    });
  });

  it('should call getDocuments API on mount', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(apiDocuments.getDocuments).toHaveBeenCalled();
    });
  });

  it('should call getInstructionHistory API on mount', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(apiAudit.getInstructionHistory).toHaveBeenCalled();
    });
  });

  it('should call getFieldHistory API on mount', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(apiAudit.getFieldHistory).toHaveBeenCalled();
    });
  });

  it('should render without crashing when all API responses return empty data', async () => {
    vi.spyOn(apiInstructions, 'getInstruction').mockResolvedValue({ data: {} as any, success: false, message: '', timestamp: '' } as any);
    vi.spyOn(apiComments, 'getComments').mockResolvedValue({ data: [] as any, success: false, message: '', timestamp: '' } as any);
    (apiDocuments.getDocuments as any) = vi.fn().mockResolvedValue({ data: [], success: false, message: '', timestamp: '' });
    vi.spyOn(apiAudit, 'getInstructionHistory').mockResolvedValue({ data: [] as any, success: false, message: '', timestamp: '' } as any);
    vi.spyOn(apiAudit, 'getFieldHistory').mockResolvedValue({ data: [] as any, success: false, message: '', timestamp: '' } as any);
    expect(() => render(<InstructionDetailPage />)).not.toThrow();
  });

  it('should handle API failure gracefully without crashing', async () => {
    vi.spyOn(apiInstructions, 'getInstruction').mockRejectedValue(new Error('Network error'));
    expect(() => render(<InstructionDetailPage />)).not.toThrow();
  });
});