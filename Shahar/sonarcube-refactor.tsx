
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





// fixing CreateInstructionPage component

// Fix 1: Resolve key={idx} Major Code Smell (Line 2375)
SonarQube flags key={idx} under Rule S6479 (Do not use array index as key in React lists).

BEFORE (Line 2375):

{documentList.map((doc, idx) => (
  <tr key={idx} style={{ borderBottom: '1px solid var(--lmn-border-color, #e0e0e0)' }}></tr>

  // AFTER:

  {documentList.map((doc, idx) => (
    <tr key={doc.id || `${doc.name}-${idx}`} style={{ borderBottom: '1px solid var(--lmn-border-color, #e0e0e0)' }}>
</tr>


      // Fix 2: Prevent Form Object Mutation Smell (Lines 2400–2404)
SonarQube flags nested inline arrow updates that might cause undefined state access or object mutation warnings.

BEFORE (Lines 2400–2404):

value={form.comments ?? ''}
onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
  setForm(prev => ({ ...prev, comments: e.target.value }))
}


AFTR:

value={form?.comments || ''}
onChange={(e) => {
  const val = e.target.value;
  setForm((prev) => ({ ...prev, comments: val }));
}}

// Fix 3: Clear Uncovered Branch Lines in SonarQube (Unit Test Addition)
If SonarQube is flagging lines 2378–2381 (doc.type ?? '-', doc.classification ?? '-') as uncovered branches, add this single test case to your existing unit test file. It executes the nullish fallbacks without touching any production component code:


it('covers missing document properties and exception branches in renderReview', () => {
  const incompleteDoc = [{ name: 'IncompleteDoc.pdf' }]; // Triggers all '?? "-"' branches
  
  render(
    <CreateInstructionPage 
      documentList={incompleteDoc} 
      exception={true} 
      form={{ comments: undefined }} 
    />
  );

  expect(screen.getByText('IncompleteDoc.pdf')).toBeInTheDocument();
  expect(screen.getByText('Comment (required when MPP Process Exception is Yes)')).toBeInTheDocument();
});