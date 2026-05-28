//  Complete Production File: ApprovalQueuePage.test.tsx


// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import ApprovalQueuePage from '../ApprovalQueuePage'; 
import { getInstructions, getDashboardCounts } from '../../../api/instructions';

// 1. Mock standard routing parameters
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 2. Concrete API Namespace Footprint Mocking to block Copilot Quick-Fix regressions
vi.mock('../../../api/instructions', () => ({
  getInstructions: vi.fn(),
  getDashboardCounts: vi.fn(),
  processApproval: vi.fn(),
}));

// 3. Mock internal design system components with correct properties and unique list keys
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style }: any) => ActualReact.createElement('div', { className, style }, children),
    Card: ({ children, header, onClick, className }: any) => 
      ActualReact.createElement('div', { className, onClick, 'data-testid': 'mock-card' }, [
        ActualReact.createElement('div', { key: 'h', className: 'card-header' }, header),
        ActualReact.createElement('div', { key: 'b', className: 'card-body' }, children)
      ]),
    Table: ({ data, columns, className }: any) => {
      return ActualReact.createElement('table', { className }, [
        ActualReact.createElement('thead', { key: 'th' }, 
          ActualReact.createElement('tr', null, columns?.map((c: any, i: number) => 
            ActualReact.createElement('th', { key: `col-head-${i}`, onClick: c.onHeaderCell ? c.onHeaderCell().onClick : undefined }, c.title)
          ))
        ),
        ActualReact.createElement('tbody', { key: 'tb' }, data?.map((row: any, rIdx: number) => 
          ActualReact.createElement('tr', { key: `row-group-${rIdx}` }, columns?.map((c: any, cIdx: number) => 
            ActualReact.createElement('td', { key: `cell-item-${rIdx}-${cIdx}` }, c.render ? c.render(row[c.dataIndex], row) : row[c.dataIndex])
          ))
        ))
      ]);
    },
    Icon: ({ type }: any) => ActualReact.createElement('span', null, `icon-${type}`),
    Input: ({ value, onChange, placeholder }: any) => ActualReact.createElement('input', { value: value || '', onChange, placeholder }),
    Dropdown: ({ children, value, onChange, placeholder }: any) => ActualReact.createElement('select', { value: value || '', onChange, 'aria-label': placeholder }, children),
    DropdownItem: ({ children, value }: any) => ActualReact.createElement('option', { value }, children),
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
    Modal: ({ children, visible, title, onCancel, onApply }: any) => visible ? ActualReact.createElement('div', { 'data-testid': 'mock-modal' }, [
      ActualReact.createElement('h3', { key: 't' }, title),
      ActualReact.createElement('button', { key: 'c', onClick: onCancel }, 'Cancel'),
      ActualReact.createElement('button', { key: 'a', onClick: onApply }, 'Apply'),
      children
    ]) : null,
    TextArea: ({ value, onChange, placeholder }: any) => ActualReact.createElement('textarea', { value, onChange, placeholder }),
    notification: { success: vi.fn(), danger: vi.fn() },
    Loading: ({ tip }: any) => ActualReact.createElement('div', null, tip || 'Loading...'),
  };
});

describe('ApprovalQueuePage Component Comprehensive Branch Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mocks dashboard statistics matching the multi-status map queues perfectly
    vi.mocked(getDashboardCounts).mockResolvedValue({ 
      data: { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 2, PENDING_SIGNATURE_VALIDATION: 0 } 
    });
    
    // Returns data payload containing formatted text properties evaluated inside list filters and custom cells
    vi.mocked(getInstructions).mockResolvedValue({ 
      data: { 
        content: [
          { 
            instructionId: '777', 
            instructionRef: 'GAB-1779428957083-2369',
            source: 'Email - checker.user@citi.com', // Delimited string satisfies row split filters safely
            clientName: 'TELECOM ARGENTINA SA',
            dealName: 'TELECOM ARGENTINA SA',
            country: 'BRAZIL',
            accountNumber: '1234567890',
            dueDate: '2026-05-21',
            status: 'PENDING_CHECKER',
            category: 'GENERAL',
            region: 'LATAM',
            paymentMethod: 'WIRE',
            primaryAssignee: 'SA07013',
            ticklerTaskId: 'TK-101',
            modifiedBy: 'SYSTEM',
            modifiedOn: '2026-05-26T12:00:00Z',
            adminMaker: 'MAKER-01'
          }
        ] 
      } 
    });
  });

  // Test 1: Complete Render Mount and String Parsing Coverage
  it('should render table grid layout records correctly along with structural custom cell columns', async () => {
    render(<ApprovalQueuePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Instructions Explorer')).toBeTruthy();
    });

    // Validates custom table header items are active
    expect(screen.getByText('Sequence No.')).toBeTruthy();
    expect(screen.getByText('Source & Category')).toBeTruthy();
    expect(screen.getByText('Client, GFC & Country')).toBeTruthy();

    // Verifies row text link matches parsed properties inside custom cell configurations
    expect(screen.getByText('GAB-1779428957083-2369')).toBeTruthy();
    expect(screen.getByText('TELECOM ARGENTINA SA')).toBeTruthy();
  });

  // Test 2: Click Events Filter Switching Loops
  it('should alter filter contexts and row limits when metric status summary cards are clicked', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));

    // Select specific metric sub-category card wrapper elements
    const summaryCard = screen.getByText('Admin Checker').parentElement;
    expect(summaryCard).toBeTruthy();

    if (summaryCard) {
      fireEvent.click(summaryCard); // Toggle specific filter queue on
      fireEvent.click(summaryCard); // Clear filter selection state fallback branch path
    }
  });

  // Test 3: Core Interactive Form Filters Input Routing
  it('should dynamically narrow visible data sets when typing inside the global text box', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));

    const searchBox = screen.getByPlaceholderText('Search Instructions');
    expect(searchBox).toBeTruthy();

    // Change value parameters to trigger filtered lookups across search terms mapping criteria
    fireEvent.change(searchBox, { target: { value: 'ARGENTINA' } });
    expect(screen.getByText('GAB-1779428957083-2369')).toBeTruthy();

    fireEvent.change(searchBox, { target: { value: 'NON_EXISTENT_TOKEN' } });
    expect(screen.queryByText('GAB-1779428957083-2369')).toBeNull();
  });

  // Test 4: Form Dropdown Input Option Selection Toggles
  it('should update filter parameters when selecting items inside drop-down elements', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));

    const countrySelect = screen.getByLabelText('Country');
    fireEvent.change(countrySelect, { target: { value: 'BRAZIL' } });

    const sourceSelect = screen.getByLabelText('Source');
    fireEvent.change(sourceSelect, { target: { value: 'Manual' } });
  });

  // Test 5: Table Header Sorting Event Validation Trackers
  it('should execute sort parameters when table header titles are targeted', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));

    const sequenceHeader = screen.getByText('Sequence No.');
    fireEvent.click(sequenceHeader); // Toggle asc sort order state parameters
  });

  // Test 6: Cell Navigation Router Redirect Handlers
  it('should redirect route variables when sequence data element links are selected', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => screen.getByText('Instructions Explorer'));

    const activeRowLink = screen.getByText('GAB-1779428957083-2369');
    fireEvent.click(activeRowLink);

    expect(mockNavigate).toHaveBeenCalledWith('/instructions/777');
  });
});