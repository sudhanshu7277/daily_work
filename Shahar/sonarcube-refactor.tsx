// @vitest-environment jsdom
/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DashboardPage from './DashboardPage';

// ─── react-router-dom ────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...rest }: any) =>
      React.createElement('a', { href: typeof to === 'string' ? to : '#', ...rest }, children),
  };
});

// ─── icgds-react component library ───────────────────────────────────────────
vi.mock('@citi-icg-172888/icgds-react', () => {
  const El = ({ children, tag = 'div', ...rest }: any) =>
    React.createElement(tag, rest, children);
  const Card: any = ({ children, ...rest }: any) => React.createElement('div', rest, children);
  Card.header = ({ children, ...rest }: any) => React.createElement('div', rest, children);
  Card.body = ({ children, ...rest }: any) => React.createElement('div', rest, children);
  const Icon = ({ type, ...rest }: any) =>
    React.createElement('span', { 'data-testid': `icon-${type}`, ...rest });
  const Button = ({ children, onClick, disabled, title, ...rest }: any) =>
    React.createElement(
      'button',
      { onClick, disabled, title, ...rest },
      children
    );
  const Loading = ({ tip }: any) => React.createElement('div', { role: 'status' }, tip);
  const Alert = ({ children, type, ...rest }: any) =>
    React.createElement('div', { role: 'alert', 'data-type': type, ...rest }, children);
  const Input = ({ value, onChange, placeholder, ...rest }: any) =>
    React.createElement('input', {
      value,
      onChange,
      placeholder,
      ...rest,
    });
  const DropdownItem = ({ children, value, ...rest }: any) =>
    React.createElement('option', { value, ...rest }, children);
  const Dropdown: any = ({ children, value, onChange, placeholder, disabled, dropdownRender, ...rest }: any) => {
    const optionsList = React.createElement(
      'select',
      {
        'aria-label': placeholder || 'dropdown',
        value: Array.isArray(value) ? value : value ?? '',
        multiple: rest.multiple,
        disabled,
        onChange: (e: any) => {
          if (rest.multiple) {
            const opts = Array.from(e.target.selectedOptions).map((o: any) => o.value);
            onChange?.(opts);
          } else {
            onChange?.(e.target.value);
          }
        },
      },
      children
    );
    if (dropdownRender) {
      return React.createElement('div', null, dropdownRender(optionsList));
    }
    return optionsList;
  };
  Dropdown.Item = DropdownItem;
  const DatePicker = ({ value, onValueChange, ...rest }: any) =>
    React.createElement('input', {
      'aria-label': rest['aria-label'] || 'date-picker',
      type: 'date',
      value: value ? new Date(value).toISOString().slice(0, 10) : '',
      onChange: (e: any) => onValueChange?.(e.target.value ? new Date(e.target.value) : undefined),
    });
  const RangePicker = ({ value, onValueChange, ...rest }: any) =>
    React.createElement('input', {
      'aria-label': rest['aria-label'] || 'range-picker',
      type: 'text',
      value: value ? value.map((d: Date) => d?.toISOString?.().slice(0, 10)).join(',') : '',
      onChange: () => {},
    });
  const Modal = ({ visible, title, children, onCancel, onApply, applyText, disabled }: any) =>
    visible
      ? React.createElement(
          'div',
          { role: 'dialog', 'aria-label': title },
          children,
          onApply &&
            React.createElement(
              'button',
              { onClick: onApply, disabled },
              applyText || 'Apply'
            ),
          React.createElement('button', { onClick: onCancel }, 'Cancel')
        )
      : null;
  const notification = {
    success: vi.fn(),
    danger: vi.fn(),
  };
  return { El, Card, Icon, Button, Loading, Alert, Input, Dropdown, DatePicker, RangePicker, Modal, notification };
});

// ─── ag-grid ──────────────────────────────────────────────────────────────────
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'ag-grid', 'data-rowcount': (rowData ?? []).length },
      (rowData ?? []).map((r: any, i: number) =>
        React.createElement('div', { key: i, 'data-testid': 'ag-grid-row' }, JSON.stringify(r))
      )
    ),
}));
vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-theme-quartz.css', () => ({}));

// ─── DashboardPage.css ────────────────────────────────────────────────────────
vi.mock('./DashboardPage.css', () => ({}));

// ─── API mocks ────────────────────────────────────────────────────────────────
vi.mock('../../api/instructions', () => ({
  getDashboardCounts: vi.fn(),
  getOverdueInstructions: vi.fn(),
  getCallbackCounts: vi.fn(),
  getSignatureCounts: vi.fn(),
  getInstructions: vi.fn(),
}));
vi.mock('../../api/awsTicklerSync', () => ({
  getSyncHistory: vi.fn(),
}));
vi.mock('../../api/refdata', () => ({
  getRefDataByType: vi.fn(),
}));
vi.mock('../../api/filterPreferences', () => ({
  listFilterPrefs: vi.fn(),
  saveFilterPref: vi.fn(),
  deleteFilterPref: vi.fn(),
}));
vi.mock('../../api/gabUser', () => ({
  getGabUser: vi.fn(),
}));
vi.mock('../../components/common/StatusTag', () => ({
  default: ({ status }: any) => React.createElement('span', { 'data-testid': 'status-tag' }, status),
}));
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../../utils/format', () => ({
  formatDate: (d: any) => (d ? String(d) : ''),
  toLocalDateString: (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : undefined),
}));
vi.mock('./InstructionsReportPage', () => ({
  default: ({ year, month }: any) =>
    React.createElement('div', { 'data-testid': 'instructions-report-page' }, `${year}-${month}`),
}));

import { getDashboardCounts, getOverdueInstructions, getCallbackCounts, getSignatureCounts, getInstructions } from '../../api/instructions';
import { getSyncHistory } from '../../api/awsTicklerSync';
import { getRefDataByType } from '../../api/refdata';
import { listFilterPrefs, saveFilterPref, deleteFilterPref } from '../../api/filterPreferences';
import { getGabUser } from '../../api/gabUser';
import { useAuth } from '../../context/AuthContext';

const mocked = <T extends (...args: any[]) => any>(fn: T) => fn as unknown as ReturnType<typeof vi.fn>;

const sampleInstruction = (overrides: any = {}) => ({
  instructionId: 'i1',
  instructionRef: 'REF-1',
  instructionSourceDisplay: 'Email',
  category: 'Payments',
  clientName: 'Acme Corp',
  gfcid: 'GFC1',
  countryDisplay: 'United States',
  country: 'US',
  valueDate: '2026-08-01',
  dueDate: '2026-07-20',
  primaryAssignee: 'JDOE',
  backupAssignee: 'ASMITH',
  modifiedBy: 'JDOE',
  status: 'ADMIN_MAKER',
  region: 'NAM',
  senderEmail: 'sender@example.com',
  ...overrides,
});

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  mocked(useAuth).mockReturnValue({ region: 'NAM' });

  mocked(getDashboardCounts).mockResolvedValue({ data: { ADMIN_MAKER: 5, ADMIN_CHECKER: 2, COMPLETE: 3 } });
  mocked(getCallbackCounts).mockResolvedValue({ data: { total: 4, pending: 1 } });
  mocked(getSignatureCounts).mockResolvedValue({ data: { total: 6, pending: 2 } });
  mocked(getOverdueInstructions).mockResolvedValue({ data: [sampleInstruction()] });
  mocked(getSyncHistory).mockResolvedValue({ data: [] });
  mocked(getRefDataByType).mockResolvedValue({ data: [{ refCode: 'US', refValue: 'United States' }] });
  mocked(getInstructions).mockResolvedValue({ data: { content: [sampleInstruction()], last: true } });
  mocked(listFilterPrefs).mockResolvedValue({ data: [] });
  mocked(saveFilterPref).mockResolvedValue({});
  mocked(deleteFilterPref).mockResolvedValue({});
  mocked(getGabUser).mockResolvedValue({ firstName: 'Jane', lastName: 'Doe' });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DashboardPage', () => {
  // ── Loading / error / mount ────────────────────────────────────────────────
  it('shows the loading state before data resolves', () => {
    renderPage();
    expect(screen.getByRole('status')).toHaveTextContent('Loading dashboard...');
  });

  it('renders the dashboard once data loads', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(getDashboardCounts).toHaveBeenCalled();
    expect(getCallbackCounts).toHaveBeenCalled();
    expect(getSignatureCounts).toHaveBeenCalled();
    expect(getOverdueInstructions).toHaveBeenCalled();
  });

  it('shows an error alert when loadData rejects', async () => {
    mocked(getDashboardCounts).mockRejectedValueOnce(new Error('boom'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('boom'));
  });

  it('shows a generic error message for non-Error rejections', async () => {
    mocked(getDashboardCounts).mockRejectedValueOnce('nope');
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load dashboard')
    );
  });

  it('does not crash when mounted', async () => {
    expect(() => renderPage()).not.toThrow();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  // ── Sub-tabs ────────────────────────────────────────────────────────────────
  it('switches to the Report sub-tab and renders InstructionsReportPage', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByText('INSTRUCTIONS REPORT'));
    expect(screen.getByTestId('instructions-report-page')).toBeInTheDocument();
  });

  it('switches back to the Dashboard sub-tab', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByText('INSTRUCTIONS REPORT'));
    fireEvent.click(screen.getByText('INSTRUCTIONS DASHBOARD'));
    expect(screen.queryByTestId('instructions-report-page')).not.toBeInTheDocument();
  });

  // ── Date range validation ──────────────────────────────────────────────────
  it('shows a date range warning when From is after To', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    const dateInputs = screen.getAllByLabelText(/date-picker/i);
    fireEvent.change(dateInputs[0], { target: { value: '2026-12-31' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-01-01' } });
    await waitFor(() =>
      expect(screen.getByText(/From date cannot be after To date/i)).toBeInTheDocument()
    );
  });

  // ── Bar chart drill-down ────────────────────────────────────────────────────
  it('drills down into a status bar and shows the AG Grid', async () => {
    mocked(getInstructions).mockResolvedValue({
      data: { content: [sampleInstruction({ status: 'ADMIN_MAKER' })], last: true },
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    // Baseline includes the always-present overdue-table grid.
    const baseline = screen.getAllByTestId('ag-grid').length;
    const bars = screen.getAllByText('Admin Maker');
    fireEvent.click(bars[0]);
    await waitFor(() => expect(getInstructions).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getAllByTestId('ag-grid').length).toBeGreaterThan(baseline)
    );
    expect(screen.getAllByTitle('Back to chart').length).toBeGreaterThan(0);
  });

  it('returns from a status drill-down back to the chart', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    const baseline = screen.getAllByTestId('ag-grid').length;
    const bars = screen.getAllByText('Admin Maker');
    fireEvent.click(bars[0]);
    await waitFor(() =>
      expect(screen.getAllByTestId('ag-grid').length).toBeGreaterThan(baseline)
    );
    const backButtons = screen.getAllByTitle('Back to chart');
    fireEvent.click(backButtons[0]);
    // Back to baseline (the overdue table grid persists; the drill-down grid unmounts).
    await waitFor(() => expect(screen.getAllByTestId('ag-grid').length).toBe(baseline));
    expect(screen.queryAllByTitle('Back to chart').length).toBe(0);
  });

  // ── Overdue table ────────────────────────────────────────────────────────────
  it('renders overdue instructions in the AG Grid', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByText(/Overdue Instruction/i)).toBeInTheDocument();
  });

  it('shows the empty state when there are no overdue instructions', async () => {
    mocked(getOverdueInstructions).mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByText('No overdue instructions')).toBeInTheDocument();
  });

  it('filters overdue instructions by the search box', async () => {
    mocked(getOverdueInstructions).mockResolvedValue({
      data: [
        sampleInstruction({ instructionId: 'a', instructionRef: 'FOO-1', clientName: 'Acme' }),
        sampleInstruction({ instructionId: 'b', instructionRef: 'BAR-1', clientName: 'Beta' }),
      ],
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    const searchInput = screen.getByPlaceholderText('Search within filters...');
    fireEvent.change(searchInput, { target: { value: 'foo' } });
    await waitFor(() => {
      const grid = screen.getByTestId('ag-grid');
      expect(grid.getAttribute('data-rowcount')).toBe('1');
    });
  });

  it('clears overdue filters with the clear-filters action', async () => {
    mocked(getOverdueInstructions).mockResolvedValue({
      data: [sampleInstruction({ instructionRef: 'FOO-1' })],
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    const searchInput = screen.getByPlaceholderText('Search within filters...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'foo' } });
    expect(searchInput.value).toBe('foo');

    // First click just opens the filter panel (button reads "More Filters" while closed).
    fireEvent.click(screen.getByText('More Filters'));
    await screen.findByText('Hide Filters');

    // Second click, now that the panel is open, actually clears the filters and closes it.
    fireEvent.click(screen.getByText('Hide Filters'));
    await waitFor(() => expect(searchInput.value).toBe(''));
    expect(screen.getByText('More Filters')).toBeInTheDocument();
  });

  // ── Export ───────────────────────────────────────────────────────────────────
  it('triggers a CSV export via the Export button', async () => {
    const realCreateElement = document.createElement.bind(document);
    const clickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreateElement(tag);
      if (tag === 'a') {
        (el as any).click = clickSpy;
      }
      return el;
    });
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();

    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Export to CSV'));
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    createElementSpy.mockRestore();
  });

  it('does not export when there are no overdue rows', async () => {
    mocked(getOverdueInstructions).mockResolvedValue({ data: [] });
    global.URL.createObjectURL = vi.fn();
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Export to CSV'));
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  // ── Refresh ──────────────────────────────────────────────────────────────────
  it('refreshes both dashboard and overdue data on Refresh click', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    (getDashboardCounts as any).mockClear();
    (getOverdueInstructions as any).mockClear();
    fireEvent.click(screen.getByTitle('Refresh data'));
    await waitFor(() => {
      expect(getDashboardCounts).toHaveBeenCalled();
      expect(getOverdueInstructions).toHaveBeenCalled();
    });
  });

  // ── Save / Manage overdue filters ───────────────────────────────────────────
  it('opens the Save Filter As modal and saves a new filter', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Save Filter As'));
    const dialog = await screen.findByRole('dialog', { name: 'Save Overdue Filters' });
    const nameInput = within(dialog).getByPlaceholderText(/Enter filter name/i);
    fireEvent.change(nameInput, { target: { value: 'My Filter' } });
    fireEvent.click(within(dialog).getByText('Save'));
    await waitFor(() => expect(saveFilterPref).toHaveBeenCalled());
  });

  it('disables Save when the filter name is empty', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Save Filter As'));
    const dialog = await screen.findByRole('dialog', { name: 'Save Overdue Filters' });
    expect(within(dialog).getByText('Save')).toBeDisabled();
  });

  it('opens the Manage Filters modal and shows saved filters', async () => {
    mocked(listFilterPrefs).mockResolvedValue({
      data: [
        {
          filterPrefId: 1,
          pageKey: 'dashboardOverdue',
          prefName: 'Saved One',
          filtersJson: JSON.stringify({ overdueSearch: 'x' }),
          isDefault: false,
        },
      ],
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Manage Filters'));
    const dialog = await screen.findByRole('dialog', { name: 'Manage Overdue Filters' });
    expect(within(dialog).getByText('Saved One')).toBeInTheDocument();
  });

  it('shows the empty state in Manage Filters when none are saved', async () => {
    mocked(listFilterPrefs).mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Manage Filters'));
    const dialog = await screen.findByRole('dialog', { name: 'Manage Overdue Filters' });
    expect(within(dialog).getByText('No saved filters found.')).toBeInTheDocument();
  });

  it('loads a saved filter from the Manage Filters table', async () => {
    mocked(listFilterPrefs).mockResolvedValue({
      data: [
        {
          filterPrefId: 2,
          pageKey: 'dashboardOverdue',
          prefName: 'Loadable',
          filtersJson: JSON.stringify({ overdueSearch: 'abc' }),
          isDefault: false,
        },
      ],
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Manage Filters'));
    const dialog = await screen.findByRole('dialog', { name: 'Manage Overdue Filters' });
    fireEvent.click(within(dialog).getByText('Load'));
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search within filters...') as HTMLInputElement;
      expect(searchInput.value).toBe('abc');
    });
  });

  it('sets a saved filter as default', async () => {
    mocked(listFilterPrefs).mockResolvedValue({
      data: [
        {
          filterPrefId: 3,
          pageKey: 'dashboardOverdue',
          prefName: 'ToDefault',
          filtersJson: JSON.stringify({}),
          isDefault: false,
        },
      ],
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Manage Filters'));
    const dialog = await screen.findByRole('dialog', { name: 'Manage Overdue Filters' });
    fireEvent.click(within(dialog).getByText('Set Default'));
    await waitFor(() => expect(saveFilterPref).toHaveBeenCalledWith(
      expect.objectContaining({ isDefault: true })
    ));
  });

  it('deletes a saved filter', async () => {
    mocked(listFilterPrefs).mockResolvedValue({
      data: [
        {
          filterPrefId: 4,
          pageKey: 'dashboardOverdue',
          prefName: 'ToDelete',
          filtersJson: JSON.stringify({}),
          isDefault: false,
        },
      ],
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Manage Filters'));
    const dialog = await screen.findByRole('dialog', { name: 'Manage Overdue Filters' });
    fireEvent.click(within(dialog).getByTestId('icon-trash'));
    await waitFor(() => expect(deleteFilterPref).toHaveBeenCalledWith(4));
  });

  it('closes the Manage Filters modal', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Manage Filters'));
    fireEvent.click(screen.getByText('Manage Filters'));
    const dialog = await screen.findByRole('dialog', { name: 'Manage Overdue Filters' });
    fireEvent.click(within(dialog).getByText('Close'));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Manage Overdue Filters' })).not.toBeInTheDocument()
    );
  });

  // ── User resolution ──────────────────────────────────────────────────────────
  it('resolves assignee SOEIDs to display names', async () => {
    mocked(getOverdueInstructions).mockResolvedValue({
      data: [sampleInstruction({ primaryAssignee: 'JDOE' })],
    });
    mocked(getGabUser).mockResolvedValue({ firstName: 'Jane', lastName: 'Doe' });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    await waitFor(() => expect(getGabUser).toHaveBeenCalledWith('JDOE'));
  });

  it('does not call getGabUser for SYSTEM or empty assignees', async () => {
    mocked(getOverdueInstructions).mockResolvedValue({
      data: [sampleInstruction({ primaryAssignee: 'SYSTEM', backupAssignee: '', modifiedBy: undefined })],
    });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(getGabUser).not.toHaveBeenCalledWith('SYSTEM');
  });

  // ── Region filter ────────────────────────────────────────────────────────────
  it('defaults the region filter to the authenticated user region and disables it', async () => {
    mocked(useAuth).mockReturnValue({ region: 'EMEA' });
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    const regionSelect = screen.getByLabelText('EMEA') as HTMLSelectElement;
    expect(regionSelect).toBeDisabled();
  });

  // ── Country refdata ──────────────────────────────────────────────────────────
  it('falls back to an empty country list when refdata fails', async () => {
    mocked(getRefDataByType).mockRejectedValue(new Error('fail'));
    renderPage();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    // No throw means the catch branch handled it
    expect(getRefDataByType).toHaveBeenCalledWith('COUNTRY');
  });
});