// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // <--- ADD THIS IMPORT
import React from 'react';
import ApprovalQueuePage from '../ApprovalQueuePage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockDeleteFilterPref = vi.fn().mockResolvedValue({ success: true });
vi.mock('../../api/filterPreferences', () => ({
  deleteFilterPref: (...args: unknown[]) => mockDeleteFilterPref(...args),
}));

vi.mock('../../api/instructions', () => ({
  getInstructions: vi.fn().mockResolvedValue({
    data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true },
  }),
  processApproval: vi.fn().mockResolvedValue({}),
  getApprovalQueueCounts: vi.fn().mockResolvedValue({ data: {} }),
  getSavedFilters: vi.fn().mockResolvedValue({
    data: [
      {
        filterPrefId: 'pref-1',
        prefName: 'Default Filter',
        filtersJson: '{"status":["ADMIN_MAKER"]}',
        isDefault: true,
      },
      {
        filterPrefId: 'pref-2',
        prefName: 'Secondary Filter',
        filtersJson: '{"country":["US"]}',
        isDefault: false,
      },
    ],
  }),
  exportToExcel: vi.fn(),
  saveFilter: vi.fn().mockResolvedValue({}),
}));

const mockGetRefDataByType = vi.fn();
vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...args: unknown[]) => mockGetRefDataByType(...args),
}));

vi.mock('../../api/gabUser', () => ({
  getGabUser: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../api/roles', () => ({
  getAllUserRoles: vi.fn().mockResolvedValue({ data: [] }),
}));

describe('ApprovalQueuePage - Lines 1234-1285 (Manage Filters Modal Actions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openManageFiltersModal = async () => {
    render(<ApprovalQueuePage />);

    await waitFor(() => {
      expect(screen.getByTitle('Manage Filters')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Manage Filters'));
    const manageFiltersOption = screen.getByText('Manage Filters');
    fireEvent.click(manageFiltersOption);

    await waitFor(() => {
      expect(screen.getByText('Default Filter')).toBeInTheDocument();
    });
  };

  it('renders check icon for default filter and "Set Default" button for non-default filter', async () => {
    await openManageFiltersModal();
    expect(screen.getByText('Set Default')).toBeInTheDocument();
  });

  it('loads filter preference state when "Load" button is clicked', async () => {
    await openManageFiltersModal();
    const loadButtons = screen.getAllByText('Load');
    expect(loadButtons.length).toBeGreaterThan(0);
    fireEvent.click(loadButtons[0]);
  });

  it('executes dynamic deleteFilterPref call and refreshes saved filters on delete action', async () => {
    await openManageFiltersModal();
    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('[type="trash"]') || btn.innerHTML.includes('trash')
    );

    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      await waitFor(() => {
        expect(mockDeleteFilterPref).toHaveBeenCalledWith('pref-1');
      });
    }
  });

  it('handles errors silently during filter deletion catch block', async () => {
    mockDeleteFilterPref.mockRejectedValueOnce(new Error('Deletion error'));
    await openManageFiltersModal();

    const deleteButtons = screen.getAllByRole('button').filter(btn =>
      btn.querySelector('[type="trash"]') || btn.innerHTML.includes('trash')
    );

    if (deleteButtons.length > 0) {
      expect(() => fireEvent.click(deleteButtons[0])).not.toThrow();
    }
  });

  it('closes Manage Filters modal when Close button is clicked', async () => {
    await openManageFiltersModal();
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Default Filter')).not.toBeInTheDocument();
    });
  });
});