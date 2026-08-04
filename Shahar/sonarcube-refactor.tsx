// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockGetInstructions = vi.fn();
vi.mock('../../api/instructions', () => ({
  getInstructions: (...args: unknown[]) => mockGetInstructions(...args),
}));

vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => (v ? `formatted:${v}` : ''),
}));

vi.mock('../../components/common/StatusTag', () => ({
  default: (p: any) =>
    React.createElement('span', { 'data-testid': 'status-tag', 'data-region': p.region }, p.status),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  const El = ({ children, className, style, tag }: any) =>
    R.createElement(tag || 'div', { className, style }, children);
  return {
    Card: Object.assign(
      (p: any) => R.createElement('div', null, p.children),
      { header: 'div' as any, body: 'div' as any },
    ),
    Button: (p: any) =>
      R.createElement('button', { onClick: p.onClick, disabled: p.disabled, title: p.title, type: p.type }, p.children),
    Icon: (p: any) => R.createElement('i', { 'data-testid': `icon-${p.type}` }),
    Input: (p: any) => {
      const { iconPrefix, allowClear, inputLabel, wrapperClass, ...rest } = p;
      return R.createElement('input', rest);
    },
    Loading: (p: any) => R.createElement('div', { 'data-testid': 'loading' }, p.tip),
    Alert: (p: any) => R.createElement('div', { 'data-testid': `alert-${p.type}` }, p.content || p.children),
    El,
    Dropdown: Object.assign(
      (p: any) =>
        R.createElement(
          'select',
          {
            value: p.value,
            onChange: (e: any) => p.onChange?.(e.target.value),
            'data-testid': p.placeholder,
            style: p.style,
          },
          p.children,
        ),
      { Item: (p: any) => R.createElement('option', { value: p.value }, p.children) },
    ),
    Tag: (p: any) => R.createElement('span', { 'data-testid': 'tag', 'data-color': p.color }, p.children),
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: (p: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'ag-grid' },
      React.createElement('div', { 'data-testid': 'row-count' }, String(p.rowData?.length ?? 0)),
      (p.rowData || []).map((row: any) =>
        React.createElement(
          'div',
          { key: row.key, 'data-testid': `row-${row.key}` },
          (p.columnDefs || []).map((col: any) =>
            React.createElement(
              'span',
              { key: col.headerName, 'data-testid': `cell-${row.key}-${col.headerName}` },
              col.cellRenderer
                ? col.cellRenderer({ value: row[col.field], data: row })
                : col.valueFormatter
                  ? col.valueFormatter({ value: row[col.field] })
                  : row[col.field],
            ),
          ),
        ),
      ),
    ),
}));

import CompletedInstructionsPage from './CompletedInstructionsPage';

const makeInstruction = (overrides: Partial<any> = {}) => ({
  instructionId: 1,
  instructionRef: 'REF-001',
  dealName: 'Deal Alpha',
  clientName: 'Acme Corp',
  gfcid: 'GFCID-1',
  status: 'COMPLETE',
  region: 'NAM',
  valueDate: '2026-01-15',
  createdBy: 'jdoe',
  ...overrides,
});

describe('CompletedInstructionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInstructions.mockResolvedValue({ data: { content: [] } });
  });

  it('test_shows_loading_then_renders_grid_with_data', async () => {
    mockGetInstructions.mockResolvedValue({
      data: { content: [makeInstruction()] },
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid')).toBeTruthy();
    });

    expect(screen.getByTestId('row-count').textContent).toBe('1');
  });

  it('test_loadData_merges_results_across_completed_statuses', async () => {
    mockGetInstructions.mockImplementation(({ status }: any) => {
      if (status === 'COMPLETE') {
        return Promise.resolve({ data: { content: [makeInstruction({ instructionId: 1, instructionRef: 'REF-1' })] } });
      }
      if (status === 'PAYMENT_COMPLETED') {
        return Promise.resolve({ data: { content: [makeInstruction({ instructionId: 2, instructionRef: 'REF-2', status: 'PAYMENT_COMPLETED' })] } });
      }
      return Promise.resolve({ data: { content: [] } });
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('2');
    });
  });

  it('test_loadData_skips_status_when_individual_fetch_fails', async () => {
    mockGetInstructions.mockImplementation(({ status }: any) => {
      if (status === 'COMPLETE') {
        return Promise.reject(new Error('boom'));
      }
      return Promise.resolve({ data: { content: [makeInstruction({ instructionId: 2 })] } });
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('1');
    });
    expect(screen.queryByTestId('alert-danger')).toBeNull();
  });

  it('test_shows_error_alert_when_outer_loadData_throws', async () => {
    mockGetInstructions.mockRejectedValue(new Error('Network down'));

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('alert-danger').textContent).toContain('Network down');
    });
  });

  it('test_shows_empty_state_when_no_completed_instructions', async () => {
    mockGetInstructions.mockResolvedValue({ data: { content: [] } });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('No completed instructions found')).toBeTruthy();
    });
  });

  it('test_region_filter_excludes_non_matching_rows', async () => {
    mockGetInstructions.mockResolvedValue({
      data: {
        content: [
          makeInstruction({ instructionId: 1, region: 'NAM' }),
          makeInstruction({ instructionId: 2, region: 'EMEA' }),
        ],
      },
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('2');
    });

    const regionDropdown = screen.getByTestId('All Regions');
    await act(async () => {
      fireEvent.change(regionDropdown, { target: { value: 'EMEA' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('1');
    });
  });

  it('test_search_term_filters_by_ref_deal_or_client', async () => {
    mockGetInstructions.mockResolvedValue({
      data: {
        content: [
          makeInstruction({ instructionId: 1, instructionRef: 'REF-AAA', dealName: 'Zeta', clientName: 'Foo' }),
          makeInstruction({ instructionId: 2, instructionRef: 'REF-BBB', dealName: 'Omega', clientName: 'Bar' }),
        ],
      },
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('2');
    });

    const searchInput = screen.getByPlaceholderText('Search by ref, deal, client...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'zeta' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('1');
    });
  });

  it('test_status_filter_change_resets_page_and_refetches', async () => {
    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(mockGetInstructions).toHaveBeenCalled();
    });
    mockGetInstructions.mockClear();

    const statusDropdown = screen.getByTestId('All Completed');
    await act(async () => {
      fireEvent.change(statusDropdown, { target: { value: 'PAYMENT_COMPLETED' } });
    });

    await waitFor(() => {
      expect(mockGetInstructions).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PAYMENT_COMPLETED', page: 0 }),
      );
    });
  });

  it('test_refresh_button_calls_loadData_again', async () => {
    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(mockGetInstructions).toHaveBeenCalled();
    });
    const callsBefore = mockGetInstructions.mock.calls.length;

    const refreshButton = screen.getByText('Refresh').closest('button')!;
    await act(async () => {
      fireEvent.click(refreshButton);
    });

    await waitFor(() => {
      expect(mockGetInstructions.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('test_sequence_no_cell_navigates_on_click', async () => {
    mockGetInstructions.mockResolvedValue({
      data: { content: [makeInstruction({ instructionId: 77, instructionRef: 'REF-77' })] },
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('1');
    });

    const link = screen.getByText('REF-77');
    await act(async () => {
      fireEvent.click(link);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/instructions/77');
  });

  it('test_client_cell_shows_gfcid_when_present_and_hides_when_absent', async () => {
    mockGetInstructions.mockResolvedValue({
      data: {
        content: [
          makeInstruction({ instructionId: 1, clientName: 'WithGfcid', gfcid: 'GF-1' }),
          makeInstruction({ instructionId: 2, clientName: 'NoGfcid', gfcid: undefined }),
        ],
      },
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('WithGfcid')).toBeTruthy();
    });

    expect(screen.getByText('GF-1')).toBeTruthy();
    expect(screen.getByText('NoGfcid')).toBeTruthy();
  });

  it('test_region_cell_renders_tag_when_present_and_dash_when_absent', async () => {
    mockGetInstructions.mockResolvedValue({
      data: {
        content: [
          makeInstruction({ instructionId: 1, region: 'APAC' }),
          makeInstruction({ instructionId: 2, region: undefined }),
        ],
      },
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('row-count').textContent).toBe('2');
    });

    expect(screen.getByText('APAC')).toBeTruthy();
    expect(screen.getByText('-')).toBeTruthy();
  });

  it('test_value_date_cell_uses_formatDate', async () => {
    mockGetInstructions.mockResolvedValue({
      data: { content: [makeInstruction({ instructionId: 1, valueDate: '2026-03-01' })] },
    });

    await act(async () => {
      render(<CompletedInstructionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('formatted:2026-03-01')).toBeTruthy();
    });
  });
});