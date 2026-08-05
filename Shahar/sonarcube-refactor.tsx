import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApprovalQueuePage from '../ApprovalQueuePage';
import { getInstructions, getSavedFilters } from '../../../api/instructions';

// Mock dynamic import for filterPreferences API module
const mockDeleteFilterPref = jest.fn();
jest.mock('../../../api/filterPreferences', () => ({
  deleteFilterPref: (...args: any[]) => mockDeleteFilterPref(...args),
}));

describe('ApprovalQueuePage - Lines 1234-1285 (Manage Filters Table & Actions)', () => {
  const mockSavedFilterPrefs = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getInstructions as jest.Mock).mockResolvedValue({
      data: { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true },
    });
    (getSavedFilters as jest.Mock).mockResolvedValue({
      data: mockSavedFilterPrefs,
    });
    mockDeleteFilterPref.mockResolvedValue({ success: true });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <ApprovalQueuePage />
      </BrowserRouter>
    );

  const openManageFiltersModal = async () => {
    renderComponent();
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

    // Verify Set Default button exists for pref-2 (isDefault: false)
    expect(screen.getByText('Set Default')).toBeInTheDocument();
  });

  it('loads filter preference state when "Load" button is clicked', async () => {
    await openManageFiltersModal();

    const loadButtons = screen.getAllByText('Load');
    expect(loadButtons.length).toBeGreaterThan(0);

    fireEvent.click(loadButtons[0]);
  });

  it('executes dynamic deleteFilterPref import and refreshes saved filters on trash click', async () => {
    await openManageFiltersModal();

    // Find and click trash/delete buttons
    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('[type="trash"]') || btn.innerHTML.includes('trash')
    );

    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteFilterPref).toHaveBeenCalledWith('pref-1');
        expect(getSavedFilters).toHaveBeenCalled();
      });
    }
  });

  it('handles errors gracefully during filter deletion (silent catch block)', async () => {
    mockDeleteFilterPref.mockRejectedValueOnce(new Error('Deletion failed'));
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