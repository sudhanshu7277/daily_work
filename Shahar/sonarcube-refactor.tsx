// cmd to run tests locally

npx vitest run --coverage



// src/components/common/FilterPresetBar.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { FilterPresetBar } from './FilterPresetBar';

// --- Mocks ---

const mockListFilterPrefs = vi.fn();
const mockSaveFilterPref = vi.fn();
const mockDeleteFilterPref = vi.fn();

vi.mock('../../api/filterPreferences', () => ({
  listFilterPrefs: (...args: unknown[]) => mockListFilterPrefs(...args),
  saveFilterPref: (...args: unknown[]) => mockSaveFilterPref(...args),
  deleteFilterPref: (...args: unknown[]) => mockDeleteFilterPref(...args),
}));

// Mock custom UI components library cleanly
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, ...rest }: any) => R.createElement('div', rest, children),
    Input: ({ value, onChange, placeholder, disabled, ...rest }: any) =>
      R.createElement('input', {
        value: value ?? '',
        placeholder,
        disabled,
        onChange: (e: any) => {
          if (onChange) onChange(e);
        },
        ...rest,
      }),
    Button: ({ children, onClick, disabled, ...rest }: any) =>
      R.createElement('button', { onClick, disabled, ...rest }, children),
    Dropdown: Object.assign(
      ({ children, onChange, value, placeholder }: any) =>
        R.createElement(
          'div',
          { 'data-testid': 'dropdown', 'data-value': value ?? '' },
          R.createElement('span', null, placeholder),
          children,
          R.createElement(
            'button',
            {
              'data-testid': 'apply-num',
              onClick: () => {
                if (onChange) onChange(2);
              },
            },
            'apply-num'
          ),
          R.createElement(
            'button',
            {
              'data-testid': 'apply-str',
              onClick: () => {
                if (onChange) onChange('1');
              },
            },
            'apply-str'
          ),
          R.createElement(
            'button',
            {
              'data-testid': 'apply-nan',
              onClick: () => {
                if (onChange) onChange('abc');
              },
            },
            'apply-nan'
          )
        ),
      {
        Item: ({ children, value }: any) =>
          R.createElement('div', { 'data-testid': `option-${value}` }, children),
      }
    ),
  };
});

const PAGE_KEY = 'instructions';

const prefDefault = {
  filterPrefId: 1,
  prefName: 'My default view',
  filtersJson: JSON.stringify({ status: 'OPEN' }),
  isDefault: true,
};

const prefOther = {
  filterPrefId: 2,
  prefName: 'Second view',
  filtersJson: JSON.stringify({ status: 'CLOSED' }),
  isDefault: false,
};

function renderBar(overrides: Partial<Record<string, unknown>> = {}) {
  const onApply = vi.fn();
  const currentFilters = { status: 'PENDING' };

  render(
    <FilterPresetBar
      pageKey={PAGE_KEY}
      currentFilters={currentFilters}
      onApply={onApply}
      {...(overrides as any)}
    />
  );

  return { onApply, currentFilters };
}

describe('FilterPresetBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListFilterPrefs.mockResolvedValue({ data: [prefDefault, prefOther] });
    mockSaveFilterPref.mockResolvedValue({ data: { success: true } });
    mockDeleteFilterPref.mockResolvedValue({ data: { success: true } });
  });

  it('loads prefs on mount and renders an item per saved view', async () => {
    renderBar();

    await waitFor(() => {
      expect(mockListFilterPrefs).toHaveBeenCalledWith(PAGE_KEY);
    });

    expect(screen.getByTestId('option-1').textContent).toContain('My default view (default)');
    expect(screen.getByTestId('option-2').textContent).toBe('Second view');
  });

  it('auto-applies the default pref (deserialized) on mount', async () => {
    const { onApply } = renderBar();

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith({ status: 'OPEN' });
    });
  });

  it('tolerates a missing data field (res.data ?? [])', async () => {
    mockListFilterPrefs.mockResolvedValue({});

    const { onApply } = renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalled());

    expect(screen.queryByTestId('option-1')).toBeNull();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('applies the matching pref when a view is selected', async () => {
    const { onApply } = renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalled());

    onApply.mockClear();

    fireEvent.click(screen.getByTestId('apply-num'));

    expect(onApply).toHaveBeenCalledWith({ status: 'CLOSED' });
  });

  it('coerces a numeric-string selection via Number()', async () => {
    const { onApply } = renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalled());

    onApply.mockClear();

    fireEvent.click(screen.getByTestId('apply-str'));

    expect(onApply).toHaveBeenCalledWith({ status: 'OPEN' });
  });

  it('ignores a non-numeric selection (early return)', async () => {
    const { onApply } = renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalled());

    onApply.mockClear();

    fireEvent.click(screen.getByTestId('apply-nan'));

    expect(onApply).not.toHaveBeenCalled();
  });

  it('does not save when the view name is blank', async () => {
    renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalled());

    const saveBtn = screen.getByText('Save view');
    fireEvent.click(saveBtn);

    expect(mockSaveFilterPref).not.toHaveBeenCalled();
  });

  it('saves a new view with serialized current filters, then reloads', async () => {
    renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalledWith(PAGE_KEY));

    const input = screen.getByPlaceholderText('View name');
    fireEvent.change(input, { target: { value: 'New view' } });

    const saveBtn = screen.getByText('Save view');
    fireEvent.click(saveBtn);

    // Flush microtasks so the save promise resolves and calls listFilterPrefs
    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockSaveFilterPref).toHaveBeenCalled();
      expect(mockListFilterPrefs).toHaveBeenCalledTimes(2);
    });
  });

  it('disables Delete until a pref is selected, then deletes and reloads', async () => {
    renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalledWith(PAGE_KEY));

    const deleteBtn = screen.getByText('Delete') as HTMLButtonElement;
    expect(deleteBtn.disabled).toBe(true);

    fireEvent.click(screen.getByTestId('apply-num'));

    expect((screen.getByText('Delete') as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(screen.getByText('Delete'));

    // Flush microtasks so the delete promise resolves and calls listFilterPrefs
    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockDeleteFilterPref).toHaveBeenCalledWith(2);
      expect(mockListFilterPrefs).toHaveBeenCalledTimes(2);
    });
  });
});