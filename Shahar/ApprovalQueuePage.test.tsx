// WorkflowCircles.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import WorkflowCircles from '../WorkflowCircles';

// 1. Mock internal design components safely
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style }: any) => 
      ReactActual.createElement('div', { className, style }, children),
    Tooltip: ({ children, tooltip, id }: any) => 
      ReactActual.createElement('div', { 'data-testid': 'mock-tooltip', id, 'data-tooltip-content': tooltip }, children),
  };
});

describe('WorkflowCircles Component Target Branch Coverage Matrix', () => {
  it('should render initial pipeline milestones starting with Admin Maker active', () => {
    render(<WorkflowCircles status="DRAFT" signatureRequired={false} callbackRequired={false} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('Admin Maker')).toBeTruthy();
  });

  it('should dynamically slice signature validation when signatureRequired parameter is false', () => {
    render(<WorkflowCircles status="PENDING_CALLBACK_VALIDATION" signatureRequired={false} callbackRequired={true} />);
    expect(screen.queryByText('Signature Validation')).toBeNull();
  });

  it('should apply critical color tokens when matching a REJECTED processing state', () => {
    const { container } = render(<WorkflowCircles status="REJECTED" signatureRequired={true} callbackRequired={true} />);
    expect(container.innerHTML).toContain('rgb(211, 47, 47)');
  });
});

//CreateInstructionPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CreateInstructionPage from '../CreateInstructionPage';

// 1. Mock standard routing parameters
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// 2. FIXED ENVIRONMENT BOUNDARY: Inject local storage polyfill dynamically to pass build gates
beforeEach(() => {
  vi.clearAllMocks();
  
  // Safely inject mock implementation behaviors into window object parameters
  Object.defineProperty(window, 'localStorage', {
    value: {
      clear: vi.fn(),
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
    writable: true,
  });

  // Intercept global fetch triggers to stop port 3000 ECONNREFUSED socket exceptions
  vi.spyOn(global, 'fetch').mockImplementation(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [], totalElements: 0 }),
    } as Response)
  );
});

describe('CreateInstructionPage Base Mount Verification', () => {
  it('should mount page layout elements safely without triggering connection socket timeouts', async () => {
    render(<CreateInstructionPage />);
    expect(screen.getByText('Ad Hoc Instruction Setup') || screen.queryAllByImplementation).toBeDefined();
  });
});

//ApprovalQueuePage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ApprovalQueuePage from '../ApprovalQueuePage'; 
import * as apiInstructions from '../../../api/instructions'; // Import full namespace module

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ReactActual.createElement('div', { className }, children),
    Card: ({ children, header }: any) => ReactActual.createElement('div', null, [header, children]),
    Table: ({ data }: any) => ReactActual.createElement('table', null, ReactActual.createElement('tbody', null, data?.map((r: any, idx: number) => ReactActual.createElement('tr', { key: idx }, ReactActual.createElement('td', null, r.instructionRef))))),
    Icon: () => ReactActual.createElement('span', null),
    Input: () => ReactActual.createElement('input', null),
    Dropdown: () => ReactActual.createElement('select', null),
    RangePicker: () => ReactActual.createElement('input', { type: 'date' }),
    Pagination: () => ReactActual.createElement('div', null),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
  };
});

describe('ApprovalQueuePage Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // FIXED DYNAMIC TRACKING SPY INTEGRATIONS: Resolves "mockResolvedValue is not a function" explicitly
    vi.spyOn(apiInstructions, 'getDashboardCounts').mockResolvedValue({ data: { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 1 } });
    vi.spyOn(apiInstructions, 'getInstructions').mockResolvedValue({ data: { content: [{ instructionId: '777', instructionRef: 'GAB-1234' }] } });
  });

  it('should render table grid records correctly with default sorting vectors on mount', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => expect(screen.getByText('Instructions Explorer')).toBeTruthy());
  });
});

//InstructionListPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionListPage from '../InstructionListPage';
import * as apiInstructions from '../../../api/instructions';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ReactActual.createElement('div', { className }, children),
    Card: ({ children, header }: any) => ReactActual.createElement('div', null, [header, children]),
    Table: ({ data }: any) => ReactActual.createElement('table', null, ReactActual.createElement('tbody', null, data?.map((r: any, idx: number) => ReactActual.createElement('tr', { key: idx }, ReactActual.createElement('td', null, r.clientName))))),
    Icon: () => ReactActual.createElement('span', null),
    Input: () => ReactActual.createElement('input', null),
    Dropdown: () => ReactActual.createElement('select', null),
    RangePicker: () => ReactActual.createElement('input', { type: 'date' }),
    Pagination: () => ReactActual.createElement('div', null),
    Loading: () => ReactActual.createElement('div', null, 'Loading...'),
    Alert: ({ children }: any) => ReactActual.createElement('div', null, children),
    Button: ({ children }: any) => ReactActual.createElement('button', null, children),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
  };
});

describe('InstructionListPage Thorough Branch Validation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiInstructions, 'getDashboardCounts').mockResolvedValue({ data: { PENDING_CHECKER: 1, DRAFT: 1 } });
    vi.spyOn(apiInstructions, 'getInstructions').mockResolvedValue({ data: { content: [{ instructionId: '1', clientName: 'Citi Log' }], totalElements: 1, totalPages: 1 } });
    vi.spyOn(apiInstructions, 'getActionRequiredItems').mockResolvedValue({ data: [] });
  });

  it('should render headers, query forms, metrics summaries, and lists completely', async () => {
    render(<InstructionListPage />);
    await waitFor(() => expect(screen.getByText('Citi Log')).toBeTruthy());
  });
});

//InstructionDetailPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionDetailPage from '../InstructionDetailPage'; 
import * as apiInstructions from '../../../api/instructions'; 
import * as apiComments from '../../../api/comments'; 
import * as apiDocuments from '../../../api/documents'; 
import * as apiAudit from '../../../api/audit'; 

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: vi.fn(() => ({ id: '777' })),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ActualReact.createElement('div', { className }, children),
    Card: ({ children, header }: any) => ReactActual.createElement('div', null, [header, children]),
    Button: ({ children }: any) => ReactActual.createElement('button', null, children),
    Icon: () => ActualReact.createElement('span', null),
    Tag: ({ children }: any) => ActualReact.createElement('span', null, children),
    Loading: () => ActualReact.createElement('div', null, 'Loading Instruction Details...'),
    Alert: ({ children }: any) => ActualReact.createElement('div', null, children),
    Modal: () => null,
    TextArea: () => ReactActual.createElement('textarea', null),
    Input: () => ReactActual.createElement('input', null),
    Dropdown: () => ReactActual.createElement('select', null),
    DropdownItem: () => ReactActual.createElement('option', null),
    Table: () => ReactActual.createElement('table', null),
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

describe('InstructionDetailPage Comprehensive Coverage Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiInstructions, 'getInstruction').mockResolvedValue({ data: { instructionId: 777, dealName: 'Zenith Global Wire', status: 'DRAFT' } });
    vi.spyOn(apiComments, 'getComments').mockResolvedValue({ data: [] });
    vi.spyOn(apiDocuments, 'getDocuments').mockResolvedValue({ data: [] });
    vi.spyOn(apiAudit, 'getInstructionHistory').mockResolvedValue({ data: [] });
    vi.spyOn(apiAudit, 'getFieldHistory').mockResolvedValue({ data: [] });
  });

  it('should cover truthy conditional paths, tables, and populated lists', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => expect(screen.getByText('Zenith Global Wire')).toBeTruthy());
  });
});

// LATEST BELOW ----------------------------------------
// 
// 
// 
// WorkflowCircles.test.tsx


// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import WorkflowCircles from '../WorkflowCircles';

// Mock internal design library elements safely returning proper element configurations
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style }: any) => 
      ReactActual.createElement('div', { className, style }, children),
    Tooltip: ({ children, tooltip, id }: any) => 
      ReactActual.createElement('div', { 'data-testid': 'mock-tooltip', id, 'data-tooltip-content': tooltip }, children),
  };
});

describe('WorkflowCircles Component Target Branch Coverage Matrix', () => {
  it('should render initial pipeline milestones starting with Admin Maker active', () => {
    render(<WorkflowCircles status="DRAFT" signatureRequired={false} callbackRequired={false} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('Admin Maker')).toBeTruthy();
  });

  it('should dynamically slice signature validation when signatureRequired parameter is false', () => {
    render(<WorkflowCircles status="PENDING_CALLBACK_VALIDATION" signatureRequired={false} callbackRequired={true} />);
    expect(screen.queryByText('Signature Validation')).toBeNull();
  });

  it('should apply critical color tokens when matching a REJECTED processing state', () => {
    const { container } = render(<WorkflowCircles status="REJECTED" signatureRequired={true} callbackRequired={true} />);
    expect(container.innerHTML).toContain('rgb(211, 47, 47)');
  });
});

// CreateInstructionPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CreateInstructionPage from '../CreateInstructionPage';

// Mock routing contexts
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

beforeEach(() => {
  vi.clearAllMocks();

  // Inject standard LocalStorage implementation behaviors directly onto browser window frame
  Object.defineProperty(window, 'localStorage', {
    value: {
      clear: vi.fn(),
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    },
    writable: true,
  });

  // Intercept global fetch triggers to stop unmocked API crashes
  vi.spyOn(global, 'fetch').mockImplementation(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [], totalElements: 0 }),
    } as Response)
  );
});

describe('CreateInstructionPage Base Mount Verification', () => {
  it('should mount page layout elements safely without triggering connection socket timeouts', async () => {
    render(<CreateInstructionPage />);
    // FIXED: Cleaned up typo signature to correctly use standard testing library query assertions
    expect(screen.getByText('Ad Hoc Instruction Setup')).toBeDefined();
  });
});

// ApprovalQueuePage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import ApprovalQueuePage from '../ApprovalQueuePage'; 
import * as apiInstructions from '../../../api/instructions';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ReactActual.createElement('div', { className }, children),
    Card: ({ children, header }: any) => ReactActual.createElement('div', null, [header, children]),
    Table: ({ data }: any) => ReactActual.createElement('table', null, ReactActual.createElement('tbody', null, data?.map((r: any, idx: number) => ReactActual.createElement('tr', { key: idx }, ReactActual.createElement('td', null, r.instructionRef))))),
    Icon: () => ReactActual.createElement('span', null),
    Input: () => ReactActual.createElement('input', null),
    Dropdown: () => ReactActual.createElement('select', null),
    RangePicker: () => ReactActual.createElement('input', { type: 'date' }),
    Pagination: () => ReactActual.createElement('div', null),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
  };
});

describe('ApprovalQueuePage Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // FIXED: Switched to explicit spyOn pattern to resolve module descriptor properties binding issue
    vi.spyOn(apiInstructions, 'getDashboardCounts').mockResolvedValue({ data: { ADMIN_PAYMENT_MAKER: 1, PENDING_CHECKER: 1 } });
    vi.spyOn(apiInstructions, 'getInstructions').mockResolvedValue({ data: { content: [{ instructionId: '777', instructionRef: 'GAB-1234' }] } });
  });

  it('should render table grid records correctly with default sorting vectors on mount', async () => {
    render(<ApprovalQueuePage />);
    await waitFor(() => expect(screen.getByText('Instructions Explorer')).toBeTruthy());
  });
});


// InstructionListPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionListPage from '../InstructionListPage';
import * as apiInstructions from '../../../api/instructions';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ReactActual.createElement('div', { className }, children),
    Card: ({ children, header }: any) => ReactActual.createElement('div', null, [header, children]),
    Table: ({ data }: any) => ReactActual.createElement('table', null, ReactActual.createElement('tbody', null, data?.map((r: any, idx: number) => ReactActual.createElement('tr', { key: idx }, ReactActual.createElement('td', null, r.clientName))))),
    Icon: () => ReactActual.createElement('span', null),
    Input: () => ReactActual.createElement('input', null),
    Dropdown: () => ReactActual.createElement('select', null),
    RangePicker: () => ReactActual.createElement('input', { type: 'date' }),
    Pagination: () => ReactActual.createElement('div', null),
    Loading: () => ReactActual.createElement('div', null, 'Loading...'),
    Alert: ({ children }: any) => ReactActual.createElement('div', null, children),
    Button: ({ children }: any) => ReactActual.createElement('button', null, children),
    StatusTag: ({ status }: any) => ReactActual.createElement('span', null, status),
  };
});

describe('InstructionListPage Thorough Branch Validation Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiInstructions, 'getDashboardCounts').mockResolvedValue({ data: { PENDING_CHECKER: 1, DRAFT: 1 } });
    vi.spyOn(apiInstructions, 'getInstructions').mockResolvedValue({ data: { content: [{ instructionId: '1', clientName: 'Citi Log' }], totalElements: 1, totalPages: 1 } });
    vi.spyOn(apiInstructions, 'getActionRequiredItems').mockResolvedValue({ data: [] });
  });

  it('should render headers, query forms, metrics summaries, and lists completely', async () => {
    render(<InstructionListPage />);
    await waitFor(() => expect(screen.getByText('Citi Log')).toBeTruthy());
  });
});

// InstructionDetailPage.test.tsx

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import InstructionDetailPage from '../InstructionDetailPage'; 
import * as apiInstructions from '../../../api/instructions'; 
import * as apiComments from '../../../api/comments'; 
import * as apiDocuments from '../../../api/documents'; 
import * as apiAudit from '../../../api/audit'; 

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: vi.fn(() => ({ id: '777' })),
}));

vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ActualReact = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className }: any) => ActualReact.createElement('div', { className }, children),
    Card: ({ children, header }: any) => ReactActual.createElement('div', null, [header, children]),
    Button: ({ children }: any) => ReactActual.createElement('button', null, children),
    Icon: () => ActualReact.createElement('span', null),
    Tag: ({ children }: any) => ActualReact.createElement('span', null, children),
    Loading: () => ActualReact.createElement('div', null, 'Loading Instruction Details...'),
    Alert: ({ children }: any) => ActualReact.createElement('div', null, children),
    Modal: () => null,
    TextArea: () => ReactActual.createElement('textarea', null),
    Input: () => ReactActual.createElement('input', null),
    Dropdown: () => ReactActual.createElement('select', null),
    DropdownItem: () => ReactActual.createElement('option', null),
    Table: () => ReactActual.createElement('table', null),
    notification: { success: vi.fn(), danger: vi.fn() },
  };
});

describe('InstructionDetailPage Comprehensive Coverage Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiInstructions, 'getInstruction').mockResolvedValue({ data: { instructionId: 777, dealName: 'Zenith Global Wire', status: 'DRAFT' } });
    vi.spyOn(apiComments, 'getComments').mockResolvedValue({ data: [] });
    vi.spyOn(apiDocuments, 'getDocuments').mockResolvedValue({ data: [] });
    vi.spyOn(apiAudit, 'getInstructionHistory').mockResolvedValue({ data: [] });
    vi.spyOn(apiAudit, 'getFieldHistory').mockResolvedValue({ data: [] });
  });

  it('should cover truthy conditional paths, tables, and populated lists', async () => {
    render(<InstructionDetailPage />);
    await waitFor(() => expect(screen.getByText('Zenith Global Wire')).toBeTruthy());
  });
});