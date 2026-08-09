
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

// src/api/__tests__/callbacks.test.ts

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get, post } from '../client';
import { getCallbacks, recordCallback } from '../callbacks';
import type { CallbackResponse } from '../../types';

vi.mock('../client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);

const sampleCallbackResponse: CallbackResponse = {
  callbackId: 10,
  instructionId: 42,
  outcome: 'Callback Successful',
  contactName: 'John Smith',
  phoneNumberCalled: '+1-212-555-0101',
  mobileNumber: '+1-917-555-0101',
  emailId: 'john@test.com',
  attemptedBy: 'test.user',
  calledOn: '2026-05-03T10:30:00',
  createdOn: '2026-05-03T10:30:00',
  createdBy: 'test.user',
  isActive: 1,
  commentId: 1,
};

describe('callbacks API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCallbacks', () => {
    it('should call get with correct URL and instructionId', async () => {
      mockedGet.mockResolvedValue({
        data: [sampleCallbackResponse],
        message: 'OK',
        status: 200,
      } as any);

      const result = await getCallbacks(42);

      expect(mockedGet).toHaveBeenCalledWith('/instructions/42/callbacks');
      expect(result.data[0].callbackId).toBe(10);
    });

    it('should return empty array when API returns empty', async () => {
      mockedGet.mockResolvedValue({
        data: [],
        message: 'OK',
        status: 200,
      } as any);

      const result = await getCallbacks(99);

      expect(result.data).toEqual([]);
    });

    it('should propagate errors from the client', async () => {
      mockedGet.mockRejectedValue(new Error('Network error'));

      await expect(getCallbacks(1)).rejects.toThrow('Network error');
    });
  });

  describe('recordCallback', () => {
    it('should post callback payload and return response', async () => {
      const payload: any = {
        instructionId: 42,
        outcome: 'Callback Successful',
        contactName: 'John Smith',
        phoneNumberCalled: '+1-212-555-0101',
      };

      mockedPost.mockResolvedValue({
        data: sampleCallbackResponse,
        message: 'OK',
        status: 200,
      } as any);

      const result = await recordCallback(42, payload);

      expect(mockedPost).toHaveBeenCalledWith('/instructions/42/callbacks', payload);
      expect(result.data.callbackId).toBe(10);
    });

    it('should propagate errors from post client', async () => {
      const payload: any = {
        instructionId: 42,
        outcome: 'Callback Successful',
      };

      mockedPost.mockRejectedValue(new Error('Post failed'));

      await expect(recordCallback(42, payload)).rejects.toThrow('Post failed');
    });
  });
});


///Option 1: Replace JSX at Line 2085 with SearchableDropdown (Recommended)
Since SearchableDropdown is already imported at the top of the file, replace lines 2085–2090 in renderDocuments:


<SearchableDropdown
  value={doc.type}
  onChange={(val) => updateDocumentMeta(idx, 'type', String(val))}
  style={{ minWidth: 160 }}
  options={documentTypes}
  placeholder="Select type"
/>

