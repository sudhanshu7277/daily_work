
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



// citiSftIntake.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRecentIntakes,
  getInbox,
  getAttachments,
  getAuditTrail,
  getAuditPage,
  getInboxPage,
} from '../citiSftIntake';
import client from '../client';

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

/**
 * Helper function to mock successful client GET responses.
 * Refactoring inline mocks into this helper eliminates SonarQube code duplication flags.
 */
const mockApiResponse = <T>(payload: T): void => {
  vi.mocked(client.get).mockResolvedValueOnce(payload as any);
};

describe('citiSftIntake API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRecentIntakes calls client.get with correct endpoint', async () => {
    const mockData = [{ id: 101, status: 'PROCESSED' }];
    mockApiResponse(mockData);

    const result = await getRecentIntakes();

    expect(client.get).toHaveBeenCalledWith('/citi-sft-intake/recent');
    expect(result).toEqual(mockData);
  });

  it('getInbox calls client.get with correct endpoint', async () => {
    const mockData = { id: 10, subject: 'Citi SFT Intake Item' };
    mockApiResponse(mockData);

    const result = await getInbox(10);

    expect(client.get).toHaveBeenCalledWith('/citi-sft-intake/inbox/10');
    expect(result).toEqual(mockData);
  });

  it('getAttachments calls client.get with correct endpoint', async () => {
    const mockData = [{ attachmentId: 200, fileName: 'sft_report.csv' }];
    mockApiResponse(mockData);

    const result = await getAttachments(10);

    expect(client.get).toHaveBeenCalledWith('/citi-sft-intake/inbox/10/attachments');
    expect(result).toEqual(mockData);
  });

  it('getAuditTrail calls client.get with correct endpoint', async () => {
    const mockData = [{ auditId: 50, eventType: 'COMPLETED' }];
    mockApiResponse(mockData);

    const result = await getAuditTrail(10);

    expect(client.get).toHaveBeenCalledWith('/citi-sft-intake/inbox/10/audit');
    expect(result).toEqual(mockData);
  });

  it('getAuditPage calls client.get with pagination parameters', async () => {
    const mockData = { content: [], totalElements: 0, totalPages: 0 };
    mockApiResponse(mockData);

    const result = await getAuditPage(0, 10);

    expect(client.get).toHaveBeenCalledWith('/citi-sft-intake/audit?page=0&size=10');
    expect(result).toEqual(mockData);
  });

  it('getInboxPage calls client.get with pagination parameters', async () => {
    const mockData = { content: [], totalElements: 0, totalPages: 0 };
    mockApiResponse(mockData);

    const result = await getInboxPage(0, 10);

    expect(client.get).toHaveBeenCalledWith('/citi-sft-intake/inbox?page=0&size=10');
    expect(result).toEqual(mockData);
  });
});