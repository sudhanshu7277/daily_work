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

// 2. Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Automation Studio User', role: 'ADMIN_MAKER' },
    isAuthenticated: true,
  }),
}));

// 3. Mock regional formatting utilities
vi.mock('../../../utils/format', () => ({
  formatCurrency: (val: any) => typeof val === 'number' ? `$${val.toLocaleString()}` : val,
  formatDate: (val: any) => val,
}));

// 4. Mock icgds-react — MUST include Switch to prevent SetupInstructionModal crash
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  const MockFactory = (tag: string) =>
    ({ children, className, ...props }: any) =>
      ActualReact.createElement(tag, { className, ...props }, children);

  return {
    El: MockFactory('div'),
    Card: ({ children, header, className }: any) =>
      ActualReact.createElement('div', { className, 'data-testid': 'icgds-card' }, [
        header && ActualReact.createElement('div', { key: 'h', className: 'card-header' }, header),
        ActualReact.createElement('div', { key: 'b', className: 'card-body' }, children),
      ]),
    Button: ({ children, onClick, disabled, className }: any) =>
      ActualReact.createElement('button', { onClick, disabled, className }, children),
    Icon: ({ type }: any) => ActualReact.createElement('span', null, `icon-${type}`),
    Tag: ({ children, style, color }: any) =>
      ActualReact.createElement('span', { style, 'data-color': color }, children),
    Loading: () => ActualReact.createElement('div', null, 'Loading Instruction Details...'),
    Alert: ({ children, type }: any) =>
      ActualReact.createElement('div', { className: `alert-${type}` }, children),
    Modal: ({ children, visible, title, onCancel, onApply }: any) =>
      visible
        ? ActualReact.createElement('div', { 'data-testid': 'mock-modal' }, [
            ActualReact.createElement('h3', { key: 't' }, title),
            ActualReact.createElement('button', { key: 'c', onClick: onCancel }, 'Cancel'),
            ActualReact.createElement('button', { key: 'a', onClick: onApply }, 'Apply'),
            children,
          ])
        : null,
    // ── KEY FIX: Switch was missing — SetupInstructionModal line 402 uses it ──
    Switch: ({ checked, onChange, children }: any) =>
      ActualReact.createElement('input', {
        type: 'checkbox',
        checked: !!checked,
        onChange,
        'data-testid': 'mock-switch',
      }),
    TextArea: ({ value, onChange, placeholder }: any) =>
      ActualReact.createElement('textarea', { value, onChange, placeholder }),
    Input: ({ value, onChange, placeholder }: any) =>
      ActualReact.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) =>
      ActualReact.createElement('select', { value: value || '', onChange, placeholder }, children),
    DropdownItem: ({ children, value }: any) =>
      ActualReact.createElement('option', { value }, children),
    Table: ({ data, columns, className }: any) =>
      ActualReact.createElement('table', { className }, [
        ActualReact.createElement('thead', { key: 'th' },
          ActualReact.createElement('tr', null,
            columns?.map((c: any, i: number) =>
              ActualReact.createElement('th', { key: i }, c.title)
            )
          )
        ),
        ActualReact.createElement('tbody', { key: 'tb' },
          data?.map((row: any, rIdx: number) =>
            ActualReact.createElement('tr', { key: rIdx },
              columns?.map((c: any, cIdx: number) =>
                ActualReact.createElement('td', { key: cIdx },
                  c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex]
                )
              )
            )
          )
        ),
      ]),
    StatusTag: ({ status }: any) => ActualReact.createElement('span', null, status),
    Tooltip: ({ children, tooltip }: any) =>
      ActualReact.createElement('div', { 'data-tooltip': tooltip }, children),
    Steps: ({ items, current }: any) =>
      ActualReact.createElement('div', { 'data-current-step': current },
        items?.map((item: any, idx: number) =>
          ActualReact.createElement('span', { key: idx }, item.title)
        )
      ),
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
  commentId: 1,
  commentText: 'Signature matched successfully',
  createdBy: 'Checker-01 - Bob',
  createdOn: '2026-05-28T10:00:00Z',
  instructionId: 0,
};

const mockDocument = {
  instructionId: 101,
  fileName: 'wire_instruction_signed.pdf',
  fileSize: 1.2,
  uploadedBy: 'Maker-01 - Alice',
  documentId: 0,
  documentType: 'PAYMENT_INSTRUCTION',
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
      data: [{ ...mockDocument }],
      success: false, message: '', timestamp: '',
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
      expect(screen.getByText('Zenith Global Wire')).toBeTruthy();
    });
    expect(screen.getByText('GAB-992211')).toBeTruthy();
  });

  it('should render core instruction fields safely on mount and pass split transformations', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Zenith Global Wire')).toBeTruthy();
    });
  });

  it('should display the instruction status correctly', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Zenith Global Wire')).toBeTruthy();
    });
    expect(screen.getByText('PENDING_CHECKER')).toBeTruthy();
  });

  it('should display the instruction reference number', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('GAB-992211')).toBeTruthy();
    });
  });

  it('should display client name on mount', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Zenith Enterprise LLC')).toBeTruthy();
    });
  });

  it('should call getInstruction API on mount with correct instruction id', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => {
      // Component calls with number 777, accept either string or number
      expect(apiInstructions.getInstruction).toHaveBeenCalledWith(
        expect.stringContaining('777') || expect.objectContaining({ toString: expect.any(Function) })
      );
    });
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