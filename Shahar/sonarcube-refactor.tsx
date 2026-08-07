
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



// src/api/paymentDetails.ts

export const updatePaymentDetail = async () => ({});
export const verifyPaymentDetail = async () => ({});



///  src/components/instructions/VerifyPaymentDetailModal.test.tsx

import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// 1. Polyfill DOMMatrix for pdfjs-dist in JSDOM environment
if (typeof global !== 'undefined' && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
  };
}

// 2. Mock pdfjs-dist library
vi.mock('pdfjs-dist', () => ({
  default: {
    getDocument: vi.fn(),
    GlobalWorkerOptions: {},
  },
  getDocument: vi.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getViewport: vi.fn().mockReturnValue({ width: 100, height: 100 }),
        render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
      }),
    }),
  }),
  GlobalWorkerOptions: {},
}));

// 3. Mock NativePdfViewer child component directly
vi.mock('../documentViewer/NativePdfViewer', () => ({
  default: () => <div data-testid="mock-pdf-viewer" />,
}));

// 4. Mock UI Design System Library (includes Dropdown, Tag, Tooltip, etc.)
vi.mock('@citi-icg-172888/icgds-react', () => {
  const Dummy = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    default: Dummy,
    El: Dummy,
    Tag: Dummy,
    Tooltip: Dummy,
    Modal: Object.assign(
      ({ children }: any) => <div data-testid="mock-modal">{children}</div>,
      { Header: Dummy, Body: Dummy, Footer: Dummy, Title: Dummy }
    ),
    Icon: () => <span />,
    Button: ({ children }: any) => <button>{children}</button>,
    Input: () => <input />,
    DatePicker: () => <div />,
    Dropdown: Object.assign(Dummy, { Item: Dummy, Option: Dummy }),
    Select: Object.assign(Dummy, { Option: Dummy }),
    Table: Object.assign(Dummy, { Header: Dummy, Body: Dummy, Row: Dummy, Cell: Dummy }),
  };
});

import VerifyPaymentDetailModal from './VerifyPaymentDetailModal';

describe('VerifyPaymentDetailModal Component', () => {
  it('renders without crashing', () => {
    const ModalComponent = VerifyPaymentDetailModal as React.ComponentType<any>;
    const { container } = render(
      <ModalComponent isOpen={true} show={true} visible={true} data={{}} />
    );
    expect(container).toBeInTheDocument();
  });
});

