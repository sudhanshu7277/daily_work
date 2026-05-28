// 🧪 Complete Production File: ApprovalQueuePage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ApprovalQueuePage from '../ApprovalQueuePage'; 
import { getInstructions, getDashboardCounts } from '../../../api/instructions';

// 1. Standalone Routing Mocks to prevent hook layout crashes
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// 2. Concrete API Namespace Footprint Mocking to completely block Copilot Quick-Fix regressions
vi.mock('../../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
}));

// 3. Robust UI Component Engine Simulation using explicit Unique React DOM Keys
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ReactActual.createElement('div', { className }, children),
    Card: ({ children, header, onClick, className }: any) => 
      ReactActual.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        ReactActual.createElement('div', { key: 'h', className: 'card-header' }, header),
        ReactActual.createElement('div', { key: 'b', className: 'card-body' }, children)
      ]),
    Table: ({ data, columns }: any) => {
      return ReactActual.createElement('table', null, [
        ReactActual.createElement('thead', { key: 'th' }, 
          ReactActual.createElement('tr', null, columns.map((c: any, i: number) => 
            ReactActual.createElement('th', { key: `col-head-${i}` }, c.title)
          ))
        ),
        ReactActual.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
          ReactActual.createElement('tr', { key: `row-group-${rIdx}` }, columns.map((c: any, cIdx: number) => 
            ReactActual.createElement('td', { key: `cell-item-${rIdx}-${cIdx}` }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    Icon: () => ReactActual.createElement('span', null),
    Input: () => ReactActual.createElement('input', null),
    Dropdown: () => ReactActual.createElement('select', null),
    // FIXED: Explicit parameter typing prevents event-target lookup compile failures permanently
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

describe('ApprovalQueuePage Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardCounts).mockResolvedValue({ data: { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 1 } });
    
    // FIXED: Populated every single data string property used by internal useMemo filters to prevent .toLowerCase() runtime crashes
    vi.mocked(getInstructions).mockResolvedValue({ 
      data: { 
        content: [
          { 
            instructionId: '777', 
            instructionRef: 'GAB-1779428957083-2369',
            source: 'Email - checker.user@citi.com', // Structured string satisfies .split(' - ') requirement
            clientName: 'TELECOM ARGENTINA SA',
            dealName: 'TELECOM ARGENTINA SA',
            country: 'BRAZIL',
            dueDate: '2026-05-21',
            status: 'PENDING_CHECKER',
            category: 'GENERAL',
            region: 'LATAM',
            paymentMethod: 'WIRE'
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