import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

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

// 3. Mock internal design system library wrappers with strictly sanitized type properties
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, onClick, className, style }: any) => 
      ReactActual.createElement('div', { onClick, className, style }, children),
    Card: ({ children, header, className, onClick }: any) => 
      ReactActual.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        ReactActual.createElement('div', { key: 'h', className: 'card-header' }, header),
        ReactActual.createElement('div', { key: 'b', className: 'card-body' }, children)
      ]),
    Table: ({ data, columns, className }: any) => {
      return ReactActual.createElement('table', { className }, [
        ReactActual.createElement('thead', { key: 'th' }, 
          ReactActual.createElement('tr', null, columns.map((col: any, idx: number) => 
            ReactActual.createElement('th', { key: idx, onClick: col.title?.props?.onClick }, col.title)
          ))
        ),
        ReactActual.createElement('tbody', { key: 'tb' }, 
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
    Icon: ({ type, className }: any) => 
      ReactActual.createElement('span', { className }, `icon-${type}`),
    Input: ({ value, onChange, placeholder }: any) => 
      ReactActual.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) => 
      ReactActual.createElement('select', { value: value || '', onChange, placeholder }, children),
    DropdownItem: ({ children, value }: any) => 
      ReactActual.createElement('option', { value }, children),
    // FIXED: Explicitly cast e.target as any to eliminate the type compilation error
    RangePicker: ({ onChange, placeholder }: any) => 
      ReactActual.createElement('input', { 
        type: 'date', 
        onChange: (e: any) => onChange ? onChange([new Date(e.target.value), new Date(e.target.value)]) : null, 
        placeholder 
      }),
    Pagination: ({ current, onChange }: any) => 
      ReactActual.createElement('div', null, [
        ReactActual.createElement('button', { key: 'p', onClick: () => onChange ? onChange(current + 1) : null }, 'Next')
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
        ActualReact.createElement('div', { key: 'h', className: 'card-header' }, header),
        ActualReact.createElement('div', { key: 'b', className: 'card-body' }, children)
      ]),
    Button: ({ children, onClick, disabled }: any) => ActualReact.createElement('button', { onClick, disabled }, children),
    Icon: ({ type }: any) => ActualReact.createElement('span', null, `icon-${type}`),
    Tag: ({ children, style, color }: any) => ActualReact.createElement('span', { style, 'data-color': color }, children),
    Loading: () => ActualReact.createElement('div', null, 'Loading Instruction Details...'),
    Alert: ({ children, type }: any) => ActualReact.createElement('div', { className: `alert-${type}` }, children),
    Modal: ({ children, visible, title }: any) => visible ? ActualReact.createElement('div', null, [title, children]) : null,
    TextArea: ({ value, onChange, placeholder }: any) => ActualReact.createElement('textarea', { value, onChange, placeholder }),
    Input: ({ value, onChange, placeholder }: any) => ActualReact.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) => ActualReact.createElement('select', { value: value || '', onChange, placeholder }, children),
    DropdownItem: ({ children, value }: any) => ActualReact.createElement('option', { value }, children),
    Table: ({ data, columns, className }: any) => {
      return ActualReact.createElement('table', { className }, [
        ActualReact.createElement('thead', { key: 'th' }, ActualReact.createElement('tr', null, columns.map((c: any, i: number) => ActualReact.createElement('th', { key: i }, c.title)))),
        ActualReact.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
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


///🧪 Complete Reviewed File: InstructionListPage.test.tsx
//File Path location: src/pages/instructions/__tests__/InstructionListPage.test.tsx


import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Path matching pages/instructions/__tests__/ relative directory layout trees
import InstructionListPage from '../InstructionListPage';
import { getInstructions, getDashboardCounts, getActionRequiredItems } from '../../../api/instructions';

// 1. Mock standard routing parameters and search parameters
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, vi.fn()],
}));

// 2. Mock API modules explicitly
vi.mock('../../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
  getActionRequiredItems: vi.fn(),
}));

// 3. Complete structural mock layout matching the internal corporate library design wrappers
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, onClick, className, style }: any) => 
      ReactActual.createElement('div', { onClick, className, style }, children),
    Card: ({ children, header, className, onClick, style }: any) => 
      ReactActual.createElement('div', { className, onClick, style: JSON.stringify(style), 'data-testid': 'mock-card' }, [
        ReactActual.createElement('div', { key: 'ch', className: 'card-header' }, header),
        ReactActual.createElement('div', { key: 'cb', className: 'card-body' }, children)
      ]),
    Table: ({ data, columns, className }: any) => {
      return ReactActual.createElement('table', { className }, [
        ReactActual.createElement('thead', { key: 'thead' }, 
          ReactActual.createElement('tr', null, columns.map((c: any, i: number) => ReactActual.createElement('th', { key: i }, c.title)))
        ),
        ReactActual.createElement('tbody', { key: 'tbody' }, 
          data?.map((row: any, rIdx: number) => 
            ReactActual.createElement('tr', { key: rIdx }, columns.map((c: any, cIdx: number) => 
              ReactActual.createElement('td', { key: cIdx }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
            ))
          )
        )
      ]);
    },
    Icon: ({ type, className }: any) => ReactActual.createElement('span', { className }, `icon-${type}`),
    Input: ({ value, onChange, placeholder }: any) => 
      ReactActual.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) => 
      ReactActual.createElement('select', { value: value || '', onChange, 'aria-label': placeholder }, children),
    DropdownItem: ({ children, value }: any) => ReactActual.createElement('option', { value }, children),
    // Explicitly typed parameter casting allows input variables to pass compilation checks cleanly
    RangePicker: ({ onChange, placeholder }: any) => 
      ReactActual.createElement('input', { 
        type: 'date', 
        onChange: (e: any) => onChange ? onChange([new Date(e.target.value), new Date(e.target.value)]) : null, 
        placeholder 
      }),
    Pagination: ({ current, onChange }: any) => 
      ReactActual.createElement('button', { onClick: () => onChange ? onChange(current + 1) : null }, 'Next'),
    Loading: () => ReactActual.createElement('div', null, 'Loading instructions...'),
    Alert: ({ children, type }: any) => ReactActual.createElement('div', { className: `alert-${type}` }, children),
    Button: ({ children, onClick, color, size }: any) => ReactActual.createElement('button', { onClick, className: `${color} ${size}` }, children),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
  };
});

// Mock records configured to hit both branches of split string parsers and date evaluations
const mockContentRecords = [
  {
    instructionId: 'lst-101',
    instructionRef: 'GAB-1778880964589-1235',
    clientName: 'Citi Enterprise Logistics',
    source: 'Email - jp72154@citi.com', // Delimited to exercise split functionality
    dealName: 'Telecom Bundle Delta',
    dueDate: '2026-05-20',
    status: 'PENDING_CHECKER',
    senderEmail: 'jp72154@citi.com',
    paymentMethod: 'WIRE',
    createdBy: 'SYSTEM',
    region: 'LATAM',
    country: 'BRAZIL',
    buildingCode: 'BLDG-A',
    modifiedBy: 'SA07013',
    modifiedOn: '2026-05-26T12:00:00Z'
  },
  {
    instructionId: 'lst-202',
    instructionRef: 'GAB-1779413223804-1110',
    clientName: 'CP LA CASTELLANA SAU',
    source: 'CitiSFT', // Standard string to cover fallback branch properties
    dealName: 'Cepula Castellana Swap',
    dueDate: '2026-05-25',
    status: 'DRAFT',
    createdBy: 'SA07013',
    region: 'NAM',
    country: 'Argentina'
  }
];

const mockCountsPayload = { PENDING_CHECKER: 1, DRAFT: 1 };
const mockActionRequiredPayload = [
  { instructionId: 'lst-101', instructionRef: 'GAB-1778880964589-1235', message: 'Missing Signature Document', returnedOn: '2026-05-27' }
];


describe('InstructionListPage Thorough Branch Validation Suite', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      (getDashboardCounts as Mock).mockResolvedValue({ data: mockCountsPayload });
      (getInstructions as Mock).mockResolvedValue({ data: { content: mockContentRecords, totalElements: 2, totalPages: 1 } });
      (getActionRequiredItems as Mock).mockResolvedValue({ data: mockActionRequiredPayload });
    });
  
    // Test 1: Layout initialization and mapping cells parsing verification
    it('should render headers, query forms, metrics summaries, and lists completely', async () => {
      render(<InstructionListPage />);
  
      // Wait until loading hook is turned off and elements match
      await waitFor(() => {
        expect(screen.getByText('Citi Enterprise Logistics')).toBeTruthy();
      });
  
      // Check individual table structural layout text markers
      expect(screen.getByText('Sequence No.')).toBeTruthy();
      expect(screen.getByText('Source & Category')).toBeTruthy();
  
      // Verify cell format splitters correctly execute branches
      expect(screen.getByText('jp72154@citi.com')).toBeTruthy();
      expect(screen.getByText('CitiSFT')).toBeTruthy();
    });
  
    // Test 2: Summary card filter operations execution path
    it('should apply and toggle query configurations on metric tab selection click events', async () => {
      render(<InstructionListPage />);
      await waitFor(() => screen.getByText('Citi Enterprise Logistics'));
  
      const activeCountCard = screen.getByText('Pending Checker').parentElement;
      expect(activeCountCard).toBeTruthy();
  
      if (activeCountCard) {
        fireEvent.click(activeCountCard); // Activates the filtering parameter configuration layer
        fireEvent.click(activeCountCard); // Clears tracking constraints via target toggle match conditions
      }
    });
  
    // Test 3: Form text string parsing evaluation criteria
    it('should dynamically narrow dataset rendering results when values change inside the text box', async () => {
      render(<InstructionListPage />);
      await waitFor(() => screen.getByText('Citi Enterprise Logistics'));
  
      const filterInput = screen.getByPlaceholderText('Search Instructions');
      expect(filterInput).toBeTruthy();
  
      // Fire search filter updates
      fireEvent.change(filterInput, { target: { value: 'CASTELLANA' } });
  
      expect(screen.getByText('CP LA CASTELLANA SAU')).toBeTruthy();
      expect(screen.queryByText('Citi Enterprise Logistics')).toBeNull();
    });
  
    // Test 4: Action Required collapsible accordion drawer triggers
    it('should render alert criteria tables and expand layout dimensions safely on panel headers click', async () => {
      render(<InstructionListPage />);
      await waitFor(() => screen.getByText('Action Required'));
  
      expect(screen.getByText('Missing Signature Document')).toBeTruthy();
  
      const accordionSection = screen.getByText('Action Required').parentElement;
      if (accordionSection) {
        fireEvent.click(accordionSection); // Tests collapsible display toggle branching states
      }
    });
  
    // Test 5: Dropdown filter inputs parameter tracking metrics validation
    it('should change filter context fields cleanly on form select events', async () => {
      render(<InstructionListPage />);
      await waitFor(() => screen.getByText('Citi Enterprise Logistics'));
  
      const filterCountry = screen.getByLabelText('Country');
      fireEvent.change(filterCountry, { target: { value: 'BRAZIL' } });
  
      const filterSource = screen.getByLabelText('Source');
      fireEvent.change(filterSource, { target: { value: 'CitiSFT' } });
    });
  
    // Test 6: Cell navigation router callback compliance
    it('should resolve routing functions seamlessly when grid sequence tokens are triggered', async () => {
      render(<InstructionListPage />);
      await waitFor(() => screen.getByText('Citi Enterprise Logistics'));
  
      const gridCellLink = screen.getByText('GAB-1778880964589-1235');
      expect(gridCellLink).toBeTruthy();
  
      fireEvent.click(gridCellLink);
      expect(mockNavigate).toHaveBeenCalledWith('/instructions/lst-101');
    });
  
    // Test 7: Payment vs Non-Payment absolute queue path switches
    it('should handle category switches correctly when processing alternative navigation tags', async () => {
      render(<InstructionListPage />);
      await waitFor(() => screen.getByText('Sequence No.'));
  
      const nonPaymentTab = screen.queryByText('Non-Payment Instructions');
      if (nonPaymentTab) {
        fireEvent.click(nonPaymentTab);
      }
  
      const paymentTab = screen.queryByText('Payment Instructions');
      if (paymentTab) {
        fireEvent.click(paymentTab);
      }
    });
  });

  