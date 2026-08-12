// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Priority 1: CallbackValidationForm.test.tsx

// src/pages/callbackValidation/CallbackValidationForm.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---- API Mocks ----
const mockGetInstructionAccounts = vi.fn();
const mockGetDocuments = vi.fn();
const mockGetComments = vi.fn();
const mockGetRefDataByType = vi.fn();
const mockGetCallbackValidation = vi.fn();
const mockSubmitCallbackValidation = vi.fn();

vi.mock('../../api/instructionAccounts', () => ({
  getInstructionAccounts: (...a: unknown[]) => mockGetInstructionAccounts(...a),
}));

vi.mock('../../api/documents', () => ({
  getDocuments: (...a: unknown[]) => mockGetDocuments(...a),
  downloadDocument: vi.fn(),
}));

vi.mock('../../api/comments', () => ({
  getComments: (...a: unknown[]) => mockGetComments(...a),
}));

vi.mock('../../api/refdata', () => ({
  getRefDataByType: (...a: unknown[]) => mockGetRefDataByType(...a),
}));

vi.mock('../../api/callbackValidation', () => ({
  getCallbackValidation: (...a: unknown[]) => mockGetCallbackValidation(...a),
  submitCallbackValidation: (...a: unknown[]) => mockSubmitCallbackValidation(...a),
}));

vi.mock('../../utils/format', () => ({
  formatDate: (v: string) => v,
  formatDateTime: (v: string) => v,
}));

// ---- Design System Mock ----
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const R = await vi.importActual<typeof import('react')>('react');
  return {
    El: ({ children, className, style, ...props }: any) =>
      R.createElement('div', { className, style, ...props }, children),
    Button: ({ children, onClick, title, disabled, type }: any) =>
      R.createElement('button', { onClick, title, disabled, type }, children),
    Input: ({ value, onChange, placeholder, disabled, name }: any) =>
      R.createElement('input', {
        name,
        placeholder,
        value: value ?? '',
        disabled,
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
    notification: {
      success: vi.fn(),
      danger: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  };
});

import CallbackValidationForm from './CallbackValidationForm';

const instruction = { instructionId: 123, dealId: 55, region: 'NAM' };

describe('CallbackValidationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInstructionAccounts.mockResolvedValue({ data: [] });
    mockGetDocuments.mockResolvedValue({ data: [] });
    mockGetComments.mockResolvedValue({ data: [] });
    mockGetRefDataByType.mockResolvedValue({ data: [] });
    mockGetCallbackValidation.mockResolvedValue({ data: [] });
    mockSubmitCallbackValidation.mockResolvedValue({ data: {} });
  });

  it('renders modal when visible and fetches initial data', async () => {
    render(
      <CallbackValidationForm
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
      expect(mockGetCallbackValidation).toHaveBeenCalledWith(123);
    });
  });

  it('does not load anything when visible is false', () => {
    render(
      <CallbackValidationForm
        visible={false}
        instruction={instruction}
        onClose={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    expect(mockGetInstructionAccounts).not.toHaveBeenCalled();
  });
});

// src/main.test.tsx

// src/main.test.tsx

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

vi.mock('@citi-icg-172888/icgds-react', () => ({
  CssProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'css-provider' }, children),
}));

vi.mock('./citi-overrides.css', () => ({}));

vi.mock('./App', () => ({
  default: () => React.createElement('div', { 'data-testid': 'app-component' }, 'App Component'),
}));

describe('main.tsx entrypoint', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts the App component inside root container', async () => {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);

    await import('./main');

    expect(rootDiv.innerHTML).not.toBe('');
    expect(rootDiv.querySelector('[data-testid="app-component"]')).not.toBeNull();
  });
});