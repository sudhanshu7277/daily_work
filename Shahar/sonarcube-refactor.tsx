// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit



// src/pages/maintenance/MaintenancePage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

// ---- API Mocks ----
const mockGetMaintenanceData = vi.fn();

vi.mock('../../api/maintenance', () => ({
  getMaintenanceData: (...a: unknown[]) => mockGetMaintenanceData(...a),
  getMaintenanceList: (...a: unknown[]) => mockGetMaintenanceData(...a),
}));

// ---- Design System & Ag-Grid Mock ----
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, type }: any) =>
      R.createElement('button', { onClick, title, disabled, type }, children),
    Alert: ({ children, type, message }: any) =>
      R.createElement('div', { role: 'alert', 'data-testid': `alert-${type || 'danger'}` }, children || message || 'Error loading data'),
    Loading: ({ tip }: any) =>
      R.createElement('div', { 'data-testid': 'loading' }, tip || 'Loading...'),
    Icon: ({ type, className }: any) =>
      R.createElement('i', { className: `icon-${type} ${className || ''}` }),
  };
});

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'ag-grid' },
      (rowData || []).map((row: any, i: number) =>
        React.createElement('div', { key: i, 'data-testid': 'grid-row' }, JSON.stringify(row))
      )
    ),
}));

import MaintenancePage from './MaintenancePage';

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

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockGetMaintenanceData).toHaveBeenCalledTimes(2);
    });
  });
});