
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




import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'node_modules/**',
      ],
    },
  },
});


"scripts": {
  "sonar": "sonar-scanner -Dsonar.tests=src -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx -Dsonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx"
}


include: ['src/**/*.{ts,tsx}']


npx vitest run --coverage


1)  Fix vite.config.ts (Remove 'include' and test exclusions)


// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // ... your server and proxy settings ...

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      
      // DO NOT put `include: ['src/**/*.{ts,tsx}']` here
      
      exclude: [
        '**/node_modules/**',
        '**/src/test/**',
        '**/*.d.ts',
      ],
    },
  },
});
// Move test files into tests subdirectories

SonarQube's global default rules treat any path containing `/__tests__/` as test code automatically, regardless of project settings.

// Move your test files into __tests__ folders:src/utils/arrayUtils.test.ts $\rightarrow$ src/utils/__tests__/arrayUtils.test.ts

// src/api/__tests__/awsTicklerSync.test.ts

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get, post } from '../client';
import { triggerSync, getSyncHistory, retryFailedCallbacks } from '../awsTicklerSync';
import type { TicklerSyncSummary, AwsTicklerSyncLog, PagedResponse } from '../../types';

vi.mock('../client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);

describe('awsTicklerSync API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('triggerSync', () => {
    it('should call post with correct endpoint', async () => {
      const mockSummary: TicklerSyncSummary = {
        totalFetched: 10,
        created: 5,
        updated: 2,
        skipped: 2,
        errors: 1,
        callbackFailures: 0,
      };

      mockedPost.mockResolvedValue({ data: mockSummary, message: 'OK', status: 200 } as any);

      const result = await triggerSync();

      expect(mockedPost).toHaveBeenCalledWith('/aws/tickler-sync/trigger');
      expect(result.data).toEqual(mockSummary);
    });

    it('should propagate errors', async () => {
      mockedPost.mockRejectedValue(new Error('Unauthorized'));

      await expect(triggerSync()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getSyncHistory', () => {
    it('should call get with default page and size', async () => {
      const mockPage: PagedResponse<AwsTicklerSyncLog> = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };

      mockedGet.mockResolvedValue({ data: mockPage, message: 'OK', status: 200 } as any);

      const result = await getSyncHistory();

      expect(mockedGet).toHaveBeenCalledWith('/aws/tickler-sync/history', { page: 0, size: 20 });
      expect(result.data.content).toEqual([]);
    });

    it('should call get with custom page and size', async () => {
      const mockLog = {
        syncId: 1,
        awsTaskId: 100,
        instructionId: 200,
        ticklerTaskId: 300,
        syncStatus: 'SUCCESS',
        callbackStatus: 'SENT',
        syncedOn: '2026-01-01T00:00:00',
      } as unknown as AwsTicklerSyncLog;

      const mockPage: PagedResponse<AwsTicklerSyncLog> = {
        content: [mockLog],
        page: 2,
        size: 10,
        totalElements: 25,
        totalPages: 3,
        last: false,
      };

      mockedGet.mockResolvedValue({ data: mockPage, message: 'OK', status: 200 } as any);

      const result = await getSyncHistory(2, 10);

      expect(mockedGet).toHaveBeenCalledWith('/aws/tickler-sync/history', { page: 2, size: 10 });
      expect(result.data.content).toHaveLength(1);
      expect(result.data.content[0].syncId).toBe(1);
    });

    it('should propagate errors', async () => {
      mockedGet.mockRejectedValue(new Error('Server Error'));

      await expect(getSyncHistory()).rejects.toThrow('Server Error');
    });
  });

  describe('retryFailedCallbacks', () => {
    it('should call post with correct endpoint', async () => {
      mockedPost.mockResolvedValue({ data: 3, message: 'OK', status: 200 } as any);

      const result = await retryFailedCallbacks();

      expect(mockedPost).toHaveBeenCalledWith('/aws/tickler-sync/retry-callbacks');
      expect(result.data).toBe(3);
    });

    it('should return 0 when no callbacks retried', async () => {
      mockedPost.mockResolvedValue({ data: 0, message: 'OK', status: 200 } as any);

      const result = await retryFailedCallbacks();

      expect(result.data).toBe(0);
    });

    it('should propagate errors', async () => {
      mockedPost.mockRejectedValue(new Error('Forbidden'));

      await expect(retryFailedCallbacks()).rejects.toThrow('Forbidden');
    });
  });
});