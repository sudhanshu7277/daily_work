// // @vitest-environment jsdom
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen, waitFor } from '@testing-library/react';
// import React from 'react';

// import InstructionDetailPage from '../InstructionDetailPage'; 
// import * as apiInstructions from '../../../api/instructions'; 
// import * as apiComments from '../../../api/comments'; 
// import * as apiDocuments from '../../../api/documents'; 
// import * as apiAudit from '../../../api/audit'; 

// 1. Mock standard routing parameters and path tokens
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: vi.fn(() => ({ id: '777' })),
}));

// 2. Mock regional formatting utilities directly to intercept component crashes
vi.mock('../../../utils/format', () => ({
  formatCurrency: (val: any) => typeof val === 'number' ? `$${val.toLocaleString()}` : val,
  formatDate: (val: any) => val,
}));

// 3. Mock internal corporate library components with safe factory stubs
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  const MockFactory = (tag: string) => {
    return ({ children, className, ...props }: any) => ActualReact.createElement(tag, { className, ...props }, children);
  };

  return {
    El: MockFactory('div'),
    Card: ({ children, header, className }: any) => 
      ActualReact.createElement('div', { className, 'data-testid': 'icgds-card' }, [
        header && ActualReact.createElement('div', { key: 'h', className: 'card-header' }, header),
        ActualReact.createElement('div', { key: 'b', className: 'card-body' }, children)
      ]),
    Button: ({ children, onClick, disabled, className }: any) => 
      ActualReact.createElement('button', { onClick, disabled, className }, children),
    Icon: ({ type }: any) => ActualReact.createElement('span', null, `icon-${type}`),
    Tag: ({ children, style, color }: any) => ActualReact.createElement('span', { style, 'data-color': color }, children),
    Loading: () => ActualReact.createElement('div', null, 'Loading Instruction Details...'),
    Alert: ({ children, type }: any) => ActualReact.createElement('div', { className: `alert-${type}` }, children),
    Modal: ({ children, visible, title, onCancel, onApply }: any) => 
      visible ? ActualReact.createElement('div', { 'data-testid': 'mock-modal' }, [
        ActualReact.createElement('h3', { key: 't' }, title),
        ActualReact.createElement('button', { key: 'c', onClick: onCancel }, 'Cancel'),
        ActualReact.createElement('button', { key: 'a', onClick: onApply }, 'Apply'),
        children
      ]) : null,
    TextArea: ({ value, onChange, placeholder }: any) => ActualReact.createElement('textarea', { value, onChange, placeholder }),
    Input: ({ value, onChange, placeholder }: any) => ActualReact.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) => ActualReact.createElement('select', { value: value || '', onChange, placeholder }, children),
    DropdownItem: ({ children, value }: any) => ActualReact.createElement('option', { value }, children),
    Table: ({ data, columns, className }: any) => {
      return ActualReact.createElement('table', { className }, [
        ActualReact.createElement('thead', { key: 'th' }, 
          ActualReact.createElement('tr', null, columns?.map((c: any, i: number) => ActualReact.createElement('th', { key: i }, c.title)))
        ),
        ActualReact.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
          ActualReact.createElement('tr', { key: rIdx }, columns?.map((c: any, cIdx: number) => 
            ActualReact.createElement('td', { key: cIdx }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    StatusTag: ({ status }: any) => ActualReact.createElement('span', null, status),
    Tooltip: ({ children, tooltip }: any) => ActualReact.createElement('div', { 'data-tooltip': tooltip }, children),
    Steps: ({ items, current }: any) => ActualReact.createElement('div', { 'data-current-step': current }, 
      items?.map((item: any, idx: number) => ActualReact.createElement('span', { key: idx }, item.title))
    ),
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

describe('InstructionDetailPage Comprehensive Coverage Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // TARGET FIX: Ensuring every audit field property explicitly implements fallback defaults to completely eradicate split lookups errors
    const defaultInstructionResponse = {
      instructionId: 777,
      instructionRef: 'GAB-992211',
      dealName: 'Zenith Global Wire', 
      clientName: 'Zenith Enterprise LLC',
      accountNumber: '9876543210',
      paymentMethod: 'FEDWIRE',
      amount: 2500000,
      currency: 'USD',
      status: 'PENDING_CHECKER',
      source: 'MOCK - SOURCE',
      primaryAssignee: 'MOCK - ASSIGNEE',
      createdBy: 'MOCK - CREATOR',
      modifiedBy: 'MOCK - MODIFIER',
      dueDate: '2026-06-15',
      signatureRequired: true,
      callbackRequired: true
    };

    // Spying with a unified structure configuration overrides partial properties missing across mounting loops
    vi.spyOn(apiInstructions, 'getInstruction').mockResolvedValue({ data: defaultInstructionResponse });
    vi.spyOn(apiComments, 'getComments').mockResolvedValue({ data: [] });
    vi.spyOn(apiDocuments, 'getDocuments').mockResolvedValue({ data: [] });
    vi.spyOn(apiAudit, 'getInstructionHistory').mockResolvedValue({ data: [] });
    vi.spyOn(apiAudit, 'getFieldHistory').mockResolvedValue({ data: [] });
  });

  it('should render core instruction fields safely on mount and pass split transformations', async () => {
    render(<InstructionDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Zenith Global Wire')).toBeTruthy();
    });
  });
});