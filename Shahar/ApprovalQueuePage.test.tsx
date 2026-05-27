import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ApprovalQueuePage from './ApprovalQueuePage';
import { getInstructions, getDashboardCounts } from '../../api/instructions';

// 1. Mirror your team's exact React-Router structural mock pattern
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 2. Mock your operational API endpoints
vi.mock('../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
}));

// 3. Mirror your team's explicit structural import layout for icgds components
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  
  return {
    El: ({ children, onClick, className, style }: any) => 
      ReactActual.createElement('div', { onClick, className, style }, children),
    Card: ({ children, header }: any) => 
      ReactActual.createElement('div', { 'data-testid': 'mock-card' }, [header, children]),
    Table: ({ data, columns }: any) => {
      return ReactActual.createElement('table', null, [
        ReactActual.createElement('thead', null, 
          ReactActual.createElement('tr', null, 
            columns.map((col: any, idx: number) => 
              ReactActual.createElement('th', { 
                key: idx, 
                onClick: col.title?.props?.onClick 
              }, col.title)
            )
          )
        ),
        ReactActual.createElement('tbody', null, 
          data.map((row: any, idx: number) => 
            ReactActual.createElement('tr', { key: idx }, 
              columns.map((col: any, cIdx: number) => 
                ReactActual.createElement('td', { key: cIdx }, 
                  col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]
                )
              )
            )
          )
        )
      ]);
    },
    Icon: ({ type }: any) => ReactActual.createElement('span', null, `icon-${type}`),
    Input: ({ value, onChange, placeholder }: any) => 
      ReactActual.createElement('input', { value, onChange, placeholder }),
    Dropdown: ({ children, value, onChange }: any) => 
      ReactActual.createElement('select', { value, onChange }, children),
    RangePicker: ({ value, onChange }: any) => 
      ReactActual.createElement('input', { type: 'date', onChange }),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
  };
});

// 4. Set up mock domain values matching your database records
const mockDataPayload = [
  {
    instructionId: 'inst-100',
    instructionRef: 'GAB-20260501-9999',
    dealName: 'Zenith Corp Wire',
    clientName: 'Zenith Corp',
    accountNumber: '5678901234',
    source: 'Email - pr99886@citi.com',
    country: 'Brazil',
    dueDate: '2026-05-21',
    status: 'PENDING_CHECKER'
  },
  {
    instructionId: 'inst-200',
    instructionRef: 'GAB-20260501-1111',
    dealName: 'Alpha Logistics Settlement',
    clientName: 'Alpha Industries',
    accountNumber: '1122334455',
    source: 'CITI_SFT',
    country: 'Argentina',
    dueDate: '2026-05-25',
    status: 'ADMIN_PAYMENT_MAKER'
  }
];

const mockCountsPayload = {
  ADMIN_PAYMENT_MAKER: 1,
  PENDING_CHECKER: 1,
};

describe('ApprovalQueuePage Component Tests', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      (getDashboardCounts as vi.Mock).mockResolvedValue({ data: mockCountsPayload });
      (getInstructions as vi.Mock).mockResolvedValue({ data: { content: mockDataPayload } });
    });
  
    // Test 1: Verify Initial Sorted Layout Content Mounts Cleanly
    it('should render table data correctly with persistent sorting buttons', async () => {
      render(<ApprovalQueuePage />);
      
      await waitFor(() => {
        expect(screen.getByText('Instructions Explorer')).toBeTruthy();
      });
  
      // Check header text values
      expect(screen.getByText('Sequence No.')).toBeTruthy();
      expect(screen.getByText('Source & Category')).toBeTruthy();
  
      // Verify custom parser rows render matching data splits
      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByText('pr99886@citi.com')).toBeTruthy();
      expect(screen.getByText('CITI SFT')).toBeTruthy();
    });
  
    // Test 2: Verify Strict Persistent Two-Way Header Sorting Toggles
    it('should cycle sorting parameters strictly between asc and desc on header click', async () => {
      render(<ApprovalQueuePage />);
      await waitFor(() => screen.getByText('Instructions Explorer'));
  
      const sequenceNoHeaderButton = screen.getByText('Sequence No.').parentElement;
      expect(sequenceNoHeaderButton).toBeTruthy();
  
      // First click: toggles state sequence to track ascending values
      if (sequenceNoHeaderButton) fireEvent.click(sequenceNoHeaderButton);
      expect(screen.getByText('icon-arrow-up')).toBeTruthy();
  
      // Second click: toggles state sequence down to descending values
      if (sequenceNoHeaderButton) fireEvent.click(sequenceNoHeaderButton);
      expect(screen.getByText('icon-arrow-down')).toBeTruthy();
    });
  
    // Test 3: Verify Search Input Field Updates Data List
    it('should filter table list records when search characters are input', async () => {
      render(<ApprovalQueuePage />);
      await waitFor(() => screen.getByText('Instructions Explorer'));
  
      const searchBox = screen.getByPlaceholderText('Search Instructions');
      expect(searchBox).toBeTruthy();
  
      // Input "Zenith" to isolate the first row item
      fireEvent.change(searchBox, { target: { value: 'Zenith' } });
  
      expect(screen.getByText('Zenith Corp')).toBeTruthy();
      expect(screen.queryByText('Alpha Industries')).toBeNull();
    });
  
    // Test 4: Verify Router Navigation Action Fire
    it('should trigger router hook navigation when a Sequence number row link is clicked', async () => {
      render(<ApprovalQueuePage />);
      await waitFor(() => screen.getByText('Instructions Explorer'));
  
      const rowActionAnchor = screen.getByText('GAB-20260501-9999');
      expect(rowActionAnchor).toBeTruthy();
  
      fireEvent.click(rowActionAnchor);
      expect(mockNavigate).toHaveBeenCalledWith('/instructions/inst-100');
    });
  });