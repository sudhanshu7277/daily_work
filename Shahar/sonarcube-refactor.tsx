
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



// 1. Breadcrumb.test.tsx (2 Failures)

// src/components/common/Breadcrumb.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

const mockItems = [
  { label: 'Instructions', path: '/instructions' },
  { label: '123', path: '/instructions/123' },
  { label: 'Create', path: '/instructions/123/create' },
];

describe('Breadcrumb Component', () => {
  it('renders breadcrumb items correctly using robust element matching', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={mockItems} />
      </MemoryRouter>
    );

    // Using exact text or flexible function matcher
    expect(screen.getByText((content, element) => 
      element?.tagName.toLowerCase() === 'a' || element?.tagName.toLowerCase() === 'span'
        ? content.toLowerCase().includes('instructions')
        : false
    )).toBeInTheDocument();
  });

  it('renders links for non-active items', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={mockItems} />
      </MemoryRouter>
    );

    const linkElement = screen.getByRole('link', { name: /instructions/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/instructions');
  });
});


// 2. MoreFiltersPanel.test.tsx (3 Failures)

// Fix A: Guard inside SearchableMultiSelect.tsx (Recommended)

// src/components/common/SearchableMultiSelect.tsx around line 74:
{(filtered || []).map((o) => (
  <Dropdown.Item key={o.value} value={o.value}>
    {o.label}
  </Dropdown.Item>
))}

// 3. DocumentTypeDropdown.test.tsx (2 Failures)

// src/components/common/DocumentTypeDropdown.tsx
// BAD:  <option key={opt.value}>{opt}</option>  or  <div>{opt}</div>
// GOOD:
{types.map((opt: any) => {
  const label = typeof opt === 'object' ? opt.label : opt;
  const val = typeof opt === 'object' ? opt.value : opt;
  return (
    <option key={val} value={val}>
      {label}
    </option>
  );
})}

// If you are using custom option components (like Bootstrap/AntD Dropdown):

{options?.map((opt: any) => (
  <Dropdown.Item key={opt.value || opt} value={opt.value || opt}>
    {typeof opt === 'object' ? opt.label : opt}
  </Dropdown.Item>
))}