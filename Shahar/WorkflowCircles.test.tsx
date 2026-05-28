// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import WorkflowCircles from './WorkflowCircles';

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

  it('should render without crashing for PENDING_CHECKER status', () => {
    expect(() =>
      render(<WorkflowCircles status="PENDING_CHECKER" signatureRequired={true} callbackRequired={true} />)
    ).not.toThrow();
  });

  it('should render without crashing for APPROVED status', () => {
    expect(() =>
      render(<WorkflowCircles status="APPROVED" signatureRequired={false} callbackRequired={false} />)
    ).not.toThrow();
  });

  it('should render without crashing for COMPLETED status', () => {
    expect(() =>
      render(<WorkflowCircles status="COMPLETED" signatureRequired={true} callbackRequired={true} />)
    ).not.toThrow();
  });
});