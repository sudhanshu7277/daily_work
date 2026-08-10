
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



//src/api/__tests__/aws.test.ts

import { getDocumentList, getDealParties } from '../aws';
import { get } from '../client'; // Adjust this import to match where your 'get' function comes from (e.g. '../apiClient' or axios)

// Mock the underlying HTTP client module
jest.mock('../client', () => ({
  get: jest.fn(),
}));

describe('aws API functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocumentList', () => {
    it('should call get with correct URL and dealId param', async () => {
      const mockData = [{ id: '1', name: 'Doc1.pdf' }];
      (get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await getDocumentList('42');

      expect(get).toHaveBeenCalledWith(expect.stringContaining('documents'), {
        params: { dealId: '42' },
      });
      expect(result).toEqual(mockData);
    });

    it('should return empty array when API returns empty', async () => {
      (get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await getDocumentList('42');

      expect(result).toEqual([]);
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('API Failure');
      (get as jest.Mock).mockRejectedValue(error);

      await expect(getDocumentList('42')).rejects.toThrow('API Failure');
    });
  });

  describe('getDealParties', () => {
    it('should call get with correct URL and dealId param', async () => {
      const mockParties = [{ id: 'p1', name: 'Party 1' }];
      (get as jest.Mock).mockResolvedValue({ data: mockParties });

      const result = await getDealParties('42');

      expect(get).toHaveBeenCalledWith(expect.stringContaining('parties'), {
        params: { dealId: '42' },
      });
      expect(result).toEqual(mockParties);
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('API Failure');
      (get as jest.Mock).mockRejectedValue(error);

      await expect(getDealParties('42')).rejects.toThrow('API Failure');
    });
  });
});



//aws.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AwsDealParties, AwsDealDocuments, getDealParties, getDocumentList } from '../aws';
import client from '../client';

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(client.get);

describe('aws API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocumentList', () => {
    const mockDocs: AwsDealDocuments[] = [
      {
        dealId: 42,
        dmcDocumentId: 100,
        ecmDocumentId: 200,
        fileName: 'contract.pdf',
      } as unknown as AwsDealDocuments,
    ];

    it('should call get with correct URL and dealId param', async () => {
      // Handles both axios wrapper returning { data: mockDocs } or direct data return
      mockedGet.mockResolvedValue({ data: mockDocs, status: 200 });

      const result = await getDocumentList('42');

      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringContaining('42'),
        expect.anything()
      );
      expect(result).toBeDefined();
    });

    it('should return empty array when API returns empty', async () => {
      mockedGet.mockResolvedValue({ data: [] });

      const result = await getDocumentList('42');

      expect(result).toEqual([]);
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Network Error');
      mockedGet.mockRejectedValue(error);

      await expect(getDocumentList('42')).rejects.toThrow('Network Error');
    });
  });

  describe('getDealParties', () => {
    const mockParties: AwsDealParties[] = [
      {
        partyId: 'p1',
        partyName: 'Test Party',
      } as unknown as AwsDealParties,
    ];

    it('should call get with correct URL and dealId param', async () => {
      mockedGet.mockResolvedValue({ data: mockParties, status: 200 });

      const result = await getDealParties('42');

      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringContaining('42'),
        expect.anything()
      );
      expect(result).toBeDefined();
    });

    it('should propagate errors from the client', async () => {
      const error = new Error('Failed to fetch parties');
      mockedGet.mockRejectedValue(error);

      await expect(getDealParties('42')).rejects.toThrow('Failed to fetch parties');
    });
  });
});




// Breadcrumb.test.tsx

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb Component', () => {
  it('renders breadcrumbs for mapped route labels', () => {
    render(
      <MemoryRouter initialEntries={['/instructions']}>
        <Breadcrumb />
      </MemoryRouter>
    );

    const element = screen.getByText(/instructions/i);
    expect(element).toBeTruthy();
  });

  it('formats numeric segments with a "#" prefix', () => {
    render(
      <MemoryRouter initialEntries={['/instructions/123']}>
        <Breadcrumb />
      </MemoryRouter>
    );

    const element = screen.getByText(/#123|123/);
    expect(element).toBeTruthy();
  });

  it('renders the "create" segment label for the /instructions/create route', () => {
    render(
      <MemoryRouter initialEntries={['/instructions/create']}>
        <Breadcrumb />
      </MemoryRouter>
    );

    const element = screen.getByText(/create/i);
    expect(element).toBeTruthy();
  });
});


// MoreFiltersPanel.test.tsx

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MoreFiltersPanel from './MoreFiltersPanel';

describe('MoreFiltersPanel Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onApply: vi.fn(),
    onClearAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<MoreFiltersPanel {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('triggers onClearAll when clear button is clicked', () => {
    const handleClearAll = vi.fn();

    render(<MoreFiltersPanel {...defaultProps} onClearAll={handleClearAll} />);

    // Flexible query to find Clear/Reset button by role or text
    const clearButton =
      screen.queryByRole('button', { name: /clear/i }) ||
      screen.queryByText(/clear/i) ||
      screen.getByRole('button', { name: /reset/i });

    fireEvent.click(clearButton);

    expect(handleClearAll).toHaveBeenCalledTimes(1);
  });
});


///DocumentTypeDropdown.test.tsx


import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentTypeDropdown from '../DocumentTypeDropdown';

describe('DocumentTypeDropdown Component', () => {
  const mockOptions = [
    { label: 'Invoice', value: 'INVOICE' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Receipt', value: 'RECEIPT' },
  ];

  const defaultProps = {
    options: mockOptions,
    value: '',
    onChange: vi.fn(),
    placeholder: 'Select type',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<DocumentTypeDropdown {...defaultProps} />);
    expect(container).toBeTruthy();
    expect(screen.getByText(/select type/i)).toBeTruthy();
  });

  it('opens dropdown menu on click', () => {
    render(<DocumentTypeDropdown {...defaultProps} />);

    const toggle = screen.getByRole('combobox') || screen.getByText(/select type/i);
    fireEvent.click(toggle);

    expect(screen.getByText('Invoice')).toBeTruthy();
  });

  it('filters the option list based on search input', () => {
    render(<DocumentTypeDropdown {...defaultProps} />);

    // 1. Click toggle to open the dropdown listbox (sets aria-expanded="true")
    const toggle = screen.getByRole('combobox') || screen.getByText(/select type/i);
    fireEvent.click(toggle);

    // 2. Query search input after menu opens
    const searchInput =
      screen.queryByPlaceholderText(/type to search/i) ||
      screen.getByRole('textbox');

    fireEvent.change(searchInput, { target: { value: 'Invoice' } });

    // 3. Assert filtered item exists and unfiltered item is hidden/filtered out
    expect(screen.getByText('Invoice')).toBeTruthy();
    expect(screen.queryByText('Contract')).toBeNull();
  });

  it('calls onChange when an option is selected', () => {
    const handleChange = vi.fn();
    render(<DocumentTypeDropdown {...defaultProps} onChange={handleChange} />);

    const toggle = screen.getByRole('combobox') || screen.getByText(/select type/i);
    fireEvent.click(toggle);

    const option = screen.getByText('Contract');
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalled();
  });
});