
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

//1. Add outside component scope (Top of file)

// Static style declarations to prevent re-allocation during re-renders
const REVIEW_TABLE_STYLE: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const REVIEW_TH_STYLE: React.CSSProperties = {
  padding: '6px 8px',
  textAlign: 'left',
};

const REVIEW_TD_STYLE: React.CSSProperties = {
  padding: '6px 8px',
};

const HEADER_ROW_STYLE: React.CSSProperties = {
  borderBottom: '2px solid var(--lmn-border-color, #dee2e6)',
};

const BODY_ROW_STYLE: React.CSSProperties = {
  borderBottom: '1px solid var(--lmn-border-color, #e0e0e0)',
};

const FULL_WIDTH_STYLE: React.CSSProperties = {
  width: '100%',
};

const REQUIRED_ASTERISK_STYLE: React.CSSProperties = {
  color: 'red',
};


//2. Add inside CreateInstructionPage component body

// Extracted handler to replace inline onChange arrow function
const handleCommentChange = useCallback(
  (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, comments: value }));
  },
  []
);

// 3. Replaced renderReview function (Lines 2343–2488)

// BEFORE:
// key={idx}
// inline style={{ width: '100%' }}
// onChange={(e) => setForm({ ...form, comments: e.target.value })}

// AFTER:
const renderReview = () => {
  return (
    <div className="render-review-container">
      {/* Documents review section */}
      {documentList.length > 0 && (
        <Card className="lmn-mb-16px">
          <Card.Header>
            <Icon type="paperclip" className="lmn-mr-8px" />
            Attached Documents ({documentList.length})
          </Card.Header>
          <Card.Body>
            <table style={REVIEW_TABLE_STYLE}>
              <thead>
                <tr style={HEADER_ROW_STYLE}>
                  <th style={REVIEW_TH_STYLE}>Document</th>
                  <th style={REVIEW_TH_STYLE}>Type</th>
                  <th style={REVIEW_TH_STYLE}>Classification</th>
                  <th style={REVIEW_TH_STYLE}>Region</th>
                  <th style={REVIEW_TH_STYLE}>Date</th>
                </tr>
              </thead>
              <tbody>
                {documentList.map((doc, idx) => (
                  <tr key={doc.id ?? `${doc.name}-${idx}`} style={BODY_ROW_STYLE}>
                    <td style={REVIEW_TD_STYLE}>{doc.name}</td>
                    <td style={REVIEW_TD_STYLE}>{doc.type ?? '-'}</td>
                    <td style={REVIEW_TD_STYLE}>{doc.classification ?? '-'}</td>
                    <td style={REVIEW_TD_STYLE}>{doc.region ?? '-'}</td>
                    <td style={REVIEW_TD_STYLE}>{doc.documentDate ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )}

      {/* Exception & General Comments */}
      <Card className="lmn-mb-16px">
        <Card.Header>
          <Icon type="message-square" className="lmn-mr-8px" />
          {exception ? (
            <>
              Exception Comment <span style={REQUIRED_ASTERISK_STYLE}>*</span>
            </>
          ) : (
            'Comment'
          )}
        </Card.Header>
        <Card.Body>
          <El className="lmn-form-group">
            <label className={`lmn-form-label${exception ? ' lmn-required' : ''}`}>
              {exception
                ? 'Comment (required when MPP Process Exception is Yes)'
                : 'Comment (optional)'}
            </label>
            <TextArea
              value={form.comments ?? ''}
              onChange={handleCommentChange}
              placeholder={
                exception
                  ? 'Please provide a reason for the exception...'
                  : 'Add a comment...'
              }
              rows={4}
              style={FULL_WIDTH_STYLE}
            />
          </El>
        </Card.Body>
      </Card>
    </div>
  );
};

