// Replace the require statement inside DropdownItemMockSetup with standard ESM exports.

//Here is the updated, build-safe test file for CompletedInstructionsPage:

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import CompletedInstructionsPage from '../CompletedInstructionsPage';
import { getInstructions } from '../../api/instructions';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../api/instructions', () => ({
  getInstructions: vi.fn(),
}));

// Mock AgGridReact to render cells directly in DOM for testing
vi.mock('ag-grid-react', () => ({
  AgGridReact: (props: any) => (
    <div data-testid="ag-grid-mock">
      {props.rowData?.map((row: any, idx: number) => (
        <div key={idx} data-testid="ag-grid-row">
          {props.columnDefs?.map((col: any) => {
            const cellValue = row[col.field];
            if (col.cellRenderer) {
              const CellComponent = col.cellRenderer;
              return (
                <div key={col.field || col.headerName}>
                  {CellComponent({ value: cellValue, data: row })}
                </div>
              );
            }
            if (col.valueFormatter) {
              return (
                <div key={col.field || col.headerName}>
                  {col.valueFormatter({ value: cellValue })}
                </div>
              );
            }
            return <div key={col.field || col.headerName}>{cellValue}</div>;
          })}
        </div>
      ))}
    </div>
  ),
}));

// Mock custom UI library components using clean JSX and static attachments
vi.mock('@citi-icg-172888/icgds-react', () => {
  const DropdownMock = ({ children, onChange, placeholder }: any) => (
    <select
      aria-label={placeholder}
      onChange={(e) => onChange && onChange(e.target.value)}
    >
      {children}
    </select>
  );

  DropdownMock.Item = ({ value, children }: any) => (
    <option value={value}>{children}</option>
  );

  return {
    Button: ({ children, onClick, title, ...props }: any) => (
      <button onClick={onClick} title={title} {...props}>
        {children}
      </button>
    ),
    Icon: ({ type }: any) => <span data-testid={`icon-${type}`} />,
    Loading: ({ tip }: any) => <div data-testid="loading-spinner">{tip}</div>,
    Alert: ({ children, type }: any) => <div data-testid={`alert-${type}`}>{children}</div>,
    El: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    Card: ({ children }: any) => <div>{children}</div>,
    Dropdown: DropdownMock,
    Input: ({ onChange, value, placeholder }: any) => (
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data-testid="search-input"
      />
    ),
    Tag: ({ children, color }: any) => <span data-testid={`tag-${color}`}>{children}</span>,
  };
});

vi.mock('../../components/common/StatusTag', () => ({
  default: ({ status, region }: any) => (
    <span data-testid="status-tag">{`${status}-${region}`}</span>
  ),
}));

vi.mock('../../utils/format', () => ({
  formatDate: (val: string) => `Formatted: ${val}`,
}));

describe('CompletedInstructionsPage Component', () => {
  const mockInstructionsData = [
    {
      instructionId: 'inst-1',
      instructionRef: 'REF-101',
      dealName: 'Alpha Deal',
      clientName: 'Acme Corp',
      gfcid: 'GFC123',
      status: 'COMPLETE',
      region: 'LATAM',
      valueDate: '2026-08-01',
      createdBy: 'John Doe',
    },
    {
      instructionId: 'inst-2',
      instructionRef: 'REF-102',
      dealName: 'Beta Deal',
      clientName: 'Global Tech',
      gfcid: 'GFC456',
      status: 'PAYMENT_COMPLETED',
      region: 'EMEA',
      valueDate: '2026-08-02',
      createdBy: 'Jane Smith',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header and loads completed instructions on mount', async () => {
    (getInstructions as any).mockResolvedValue({
      data: { content: [mockInstructionsData[0]] },
    });

    render(<CompletedInstructionsPage />);

    expect(screen.getByText('Completed Instructions')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(getInstructions).toHaveBeenCalledWith({
      status: 'COMPLETE',
      page: 0,
      size: 20,
    });
    expect(getInstructions).toHaveBeenCalledWith({
      status: 'PAYMENT_COMPLETED',
      page: 0,
      size: 20,
    });
  });

  it('renders "No completed instructions found" when response is empty', async () => {
    (getInstructions as any).mockResolvedValue({
      data: { content: [] },
    });

    render(<CompletedInstructionsPage />);

    await waitFor(() => {
      expect(screen.getByText('No completed instructions found')).toBeInTheDocument();
    });
  });

  it('handles error when loading data fails', async () => {
    (getInstructions as any).mockRejectedValue(new Error('Network Error'));

    render(<CompletedInstructionsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger')).toBeInTheDocument();
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('filters grid rows based on search input matching instructionRef, dealName, or clientName', async () => {
    (getInstructions as any).mockImplementation(({ status }: any) => {
      if (status === 'COMPLETE') return Promise.resolve({ data: { content: [mockInstructionsData[0]] } });
      return Promise.resolve({ data: { content: [mockInstructionsData[1]] } });
    });

    render(<CompletedInstructionsPage />);

    await waitFor(() => {
      expect(screen.getByText('REF-101')).toBeInTheDocument();
      expect(screen.getByText('REF-102')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    await waitFor(() => {
      expect(screen.getByText('REF-101')).toBeInTheDocument();
      expect(screen.queryByText('REF-102')).not.toBeInTheDocument();
    });
  });

  it('filters data by region dropdown', async () => {
    (getInstructions as any).mockImplementation(({ status }: any) => {
      if (status === 'COMPLETE') return Promise.resolve({ data: { content: [mockInstructionsData[0]] } });
      return Promise.resolve({ data: { content: [mockInstructionsData[1]] } });
    });

    render(<CompletedInstructionsPage />);

    await waitFor(() => {
      expect(screen.getByText('REF-101')).toBeInTheDocument();
      expect(screen.getByText('REF-102')).toBeInTheDocument();
    });

    const regionDropdown = screen.getByRole('combobox', { name: 'All Regions' });
    fireEvent.change(regionDropdown, { target: { value: 'EMEA' } });

    await waitFor(() => {
      expect(screen.queryByText('REF-101')).not.toBeInTheDocument();
      expect(screen.getByText('REF-102')).toBeInTheDocument();
    });
  });

  it('navigates to instruction detail page on instructionRef link click', async () => {
    (getInstructions as any).mockResolvedValue({
      data: { content: [mockInstructionsData[0]] },
    });

    render(<CompletedInstructionsPage />);

    await waitFor(() => {
      expect(screen.getByText('REF-101')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('REF-101'));
    expect(mockNavigate).toHaveBeenCalledWith('/instructions/inst-1');
  });

  it('re-loads data when refresh button is clicked', async () => {
    (getInstructions as any).mockResolvedValue({
      data: { content: [] },
    });

    render(<CompletedInstructionsPage />);

    await waitFor(() => {
      expect(getInstructions).toHaveBeenCalledTimes(2);
    });

    const refreshBtn = screen.getByText('Refresh');
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(getInstructions).toHaveBeenCalledTimes(4);
    });
  });
});