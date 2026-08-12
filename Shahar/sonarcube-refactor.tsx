// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit



//src/pages/signatureValidation/SignatureValidationPage.test.tsx

// src/pages/signatureValidation/SignatureValidationPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---- Vitest Hoisted Mocks ----
const { mockNotification } = vi.hoisted(() => ({
  mockNotification: {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// ---- Route Params Mock ----
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '123' }),
}));

// ---- API Mocks ----
const mockGetInstructionAccounts = vi.fn();
const mockGetDocuments = vi.fn();
const mockDownloadDocument = vi.fn();
const mockGetRefDataByType = vi.fn();
const mockGetSignatureValidation = vi.fn();
const mockSubmitSignatureValidation = vi.fn();
const mockGetDealParties = vi.fn();
const mockGetComments = vi.fn();

vi.mock('../../api/instructionAccounts', () => ({
  getInstructionAccounts: (...a: unknown[]) => mockGetInstructionAccounts(...a),
}));

vi.mock('../../api/documents', () => ({
  getDocuments: (...a: unknown[]) => mockGetDocuments(...a),
  downloadDocument: (...a: unknown[]) => mockDownloadDocument(...a),
}));

vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...a: unknown[]) => mockGetRefDataByType(...a),
}));

vi.mock('../../api/signatureValidation', () => ({
  getSignatureValidation: (...a: unknown[]) => mockGetSignatureValidation(...a),
  submitSignatureValidation: (...a: unknown[]) => mockSubmitSignatureValidation(...a),
}));

vi.mock('../../api/aws', () => ({
  getDealParties: (...a: unknown[]) => mockGetDealParties(...a),
}));

vi.mock('../../api/comments', () => ({
  getComments: (...a: unknown[]) => mockGetComments(...a),
}));

// ---- Format & CSS Mocks ----
vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => v,
  formatDateTime: (v: string) => v,
}));

vi.mock('./SignatureValidationForm.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-theme-quartz.css', () => ({}));

vi.mock('@components/common/RadioGroup', () => ({
  default: ({ options, selectedValue, onChange }: any) =>
    React.createElement(
      'div',
      { 'data-testid': 'radio-group', 'data-selected': selectedValue ?? '' },
      (options ?? []).map((o: any) =>
        React.createElement(
          'button',
          {
            key: o.id || o.value,
            type: 'button',
            'data-testid': `radio-${o.value}`,
            onClick: () => onChange(o.value),
          },
          o.label
        )
      )
    ),
}));

vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData }: { rowData: unknown[] }) =>
    React.createElement('div', {
      'data-testid': 'ag-grid',
      'data-rowcount': rowData?.length ?? 0,
    }),
}));

// ---- Design System Mock ----
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, 'aria-label': ariaLabel, type }: any) =>
      R.createElement('button', { onClick, title, disabled, type, 'aria-label': ariaLabel }, children),
    Input: ({ value, onChange, placeholder, disabled, style, name }: any) =>
      R.createElement('input', {
        name,
        placeholder,
        value: value ?? '',
        disabled,
        style,
        onChange,
        'data-testid': `input-${name || placeholder || 'default'}`,
      }),
    TextArea: ({ value, onChange, placeholder, disabled, name }: any) =>
      R.createElement('textarea', {
        name,
        placeholder,
        value: value ?? '',
        disabled,
        onChange,
      }),
    Alert: ({ children, type }: any) =>
      R.createElement('div', { role: 'alert', 'data-testid': `alert-${type}` }, children),
    Loading: ({ tip }: any) =>
      R.createElement('div', { 'data-testid': 'loading' }, tip || 'Loading...'),
    Icon: ({ type, className }: any) =>
      R.createElement('i', { className: `icon-${type} ${className || ''}` }),
    Card: ({ children, className, style }: any) =>
      R.createElement('div', { className, style }, children),
    Tag: ({ children, color }: any) =>
      R.createElement('span', { 'data-color': color }, children),
    Table: ({ children }: any) => R.createElement('table', null, children),
    Modal: ({ visible, children, title, onCancel, onApply }: any) =>
      visible
        ? R.createElement(
            'div',
            { role: 'dialog', 'data-testid': 'modal' },
            R.createElement('h2', null, title),
            children,
            R.createElement('button', { type: 'button', onClick: onCancel }, 'Cancel'),
            R.createElement('button', { type: 'button', onClick: onApply }, 'Save')
          )
        : null,
    Dropdown: Object.assign(
      ({ value, onChange, children, disabled, placeholder }: any) =>
        R.createElement(
          'select',
          {
            role: 'combobox',
            value: value ?? '',
            disabled,
            onChange: (e: any) => onChange(e.target.value),
          },
          placeholder && R.createElement('option', { value: '' }, placeholder),
          children
        ),
      { Item: ({ value, children }: any) => R.createElement('option', { value }, children) }
    ),
    notification: mockNotification,
  };
});

import SignatureValidationForm from './SignatureValidationPage';

const instruction = { instructionId: 123, dealId: 55, region: 'NAM' };

function setDefaults() {
  mockGetInstructionAccounts.mockResolvedValue({ data: [] });
  mockGetDocuments.mockResolvedValue({ data: [] });
  mockGetDealParties.mockResolvedValue({ data: [] });
  mockGetComments.mockResolvedValue({ data: [] });
  mockGetRefDataByType.mockResolvedValue({
    data: [{ refCode: 'EMAIL', refValue: 'Email' }],
  });
  mockGetSignatureValidation.mockResolvedValue({ data: [] });
  mockSubmitSignatureValidation.mockResolvedValue({ data: {} });
}

describe('SignatureValidationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setDefaults();
  });

  it('loads instruction data and source options when visible', async () => {
    render(
      <SignatureValidationForm
        visible
        instruction={instruction}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mockGetInstructionAccounts).toHaveBeenCalledWith(123);
      expect(mockGetDocuments).toHaveBeenCalledWith(123);
      expect(mockGetComments).toHaveBeenCalledWith(123);
      expect(mockGetRefDataByType).toHaveBeenCalledWith('SIGNATURE_VALIDATION_SOURCE');
      expect(mockGetSignatureValidation).toHaveBeenCalledWith(123);
    });
  });

  it('fetches deal parties when instruction has a dealId', async () => {
    render(
      <SignatureValidationForm
        visible
        instruction={instruction}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    await waitFor(() => expect(mockGetDealParties).toHaveBeenCalledWith(55));
  });

  it('does NOT fetch deal parties when there is no dealId', async () => {
    render(
      <SignatureValidationForm
        visible
        instruction={{ instructionId: 123 }}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    await waitFor(() => expect(mockGetInstructionAccounts).toHaveBeenCalled());

    expect(mockGetDealParties).not.toHaveBeenCalled();
  });

  it('does not load anything when not visible', async () => {
    render(
      <SignatureValidationForm
        visible={false}
        instruction={instruction}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    await Promise.resolve();

    expect(mockGetInstructionAccounts).not.toHaveBeenCalled();
    expect(mockGetSignatureValidation).not.toHaveBeenCalled();
  });

  it('shows a validation error and does not submit when required fields are empty', async () => {
    render(
      <SignatureValidationForm
        visible
        instruction={instruction}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    await waitFor(() => expect(mockGetSignatureValidation).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Submit'));

    expect(await screen.findByText('Signature Validation Source is required')).toBeInTheDocument();
    expect(mockSubmitSignatureValidation).not.toHaveBeenCalled();
  });

  it('submits successfully when saved values pre-populate the required fields', async () => {
    mockGetSignatureValidation.mockResolvedValue({
      data: [
        { signatureSource: 'OLD', signatureStatus: 'Pending', validationNotes: 'old' },
        { signatureSource: 'EMAIL', signatureStatus: 'Signature Approved', validationNotes: 'looks good' },
      ],
    });

    const onComplete = vi.fn();

    render(
      <SignatureValidationForm
        visible
        instruction={instruction}
        onClose={vi.fn()}
        onComplete={onComplete}
      />
    );

    await waitFor(() => expect(mockGetSignatureValidation).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockSubmitSignatureValidation).toHaveBeenCalledWith(123, {
        signatureValidationSource: 'EMAIL',
        signatureStatus: 'Signature Approved',
        commentText: 'looks good',
      });
    });

    expect(mockNotification.success).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });
});




// src/pages/emailIntake/EmailIntakeAuditPage.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// --- API Mocks ---
const mockGetAuditPage = vi.fn();
const mockGetInboxPage = vi.fn();

vi.mock('../../api/emailIntake', () => ({
  getAuditPage: (...a: unknown[]) => mockGetAuditPage(...a),
  getInboxPage: (...a: unknown[]) => mockGetInboxPage(...a),
}));

// --- Export Utility Mock ---
const mockExportToCsv = vi.fn();
vi.mock('../../utils/exportExcel', () => ({
  exportToCsv: (...a: unknown[]) => mockExportToCsv(...a),
}));

// --- Format Utility Mock ---
vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => v,
  formatDateTime: (v: string) => v,
}));

// --- AG-Grid Mocks ---
vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-theme-quartz.css', () => ({}));
vi.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData }: { rowData: unknown[] }) =>
    React.createElement('div', {
      'data-testid': 'ag-grid',
      'data-rowcount': rowData?.length ?? 0,
    }),
}));

// --- Design System Mock ---
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, 'aria-label': ariaLabel }: any) =>
      R.createElement('button', { onClick, title, disabled, 'aria-label': ariaLabel }, children),
    Input: ({ value, onChange, placeholder, disabled, style }: any) =>
      R.createElement('input', {
        placeholder,
        value: value ?? '',
        disabled,
        style,
        onChange,
        'data-testid': `input-${placeholder || 'default'}`,
      }),
    Alert: ({ children, type }: any) =>
      R.createElement('div', { role: 'alert', 'data-testid': `alert-${type}` }, children),
    Loading: ({ tip }: any) =>
      R.createElement('div', { 'data-testid': 'loading' }, tip || 'Loading...'),
    Icon: ({ type, className }: any) =>
      R.createElement('i', { className: `icon-${type} ${className || ''}` }),
    Card: ({ children, className, style }: any) =>
      R.createElement('div', { className, style }, children),
    Tag: ({ children, color }: any) =>
      R.createElement('span', { 'data-color': color }, children),
    Dropdown: Object.assign(
      ({ value, onChange, children, disabled, placeholder }: any) =>
        R.createElement(
          'select',
          {
            role: 'combobox',
            value: value ?? '',
            disabled,
            onChange: (e: any) => onChange(e.target.value),
          },
          placeholder && R.createElement('option', { value: '' }, placeholder),
          children
        ),
      { Item: ({ value, children }: any) => R.createElement('option', { value }, children) }
    ),
  };
});

import EmailIntakeAuditPage from './EmailIntakeAuditPage';

const auditData = {
  data: {
    content: [
      {
        id: 1,
        emailSubject: 'Payment Instruction',
        sender: 'client@example.com',
        status: 'PROCESSED',
        receivedAt: '2026-01-01',
      },
    ],
    totalElements: 1,
    totalPages: 1,
  },
};

const inboxData = {
  data: {
    content: [
      {
        id: 2,
        emailSubject: 'Urgent Wire',
        sender: 'vendor@example.com',
        status: 'PENDING',
        receivedAt: '2026-01-02',
      },
      {
        id: 3,
        emailSubject: 'Statement Request',
        sender: 'info@example.com',
        status: 'COMPLETED',
        receivedAt: '2026-01-03',
      },
    ],
    totalElements: 2,
    totalPages: 1,
  },
};

describe('EmailIntakeAuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuditPage.mockResolvedValue(auditData);
    mockGetInboxPage.mockResolvedValue(inboxData);
  });

  it('loads audit data on mount and renders the grid with the audit rows', async () => {
    render(<EmailIntakeAuditPage />);

    expect(screen.getByTestId('loading')).toBeTruthy();

    await waitFor(() => {
      expect(mockGetAuditPage).toHaveBeenCalled();
    });

    const grid = await screen.findByTestId('ag-grid');
    expect(grid.getAttribute('data-rowcount')).toBe('1');
  });

  it('switches to the inbox tab and loads inbox data', async () => {
    render(<EmailIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    const inboxTab = screen.getByText(/Inbox/i);
    fireEvent.click(inboxTab);

    await waitFor(() => {
      expect(mockGetInboxPage).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('ag-grid').getAttribute('data-rowcount')).toBe('2');
    });
  });

  it('shows an error alert when the audit fetch fails', async () => {
    mockGetAuditPage.mockRejectedValueOnce(new Error('Failed to fetch audit data'));

    render(<EmailIntakeAuditPage />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to fetch audit data');
  });

  it('exports CSV when audit data is present', async () => {
    render(<EmailIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    const exportBtn = screen.getByText('Export CSV');
    fireEvent.click(exportBtn);

    expect(mockExportToCsv).toHaveBeenCalled();
  });

  it('does not export when there is no audit content', async () => {
    mockGetAuditPage.mockResolvedValueOnce({
      data: { content: [], totalElements: 0, totalPages: 0 },
    });

    render(<EmailIntakeAuditPage />);

    await screen.findByTestId('ag-grid');

    const exportBtn = screen.getByText('Export CSV');
    fireEvent.click(exportBtn);

    expect(mockExportToCsv).not.toHaveBeenCalled();
  });
});