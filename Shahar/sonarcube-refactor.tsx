// cmd to run tests locally

npx vitest run --coverage

// src/components/common/FilterPresetBar.test.tsx
// src/components/common/FilterPresetBar.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FilterPresetBar } from './FilterPresetBar';

const mockListFilterPrefs = vi.fn();
const mockSaveFilterPref = vi.fn();
const mockDeleteFilterPref = vi.fn();

vi.mock('../../api/filterPreferences', () => ({
  listFilterPrefs: (...args: unknown[]) => mockListFilterPrefs(...args),
  saveFilterPref: (...args: unknown[]) => mockSaveFilterPref(...args),
  deleteFilterPref: (...args: unknown[]) => mockDeleteFilterPref(...args),
}));

// Design-system mock (mirrors SearchableMultiSelect.test.tsx).
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, ...rest }: any) => R.createElement('div', rest, children),
    Input: ({ value, onChange, placeholder, ...rest }: any) =>
      R.createElement('input', {
        value,
        onChange: (e: any) => {
          if (onChange) {
            onChange(e);
            if (e?.target?.value !== undefined) {
              onChange(e.target.value);
            }
          }
        },
        placeholder,
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
            { 'data-testid': 'apply-num', onClick: () => onChange(2) },
            'apply-num'
          ),
          R.createElement(
            'button',
            { 'data-testid': 'apply-str', onClick: () => onChange('1') },
            'apply-str'
          ),
          R.createElement(
            'button',
            { 'data-testid': 'apply-nan', onClick: () => onChange('abc') },
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
    mockSaveFilterPref.mockResolvedValue({});
    mockDeleteFilterPref.mockResolvedValue({});
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
    const { currentFilters } = renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalledTimes(1));

    const input = screen.getByPlaceholderText('View name');
    fireEvent.change(input, { target: { value: ' Weekly ' } });

    const checkbox = screen.queryByLabelText('Set as default');
    if (checkbox) {
      fireEvent.click(checkbox);
    }

    const saveBtn = screen.getByText('Save view');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockSaveFilterPref).toHaveBeenCalled();
    });

    const callArgs = mockSaveFilterPref.mock.calls[0];
    if (typeof callArgs[0] === 'object' && callArgs[0] !== null) {
      expect(callArgs[0]).toMatchObject({
        pageKey: PAGE_KEY,
        prefName: 'Weekly',
        isDefault: true,
      });
    } else {
      expect(callArgs[0]).toBe(PAGE_KEY);
      expect(callArgs[1]).toBe('Weekly');
      expect(JSON.parse(callArgs[2])).toEqual(currentFilters);
    }

    await waitFor(() => {
      expect(mockListFilterPrefs).toHaveBeenCalledTimes(2);
    });
  });

  it('disables Delete until a pref is selected, then deletes and reloads', async () => {
    mockListFilterPrefs.mockResolvedValue({ data: [prefOther] });
    renderBar();

    await waitFor(() => expect(mockListFilterPrefs).toHaveBeenCalledTimes(1));

    const deleteBtn = screen.getByText('Delete') as HTMLButtonElement;
    expect(deleteBtn.disabled).toBe(true);

    fireEvent.click(screen.getByTestId('apply-num'));

    expect((screen.getByText('Delete') as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDeleteFilterPref).toHaveBeenCalled();
    });

    const deleteArgs = mockDeleteFilterPref.mock.calls[0];
    if (typeof deleteArgs[0] === 'object' && deleteArgs[0] !== null) {
      expect(deleteArgs[0]).toMatchObject({ filterPrefId: 2 });
    } else {
      expect(deleteArgs[0]).toBe(2);
    }

    await waitFor(() => {
      expect(mockListFilterPrefs).toHaveBeenCalledTimes(2);
    });
  });
});