// cmd to run tests locally

npx vitest run --coverage

// src/components/common/MoreFiltersPanel.test.tsx

// src/components/common/MoreFiltersPanel.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MoreFiltersPanel, { INITIAL_MORE_FILTERS, type MoreFiltersState } from './MoreFiltersPanel';

// --- mock the refdata API (two calls fire on mount) ---
const mockGetRefDataByType = vi.fn();
vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...args: unknown[]) => mockGetRefDataByType(...args),
}));

// --- mock the child SearchableMultiSelect ---
// Each stub surfaces its fieldLabel + the option values, plus a button that
// fires onChange(['__picked__']) so we can assert the parent's updateFilter wiring.
vi.mock('./SearchableMultiSelect', () => ({
  default: ({ fieldLabel, options, onChange }: any) =>
    React.createElement(
      'div',
      {
        'data-testid': `mss-${fieldLabel}`,
      },
      React.createElement(
        'span',
        {
          'data-testid': `mss-${fieldLabel}-options`,
        },
        (options ?? []).map((o: any) => o.value).join(',')
      ),
      React.createElement(
        'button',
        {
          'data-testid': `mss-${fieldLabel}-change`,
          onClick: () => onChange(['__picked__']),
        },
        'change'
      )
    ),
}));

// --- mock the design-system components ---
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, ...rest }: any) => R.createElement('div', rest, children),
    Dropdown: Object.assign(
      ({ children, value, onChange }: any) =>
        R.createElement(
          'div',
          {
            'data-testid': 'updated-in',
            'data-value': value ?? '',
          },
          children,
          R.createElement(
            'button',
            {
              'data-testid': 'updated-in-change',
              onClick: () => onChange('6'),
            },
            'change'
          )
        ),
      {
        Item: ({ children, value }: any) =>
          R.createElement('div', { 'data-testid': `updated-in-opt-${value}` }, children),
      }
    ),

    RangePicker: ({ onValueChange, placeholder }: any) =>
      R.createElement('button', {
        'data-testid': `range-${(placeholder ?? []).join('-')}`,
        onClick: () => onValueChange([new Date('2024-01-01'), new Date('2024-01-31')]),
      }),
  };
});

const CLIENTS = [{ value: 'C1', label: 'Client One' }];
const DEALS = [{ value: 'D1', label: 'Deal One' }];
const USERS = [{ value: 'U1', label: 'User One' }];
const STATUSES = [{ value: 'OPEN', label: 'Open' }];

function renderPanel(overrides: Partial<MoreFiltersState> = {}, onFiltersChange = vi.fn()) {
  const filters = { ...INITIAL_MORE_FILTERS, ...overrides };
  render(
    <MoreFiltersPanel
      instructionType="payment"
      filters={filters}
      onFiltersChange={onFiltersChange}
      clients={CLIENTS}
      deals={DEALS}
      users={USERS}
      statuses={STATUSES}
    />
  );

  return { filters, onFiltersChange };
}

describe('MoreFiltersPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default: both refdata calls resolve empty
    mockGetRefDataByType.mockResolvedValue({ data: [] });
  });

  it('fetches both category ref-data types on mount', async () => {
    renderPanel();
    await waitFor(() => {
      expect(mockGetRefDataByType).toHaveBeenCalledWith('NON_PAYMENT_CATEGORIES');
      expect(mockGetRefDataByType).toHaveBeenCalledWith('PAYMENT_CATEGORIES');
    });
  });

  it('renders all six filter dropdowns and both range pickers', () => {
    renderPanel();
    expect(screen.getByTestId('mss-client')).toBeTruthy();
    expect(screen.getByTestId('mss-deal')).toBeTruthy();
    expect(screen.getByTestId('mss-category')).toBeTruthy();
    expect(screen.getByTestId('mss-admin maker')).toBeTruthy();
    expect(screen.getByTestId('mss-status')).toBeTruthy();
    expect(screen.getByTestId('updated-in')).toBeTruthy();
    expect(screen.getAllByTestId('range-From-To')).toHaveLength(2);
  });

  it('passes the provided option lists down to the child selects', () => {
    renderPanel();
    expect(screen.getByTestId('mss-client-options').textContent).toBe('C1');
    expect(screen.getByTestId('mss-deal-options').textContent).toBe('D1');
    expect(screen.getByTestId('mss-admin maker-options').textContent).toBe('U1');
    expect(screen.getByTestId('mss-status-options').textContent).toBe('OPEN');
  });

  it('merges, dedupes and sorts the category options from both ref-data calls', async () => {
    mockGetRefDataByType.mockImplementation((type: string) => {
      if (type === 'NON_PAYMENT_CATEGORIES')
        return Promise.resolve({ data: [{ refValue: 'Zebra' }, { refValue: 'Alpha' }] });
      return Promise.resolve({ data: [{ refValue: 'Alpha' }, { refValue: 'Mango' }] });
    });

    renderPanel();
    // Sorted + deduped: Alpha, Mango, Zebra
    await waitFor(() => {
      expect(screen.getByTestId('mss-category-options').textContent).toBe('Alpha,Mango,Zebra');
    });
  });

  it('falls back to empty category options when a ref-data call rejects', async () => {
    mockGetRefDataByType.mockRejectedValue(new Error('boom'));
    renderPanel();
    await waitFor(() => {
      expect(mockGetRefDataByType).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByTestId('mss-category-options').textContent).toBe('');
  });

  it('calls onFiltersChange with the updated client array, preserving other filters', () => {
    const onFiltersChange = vi.fn();
    renderPanel({ status: ['OPEN'] }, onFiltersChange);
    fireEvent.click(screen.getByTestId('mss-client-change'));
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ client: ['__picked__'], status: ['OPEN'] })
    );
  });

  it('stringifies the Updated In dropdown value before propagating it', () => {
    const onFiltersChange = vi.fn();
    renderPanel({}, onFiltersChange);
    fireEvent.click(screen.getByTestId('updated-in-change'));
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ updatedIn: '6' })
    );
  });

  it('propagates the Value Date range through updateFilter', () => {
    const onFiltersChange = vi.fn();
    renderPanel({}, onFiltersChange);
    // first range picker rendered is Value Date
    fireEvent.click(screen.getAllByTestId('range-From-To')[0]);
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ valueDateRange: expect.any(Array) })
    );
  });
});