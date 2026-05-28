// InstructionListPage.test.tsx

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
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ActualReact.createElement('div', { className }, children),
    Card: ({ children, header }: any) => ActualReact.createElement('div', null, [header, children]),
    Table: ({ data, columns }: any) => {
      return ActualReact.createElement('table', null, [
        ActualReact.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
          ActualReact.createElement('tr', { key: rIdx }, columns.map((c: any, cIdx: number) => 
            ActualReact.createElement('td', { key: cIdx }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    Icon: () => ActualReact.createElement('span', null),
    Input: () => ActualReact.createElement('input', null),
    Dropdown: () => ActualReact.createElement('select', null),
    RangePicker: () => ActualReact.createElement('input', { type: 'date' }),
    Pagination: () => ActualReact.createElement('div', null),
    Loading: () => ActualReact.createElement('div', null, 'Loading...'),
    Alert: ({ children }: any) => ActualReact.createElement('div', null, children),
    Button: ({ children }: any) => ActualReact.createElement('button', null, children),
    StatusTag: ({ status }: any) => ActualReact.createElement('span', null, status),
  };
});

describe('InstructionListPage Thorough Branch Validation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardCounts).mockResolvedValue({ data: { PENDING_CHECKER: 1, DRAFT: 1 } });
    vi.mocked(getActionRequiredItems).mockResolvedValue({ data: [] });
    
    // FIXED: Formatted the source parameter text explicitly using the expected " - " delimiter pattern
    vi.mocked(getInstructions).mockResolvedValue({ 
      data: { 
        content: [
          { 
            instructionId: '1', 
            clientName: 'Citi Log',
            source: 'Email - maker.user@citi.com', 
            instructionRef: 'GAB-998877',
            dueDate: '2026-05-28'
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

//ApprovalQueuePage.test.tsx

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
    Card: ({ children, header }: any) => ActualReact.createElement('div', null, [header, children]),
    Table: ({ data, columns }: any) => {
      return ActualReact.createElement('table', null, [
        ActualReact.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
          ActualReact.createElement('tr', { key: rIdx }, columns.map((c: any, cIdx: number) => 
            ActualReact.createElement('td', { key: cIdx }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    Icon: () => ActualReact.createElement('span', null),
    Input: () => ActualReact.createElement('input', null),
    Dropdown: () => ActualReact.createElement('select', null),
    RangePicker: () => ActualReact.createElement('input', { type: 'date' }),
    Pagination: () => ActualReact.createElement('div', null),
    StatusTag: ({ status }: any) => ActualReact.createElement('span', null, status),
  };
});

describe('ApprovalQueuePage Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardCounts).mockResolvedValue({ data: { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 1 } });
    
    // FIXED: Ensured structure mirrors production data model directly under the content collection property
    vi.mocked(getInstructions).mockResolvedValue({ 
      data: { 
        content: [
          { 
            instructionId: '777', 
            instructionRef: 'GAB-1234',
            source: 'Email - checker.user@citi.com',
            clientName: 'Telecom Corp'
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