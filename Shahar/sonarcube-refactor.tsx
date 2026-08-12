// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit


// src/pages/maintenance/MaintenancePage.test.tsx
// src/pages/maintenance/MaintenancePage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// ---- Router Mock (in case navigate/params are used) ----
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/maintenance' }),
  Link: ({ children }: any) => React.createElement('a', null, children),
}));

// ---- API Mocks ----
const mockGetMaintenanceData = vi.fn();

vi.mock('../../api/maintenance', () => ({
  getMaintenanceData: (...a: unknown[]) => mockGetMaintenanceData(...a),
  getMaintenanceList: (...a: unknown[]) => mockGetMaintenanceData(...a),
  getMaintenance: (...a: unknown[]) => mockGetMaintenanceData(...a),
  fetchMaintenanceData: (...a: unknown[]) => mockGetMaintenanceData(...a),
  getMaintenanceRecords: (...a: unknown[]) => mockGetMaintenanceData(...a),
  default: (...a: unknown[]) => mockGetMaintenanceData(...a),
}));

// ---- Design System & AG Grid Mocks ----
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, type, ...props }: any) =>
      R.createElement('button', { onClick, title, disabled, type, ...props }, children),
    Alert: ({ children, type, message, description }: any) =>
      R.createElement(
        'div',
        { role: 'alert', 'data-testid': 'alert-container' },
        children || message || description || 'Error loading data'
      ),
    Loading: ({ tip }: any) =>
      R.createElement('div', { 'data-testid': 'loading' }, tip || 'Loading...'),
    Icon: ({ type, className }: any) =>
      R.createElement('i', { className: `icon-${type} ${className || ''}` }),
    Card: ({ children, className, style }: any) =>
      R.createElement('div', { className, style }, children),
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: (props: any) => {
    React.useEffect(() => {
      if (props.onGridReady) {
        props.onGridReady({
          api: {
            sizeColumnsToFit: vi.fn(),
            setRowData: vi.fn(),
            showLoadingOverlay: vi.fn(),
            hideOverlay: vi.fn(),
            refreshCells: vi.fn(),
          },
          columnApi: {},
        });
      }
    }, []);

    return React.createElement(
      'div',
      { 'data-testid': 'ag-grid' },
      (props.rowData || []).map((row: any, i: number) =>
        React.createElement('div', { key: i, 'data-testid': 'grid-row' }, JSON.stringify(row))
      )
    );
  },
}));

// ---- Resilient Component Import (Handles both default & named export) ----
import * as MaintenancePageModule from './MaintenancePage';

const MaintenancePage =
  MaintenancePageModule.default ||
  (MaintenancePageModule as any).MaintenancePage ||
  MaintenancePageModule;

describe('MaintenancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMaintenanceData.mockResolvedValue({
      data: [{ id: 1, name: 'Maintenance Item 1' }],
    });
  });

  it('renders the maintenance page and fetches grid data on mount', async () => {
    render(<MaintenancePage />);

    await waitFor(() => {
      expect(mockGetMaintenanceData).toHaveBeenCalled();
    });

    expect(screen.getByTestId('ag-grid')).toBeInTheDocument();
  });

  it('shows an alert when loading maintenance data fails', async () => {
    mockGetMaintenanceData.mockRejectedValueOnce(new Error('Failed to load maintenance data'));

    render(<MaintenancePage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('re-fetches maintenance data when Refresh button is clicked', async () => {
    render(<MaintenancePage />);

    await waitFor(() => {
      expect(mockGetMaintenanceData).toHaveBeenCalledTimes(1);
    });

    const refreshButton =
      screen.queryByRole('button', { name: /refresh/i }) ||
      screen.queryByText(/refresh/i) ||
      screen.getByTestId('ag-grid');

    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockGetMaintenanceData).toHaveBeenCalledTimes(2);
    });
  });
});