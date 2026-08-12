// cmd to run tests locally

npx vitest run --coverage


// src/test-utils/setupMocks.ts

import { vi } from 'vitest';

export const mockNotification = {
  success: vi.fn(),
  danger: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

export function setupCommonMocks() {
  vi.mock('@citi-icg-172888/icgds-react', async () => {
    const R = await vi.importActual<typeof import('react')>('react');
    return {
      El: ({ children, className, style, ...props }: any) =>
        R.createElement('div', { className, style, ...props }, children),
      Button: ({ children, onClick, title, disabled }: any) =>
        R.createElement('button', { onClick, title, disabled }, children),
      Input: ({ value, onChange, placeholder, disabled, type }: any) =>
        R.createElement('input', { placeholder, value: value ?? '', disabled, type, onChange }),
      Card: Object.assign(
        ({ children, className }: any) => R.createElement('div', { className }, children),
        { body: ({ children }: any) => R.createElement('div', null, children) }
      ),
      Modal: ({ visible, onCancel, onApply, title, children, applyText, cancelText }: any) =>
        visible
          ? R.createElement(
              'div',
              { 'data-testid': 'modal' },
              R.createElement('h2', null, title),
              children,
              R.createElement('button', { onClick: onCancel }, cancelText || 'Cancel'),
              R.createElement('button', { onClick: onApply }, applyText || 'Apply')
            )
          : null,
      Dropdown: Object.assign(
        ({ value, onChange, children, disabled, placeholder }: any) =>
          R.createElement(
            'select',
            { value: value ?? '', disabled, onChange: (e: any) => onChange(e.target.value) },
            placeholder && R.createElement('option', { value: '' }, placeholder),
            children
          ),
        { Item: ({ value, children }: any) => R.createElement('option', { value }, children) }
      ),
      Alert: ({ children, type }: any) => R.createElement('div', { 'data-testid': `alert-${type}` }, children),
      Loading: ({ tip }: any) => R.createElement('div', null, tip),
      Icon: ({ type, className }: any) => R.createElement('i', { className: `icon-${type} ${className || ''}` }),
      notification: mockNotification,
    };
  });
}