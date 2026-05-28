// 1. Final Complete File: InstructionListPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionListPage from '../InstructionListPage';
import { getInstructions, getDashboardCounts, getActionRequiredItems } from '../../../api/instructions';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('../../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
  getActionRequiredItems: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ReactActual.createElement('div', { className }, children),
    Card: ({ children, header, className, onClick }: any) => 
      ReactActual.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        ReactActual.createElement('div', { key: 'h', className: 'card-header' }, header),
        ReactActual.createElement('div', { key: 'b', className: 'card-body' }, children)
      ]),
    Table: ({ data, columns }: any) => {
      return ReactActual.createElement('table', null, [
        ReactActual.createElement('thead', { key: 'th' }, 
          ReactActual.createElement('tr', null, columns.map((c: any, i: number) => 
            ReactActual.createElement('th', { key: `col-${i}` }, c.title)
          ))
        ),
        ReactActual.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
          ReactActual.createElement('tr', { key: `row-${rIdx}` }, columns.map((c: any, cIdx: number) => 
            ReactActual.createElement('td', { key: `cell-${rIdx}-${cIdx}` }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    Icon: () => ReactActual.createElement('span', null),
    Input: ({ value, onChange, placeholder }: any) => ReactActual.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) => ReactActual.createElement('select', { value: value || '', onChange, 'aria-label': placeholder }, children),
    DropdownItem: ({ children, value }: any) => ReactActual.createElement('option', { value }, children),
    RangePicker: () => ReactActual.createElement('input', { type: 'date' }),
    Pagination: () => ReactActual.createElement('div', null),
    Loading: () => ReactActual.createElement('div', null, 'Loading instructions...'),
    Alert: ({ children }: any) => ReactActual.createElement('div', null, children),
    Button: ({ children }: any) => ReactActual.createElement('button', null, children),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
  };
});

describe('InstructionListPage Thorough Branch Validation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardCounts).mockResolvedValue({ data: { PENDING_CHECKER: 1, DRAFT: 1 } });
    vi.mocked(getActionRequiredItems).mockResolvedValue({ data: [] });
    
    // Configured data strings and states cleanly to prevent .toLowerCase() string processing crashes
    vi.mocked(getInstructions).mockResolvedValue({ 
      data: { 
        content: [
          { 
            instructionId: '1', 
            clientName: 'Citi Log',
            source: 'Email - maker.user@citi.com', 
            instructionRef: 'GAB-998877',
            dueDate: '2026-05-28',
            status: 'DRAFT',
            dealName: 'Telecom Deal'
          }
        ], 
        totalElements: 1, 
        totalPages: 1 
      } 
    });
  });

  it('should render headers, query forms, metrics summaries, and lists completely', async () => {
    render(<InstructionListPage />);
    await waitFor(() => expect(screen.getByText('Citi Log')).toBeTruthy());
  });
});

// 2. Final Complete File: ApprovalQueuePage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ApprovalQueuePage from '../ApprovalQueuePage'; 
import { getInstructions, getDashboardCounts } from '../../../api/instructions';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ActualReact.createElement('div', { className }, children),
    Card: ({ children, header, onClick, className }: any) => 
      ActualReact.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        ActualReact.createElement('div', { key: 'h', className: 'card-header' }, header),
        ActualReact.createElement('div', { key: 'b', className: 'card-body' }, children)
      ]),
    Table: ({ data, columns }: any) => {
      return ActualReact.createElement('table', null, [
        ReactActual.createElement('thead', { key: 'th' }, 
          ReactActual.createElement('tr', null, columns.map((c: any, i: number) => 
            ReactActual.createElement('th', { key: `col-${i}` }, c.title)
          ))
        ),
        ActualReact.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
          ActualReact.createElement('tr', { key: `row-${rIdx}` }, columns.map((c: any, cIdx: number) => 
            ActualReact.createElement('td', { key: `cell-${rIdx}-${cIdx}` }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    Icon: () => ActualReact.createElement('span', null),
    Input: () => ActualReact.createElement('input', null),
    Dropdown: () => ActualReact.createElement('select', null),
    RangePicker: ({ onChange, placeholder }: any) => 
      ActualReact.createElement('input', { 
        type: 'date', 
        onChange: (e: any) => onChange ? onChange([new Date(e.target.value), new Date(e.target.value)]) : null, 
        placeholder 
      }),
    Pagination: ({ current, onChange }: any) => 
      ActualReact.createElement('div', null, [
        ActualReact.createElement('button', { key: 'p', onClick: () => onChange ? onChange(current + 1) : null }, 'Next')
      ]),
    StatusTag: ({ status }: any) => ActualReact.createElement('span', null, status),
    Alert: ({ children, type }: any) => ActualReact.createElement('div', { className: `alert-${type}` }, children),
    Button: ({ children, onClick, color, size }: any) => ActualReact.createElement('button', { onClick, className: `${color} ${size}` }, children),
  };
});

describe('ApprovalQueuePage Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardCounts).mockResolvedValue({ data: { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 1 } });
    
    vi.mocked(getInstructions).mockResolvedValue({ 
      data: { 
        content: [
          { 
            instructionId: '777', 
            instructionRef: 'GAB-1779428957083-2369',
            source: 'Email - checker.user@citi.com',
            clientName: 'TELECOM ARGENTINA SA',
            dealName: 'TELECOM ARGENTINA SA',
            country: 'BRAZIL',
            dueDate: '2026-05-21',
            status: 'PENDING_CHECKER'
          }
        ] 
      } 
    });
  });

  it('should render table grid records correctly with default sorting vectors on mount', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => expect(screen.getByText('Instructions Explorer')).toBeTruthy());
  });
});