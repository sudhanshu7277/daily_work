
npm test -- --coverage --watchAll=false




Phase 1: Pure API Layer Batch (Quick Coverage Spike)
Why: API files contain pure functions calling Axios. They require zero DOM rendering, can be tested in batches using simple vi.mock('axios') patterns, and will instantly cover 1,500+ lines of code.

Target Files (0% -> 100%):

src/api/audit.ts

src/api/comments.ts

src/api/citiSftIntake.ts

src/api/documents.ts (111 lines)

src/api/roles.ts

src/api/thresholds.ts

src/api/tickler.ts

src/api/whitelist.ts

src/api/emailIntake.ts & src/api/emails.ts

Phase 2: Context & Utility Cleanup
Why: Contexts wrap large sections of the app, and utilities are straightforward logic branches with high line density.

Target Files:

src/context/AuthContext.tsx (183 lines — test login, logout, role check hooks, and provider state)

src/utils/exportExcel.ts

src/utils/arrayUtils.ts

Phase 3: Lightweight Common Components
Why: Reusable common UI elements render quickly with minimal prop mocking and cover significant UI branch logic.

Target Files:

src/components/common/Breadcrumb.tsx (45 lines)

src/components/common/PresetBar.tsx (101 lines)

src/components/common/PriorityTag.tsx (15 lines)

src/components/common/RadioGroup.tsx (27 lines)

src/components/common/StatusTag.tsx (27 lines)

src/components/common/FilterPanel.tsx (219 lines)

Phase 4: Small & Medium Leaf Pages
Why: Smaller, dedicated sub-pages have simpler logic than the main Dashboard/Instruction List pages, giving high line returns without getting bogged down in complex AG-Grid or table state mocks.

Target Files:

src/pages/auth/AccessDeniedPage.tsx (23 lines)

src/pages/intakeChannels/IntakeChannelsPage.tsx (89 lines)

src/pages/refdata/ReferenceDataPage.tsx (169 lines)

src/pages/tickler/TicklerTaskPage.tsx (250 lines)

src/pages/whitelist/WhitelistManagementPage.tsx (329 lines)

src/pages/thresholds/ThresholdManagementPage.tsx (431 lines)

Recommended Execution Path
Starting with Phase 1 (The API Layer) will immediately jump your overall statement coverage from 34% to over 55% in a single batch.





// src/components/common/MoreFiltersPanel.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MoreFiltersPanel, { INITIAL_MORE_FILTERS } from './MoreFiltersPanel';
import { getRefDataByType } from '../../api/refdata';

vi.mock('../../api/refdata', () => ({
  getRefDataByType: vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', () => ({
  El: ({ children, className, style }: any) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
  Dropdown: Object.assign(
    ({ children, value, onChange, placeholder }: any) => (
      <select
        data-testid="updated-in-dropdown"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
    ),
    {
      Item: ({ children, value }: any) => <option value={value}>{children}</option>,
    },
  ),
  RangePicker: ({ value, onValueChange, placeholder }: any) => (
    <div data-testid="range-picker">
      <button
        data-testid={`trigger-range-${placeholder?.[0]}`}
        onClick={() => onValueChange([new Date('2026-01-01'), new Date('2026-01-10')])}
      >
        Set Range
      </button>
    </div>
  ),
}));

vi.mock('./SearchableMultiSelect', () => ({
  default: ({ fieldLabel, values, options, onChange }: any) => (
    <div data-testid={`searchable-select-${fieldLabel}`}>
      <span data-testid={`values-${fieldLabel}`}>{values.join(',')}</span>
      <button
        data-testid={`btn-select-${fieldLabel}`}
        onClick={() => onChange(['test-val'])}
      >
        Select {fieldLabel}
      </button>
    </div>
  ),
}));

describe('MoreFiltersPanel Component', () => {
  const defaultProps = {
    instructionType: 'payment' as const,
    filters: INITIAL_MORE_FILTERS,
    onFiltersChange: vi.fn(),
    clients: [{ value: 'c1', label: 'Client 1' }],
    deals: [{ value: 'd1', label: 'Deal 1' }],
    users: [{ value: 'u1', label: 'User 1' }],
    statuses: [{ value: 's1', label: 'Status 1' }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRefDataByType).mockImplementation((type: string) => {
      if (type === 'NON_PAYMENT_CATEGORIES') {
        return Promise.resolve({
          data: [{ refValue: 'Category B' }, { refValue: 'Category A' }],
        } as any);
      }
      if (type === 'PAYMENT_CATEGORIES') {
        return Promise.resolve({
          data: [{ refValue: 'Category A' }, { refValue: 'Category C' }],
        } as any);
      }
      return Promise.resolve({ data: [] } as any);
    });
  });

  it('fetches reference data, deduplicates, and sorts category options on mount', async () => {
    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    expect(getRefDataByType).toHaveBeenCalledWith('NON_PAYMENT_CATEGORIES');
    expect(getRefDataByType).toHaveBeenCalledWith('PAYMENT_CATEGORIES');

    const categorySelect = screen.getByTestId('searchable-select-category');
    expect(categorySelect).toBeInTheDocument();
  });

  it('handles refdata fetching errors gracefully', async () => {
    vi.mocked(getRefDataByType).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    expect(screen.getByTestId('searchable-select-category')).toBeInTheDocument();
  });

  it('triggers onFiltersChange when Client selection changes', async () => {
    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    fireEvent.click(screen.getByTestId('btn-select-client'));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...INITIAL_MORE_FILTERS,
      client: ['test-val'],
    });
  });

  it('triggers onFiltersChange when Deal selection changes', async () => {
    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    fireEvent.click(screen.getByTestId('btn-select-deal'));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...INITIAL_MORE_FILTERS,
      deal: ['test-val'],
    });
  });

  it('triggers onFiltersChange when Updated In dropdown changes', async () => {
    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    const dropdown = screen.getByTestId('updated-in-dropdown');
    fireEvent.change(dropdown, { target: { value: '3' } });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...INITIAL_MORE_FILTERS,
      updatedIn: '3',
    });
  });

  it('triggers onFiltersChange when Value Date range changes', async () => {
    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    fireEvent.click(screen.getByTestId('trigger-range-From'));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...INITIAL_MORE_FILTERS,
      valueDateRange: [new Date('2026-01-01'), new Date('2026-01-10')],
    });
  });

  it('triggers onFiltersChange when Admin Maker selection changes', async () => {
    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    fireEvent.click(screen.getByTestId('btn-select-admin maker'));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...INITIAL_MORE_FILTERS,
      adminMaker: ['test-val'],
    });
  });

  it('triggers onFiltersChange when Status selection changes', async () => {
    await act(async () => {
      render(<MoreFiltersPanel {...defaultProps} />);
    });

    fireEvent.click(screen.getByTestId('btn-select-status'));

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      ...INITIAL_MORE_FILTERS,
      status: ['test-val'],
    });
  });
});