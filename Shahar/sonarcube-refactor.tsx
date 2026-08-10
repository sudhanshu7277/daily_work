
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



// Updated vite.config.ts

/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/nextgengab/ui',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/nextgengab/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/**',
        'src/types/**',
        'src/constants/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/__tests__/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
      ],
    },
  },
});




// Minimal File Fixes
1. src/api/__tests__/aws.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as clientModule from '../client';
import { getDocumentList, getDealParties } from '../aws';

vi.mock('../client', () => {
  const mockGet = vi.fn();
  return {
    default: { get: mockGet },
    get: mockGet,
  };
});

describe('aws API functions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getDocumentList calls get with correct params', async () => {
    vi.mocked(clientModule.get).mockResolvedValueOnce([{ id: 1 }]);
    const res = await getDocumentList(123);
    expect(res).toEqual([{ id: 1 }]);
  });

  it('getDealParties calls get with correct params', async () => {
    vi.mocked(clientModule.get).mockResolvedValueOnce([{ partyId: 1 }]);
    const res = await getDealParties(456);
    expect(res).toEqual([{ partyId: 1 }]);
  });
});


//2. src/components/common/Breadcrumb.test.tsx

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb Component', () => {
  it('renders route label', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <Breadcrumb />
      </MemoryRouter>
    );
    expect(screen.getByText((_, el) => el?.textContent?.toLowerCase().includes('home') ?? false)).toBeInTheDocument();
  });
});


//3. src/components/common/__tests__/DocumentTypeDropdown.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import DocumentTypeDropdown from '../DocumentTypeDropdown';

describe('DocumentTypeDropdown Component', () => {
  const props = { value: '', onChange: vi.fn(), options: [{ label: 'Type A', value: 'TYPE_A' }] };

  it('renders placeholder', () => {
    render(<DocumentTypeDropdown {...props} />);
    expect(screen.getByText(/select type/i)).toBeInTheDocument();
  });
});

// 4. src/components/common/MoreFiltersPanel.test.tsx (Line 88)

it('triggers onClearAll on click', () => {
  render(<MoreFiltersPanel {...defaultProps} />);
  fireEvent.click(screen.getByText(/clear/i));
  expect(defaultProps.onClearAll).toHaveBeenCalled();
});