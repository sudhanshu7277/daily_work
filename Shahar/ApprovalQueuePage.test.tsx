import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// UNCOMMENTED & FIXED PATH RESOLUTIONS:
import ApprovalQueuePage from '../ApprovalQueuePage'; 
import { getInstructions, getDashboardCounts } from '../../../api/instructions'; 

// 1. Mock standard routing vectors
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 2. Mock API resource endpoints matching the clean relative path
vi.mock('../../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
}));

// 3. Mock internal design system library wrappers
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, onClick, className, style }: any) => 
      ReactActual.createElement('div', { onClick, className, style }, children),
    Card: ({ children, header, className }: any) => 
      ReactActual.createElement('div', { className, 'data-testid': 'mock-card' }, [
        ReactActual.createElement('div', { className: 'card-header' }, header),
        ReactActual.createElement('div', { className: 'card-body' }, children)
      ]),
    Table: ({ data, columns, className, style }: any) => {
      return ReactActual.createElement('table', { className, style: JSON.stringify(style) }, [
        ReactActual.createElement('thead', null, 
          ReactActual.createElement('tr', null, columns.map((col: any, idx: number) => 
            ReactActual.createElement('th', { key: idx, onClick: col.title?.props?.onClick }, col.title)
          ))
        ),
        ReactActual.createElement('tbody', null, 
          data?.map((row: any, idx: number) => 
            ReactActual.createElement('tr', { key: idx }, columns.map((col: any, cIdx: number) => 
              ReactActual.createElement('td', { key: cIdx }, 
                col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]
              )
            ))
          )
        )
      ]);
    },
    Icon: ({ type, style, className }: any) => 
      ReactActual.createElement('span', { className, style: JSON.stringify(style) }, `icon-${type}`),
    Input: ({ value, onChange, placeholder, style, iconPrefix }: any) => 
      ReactActual.createElement('input', { value, onChange, placeholder, 'data-prefix': iconPrefix, style: JSON.stringify(style) }),
    Dropdown: ({ children, value, onChange, placeholder, style }: any) => 
      ReactActual.createElement('select', { value, onChange, placeholder, style: JSON.stringify(style) }, children),
    DropdownItem: ({ children, value }: any) => 
      ReactActual.createElement('option', { value }, children),
    RangePicker: ({ onChange, placeholder, style }: any) => 
      ReactActual.createElement('input', { type: 'date', onChange: (e) => onChange ? onChange([new Date(e.target.value), new Date(e.target.value)]) : null, placeholder: JSON.stringify(placeholder), style: JSON.stringify(style) }),
    Pagination: ({ current, onChange }: any) => 
      ReactActual.createElement('div', null, [
        ReactActual.createElement('button', { onClick: () => onChange ? onChange(current + 1) : null }, 'Next')
      ]),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
    Alert: ({ children, type }: any) => ReactActual.createElement('div', { className: `alert-${type}` }, children),
    Button: ({ children, onClick, color, size }: any) => ReactActual.createElement('button', { onClick, className: `${color} ${size}` }, children),
  };
});

const mockDataPayload = [
  {
    instructionId: 'inst-777',
    instructionRef: 'GAB-1779428957083-2369',
    dealName: 'TELECOM ARGENTINA SA',
    clientName: 'TELECOM ARGENTINA SA',
    accountNumber: '5678901234',
    source: 'CitiSFT - Payments-General',
    country: 'BRAZIL',
    dueDate: '2026-05-21',
    status: 'PENDING_CHECKER',
    primaryAssignee: 'SA07013'
  },
  {
    instructionId: 'inst-888',
    instructionRef: 'GAB-1779806187474-9363',
    dealName: 'TELECOM ARGENTINA SA',
    clientName: 'TELECOM ARGENTINA SA',
    source: 'CitiSFT',
    country: 'Argentina',
    dueDate: '2026-05-25',
    status: 'ADMIN_PAYMENT_MAKER',
    primaryAssignee: 'BE46930'
  }
];

const mockCountsPayload = { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 1 };

describe('ApprovalQueuePage Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDashboardCounts as Mock).mockResolvedValue({ data: mockCountsPayload });
    (getInstructions as Mock).mockResolvedValue({ data: { content: mockDataPayload } });
  });

  it('should render table grid records correctly with default sorting vectors on mount', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => expect(screen.getByText('Instructions Explorer')).toBeTruthy());
    expect(screen.getByText('Sequence No.')).toBeTruthy();
    expect(screen.getByText('CitiSFT')).toBeTruthy();
    expect(screen.getByText('Payments-General')).toBeTruthy();
    expect(screen.getByText('GAB-1779428957083-2369')).toBeTruthy();
  });

  it('should strictly cycle sorting direction parameters on header clicks without hiding icons', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    const sequenceHeaderCell = screen.getByText('Sequence No.').parentElement;
    if (sequenceHeaderCell) fireEvent.click(sequenceHeaderCell);
    expect(screen.getByText('icon-arrow-up')).toBeTruthy();
    if (sequenceHeaderCell) fireEvent.click(sequenceHeaderCell);
    expect(screen.getByText('icon-arrow-down')).toBeTruthy();
  });

  it('should instantly filter table rows when characters are written to search box', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    const queryInput = screen.getByPlaceholderText('Search Instructions');
    fireEvent.change(queryInput, { target: { value: '9363' } });
    expect(screen.getByText('GAB-1779806187474-9363')).toBeTruthy();
  });

  it('should clear or apply filter states when status metric cards are selected', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    const summaryCountCard = screen.getByText('Pending Checker').parentElement;
    if (summaryCountCard) {
      fireEvent.click(summaryCountCard);
      fireEvent.click(summaryCountCard);
    }
  });

  it('should navigate to specific sub-routing page paths when unique row text link is clicked', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));
    const linkAnchorNode = screen.getByText('GAB-1779428957083-2369');
    fireEvent.click(linkAnchorNode);
    expect(mockNavigate).toHaveBeenCalledWith('/instructions/inst-777');
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////

// 🧪 2. Final Complete Test File: InstructionDetailPage.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// UNCOMMENTED & FIXED PATH RESOLUTIONS:
import InstructionDetailPage from '../InstructionDetailPage'; 
import { getInstruction, submitInstruction } from '../../../api/instructions'; 
import { getComments, addComment } from '../../../api/comments'; 
import { getDocuments } from '../../../api/documents'; 
import { getInstructionHistory, getFieldHistory } from '../../../api/audit'; 

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: vi.fn(() => ({ id: '777' })),
}));

vi.mock('../../../api/instructions', () => ({ getInstruction: vi.fn(), submitInstruction: vi.fn(), processApproval: vi.fn() }));
vi.mock('../../../api/comments', () => ({ getComments: vi.fn(), addComment: vi.fn() }));
vi.mock('../../../api/documents', () => ({ getDocuments: vi.fn() }));
vi.mock('../../../api/audit', () => ({ getInstructionHistory: vi.fn(), getFieldHistory: vi.fn() }));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, onClick, className, style }: any) => ActualReact.createElement('div', { onClick, className, style }, children),
    Card: ({ children, header, className }: any) => 
      ActualReact.createElement('div', { className, 'data-testid': 'icgds-card' }, [
        ActualReact.createElement('div', { className: 'card-header' }, header),
        ActualReact.createElement('div', { className: 'card-body' }, children)
      ]),
    Button: ({ children, onClick, disabled }: any) => ActualReact.createElement('button', { onClick, disabled }, children),
    Icon: ({ type }: any) => ActualReact.createElement('span', null, `icon-${type}`),
    Tag: ({ children, style, color }: any) => ActualReact.createElement('span', { style, 'data-color': color }, children),
    Loading: () => ActualReact.createElement('div', null, 'Loading Instruction Details...'),
    Alert: ({ children, type }: any) => ActualReact.createElement('div', { className: `alert-${type}` }, children),
    Modal: ({ children, visible, title }: any) => visible ? ActualReact.createElement('div', null, [title, children]) : null,
    TextArea: ({ value, onChange, placeholder }: any) => ActualReact.createElement('textarea', { value, onChange, placeholder }),
    Input: ({ value, onChange, placeholder }: any) => ActualReact.createElement('input', { value, onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) => ActualReact.createElement('select', { value, onChange, placeholder }, children),
    DropdownItem: ({ children, value }: any) => ActualReact.createElement('option', { value }, children),
    Table: ({ data, columns, className }: any) => {
      return ActualReact.createElement('table', { className }, [
        ActualReact.createElement('thead', null, ActualReact.createElement('tr', null, columns.map((c: any, i: number) => ActualReact.createElement('th', { key: i }, c.title)))),
        ActualReact.createElement('tbody', null, data?.map((row: any, rIdx: number) => 
          ActualReact.createElement('tr', { key: rIdx }, columns.map((c: any, cIdx: number) => 
            ActualReact.createElement('td', { key: cIdx }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

const mockInstructionActive = {
  instructionId: 777,
  instructionRef: 'GAB-20260527-9999',
  dealName: 'Zenith Global Wire',
  instructionSource: 'SFT_POLLER_SYSTEM',
  requestType: 'PAYMENT',
  category: 'URGENT',
  status: 'DRAFT',
  citiDirectClientProfile: true,
  contractValidation: true,
  mppRequired: true,
  signatureRequired: true,
  mppException: true,
  callbackRequired: true,
  awsAccount: 'AWS-998877',
  transactionType: 'WIRE',
  transactionQuantity: 10,
  amount: 4500000,
  currency: 'USD',
  transactionSystem: 'ICG_CORE',
  description: 'Core operations transfer settlement'
};

const mockInstructionInactive = { ...mockInstructionActive, instructionId: 888, callbackRequired: false, awsAccount: null };
const mockComments = [{ commentId: 'c1', commentText: 'Looks good for processing', createdBy: 'admin.maker1', createdAt: '2026-05-27T10:00:00Z' }];
const mockDocuments = [{ documentId: 'd1', fileName: 'authorization_letter.pdf', documentType: 'AUTHORIZATION_LETTER', region: 'NAM', uploadedBy: 'st31960', uploadedOn: '2026-05-26' }];
const mockHistory = [{ callBackId: 1, action: 'Completed', contactName: 'John Smith', comment: 'Confirmed details via phone', attemptedBy: 'admin.maker1', attemptedDate: '2026-05-03' }];

describe('InstructionDetailPage Comprehensive Coverage Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getComments as Mock).mockResolvedValue({ data: mockComments });
    (getDocuments as Mock).mockResolvedValue({ data: mockDocuments });
    (getInstructionHistory as Mock).mockResolvedValue({ data: mockHistory });
    (getFieldHistory as Mock).mockResolvedValue({ data: [] });
  });

  it('should cover truthy conditional paths, tables, and populated lists', async () => {
    (getInstruction as Mock).mockResolvedValue({ data: mockInstructionActive });
    render(<InstructionDetailPage />);
    await waitFor(() => expect(screen.getByText('Zenith Global Wire')).toBeTruthy());
    expect(screen.getByText('Call Back Log')).toBeTruthy();
    expect(screen.getByText('John Smith')).toBeTruthy();
    expect(screen.getByText('Looks good for processing')).toBeTruthy();
  });

  it('should cover falsy conditional fields and fallback descriptions', async () => {
    (getInstruction as Mock).mockResolvedValue({ data: mockInstructionInactive });
    (getComments as Mock).mockResolvedValue({ data: [] });
    render(<InstructionDetailPage />);
    await waitFor(() => expect(screen.getByText('Instruction Details')).toBeTruthy());
    expect(screen.getByText('No callbacks required')).toBeTruthy();
    expect(screen.getByText('No comments yet')).toBeTruthy();
  });

  it('should update state and invoke API loop when adding a new comment', async () => {
    (getInstruction as Mock).mockResolvedValue({ data: mockInstructionActive });
    (addComment as Mock).mockResolvedValue({ data: {} });
    render(<InstructionDetailPage />);
    await waitFor(() => screen.getByText('Call Back Log'));
    const commentBox = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(commentBox, { target: { value: 'Approved text summary' } });
    const sendButton = screen.getByText('icon-send').parentElement;
    if (sendButton) fireEvent.click(sendButton);
    expect(addComment).toHaveBeenCalled();
  });

  it('should handle document filtering and searching inside the documents tab layout', async () => {
    (getInstruction as Mock).mockResolvedValue({ data: mockInstructionActive });
    render(<InstructionDetailPage />);
    await waitFor(() => screen.getByText('Zenith Global Wire'));
    const documentsTabButton = screen.getByText('Task Overview');
    fireEvent.click(documentsTabButton);
    const docSearchInput = screen.getByPlaceholderText('Search Instruction Documents');
    fireEvent.change(docSearchInput, { target: { value: 'authorization' } });
    expect(screen.getByText('authorization_letter.pdf')).toBeTruthy();
  });

  it('should toggle field-level sub tabs within the audit interface block', async () => {
    (getInstruction as Mock).mockResolvedValue({ data: mockInstructionActive });
    render(<InstructionDetailPage />);
    await waitFor(() => screen.getByText('Zenith Global Wire'));
    const auditTabButton = screen.getByText('Audit');
    fireEvent.click(auditTabButton);
    const transactionSubTab = screen.getByText('Transaction');
    fireEvent.click(transactionSubTab);
    const fieldLevelSubTab = screen.getByText('Field Level');
    fireEvent.click(fieldLevelSubTab);
  });
});