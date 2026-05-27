// WorkflowCircles.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import WorkflowCircles from '../WorkflowCircles';

// 1. Mock internal platform design wrappers with correct style and tooltip props
vi.mock('@citi-icg-172888/icgds-react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  return {
    // FIXED: Passes the raw object reference through cleanly instead of JSON.stringify
    El: ({ children, className, style }: any) => 
      ReactActual.createElement('div', { className, style }, children),
    Tooltip: ({ children, tooltip, id }: any) => 
      ReactActual.createElement('div', { 'data-testid': 'mock-tooltip', id, 'data-tooltip-content': tooltip }, children),
  };
});

describe('WorkflowCircles Component Target Branch Coverage Matrix', () => {

  it('should render initial pipeline milestones starting with Admin Maker active', () => {
    render(
      <WorkflowCircles 
        status="DRAFT" 
        signatureRequired={false} 
        callbackRequired={false} 
      />
    );
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('Admin Maker')).toBeTruthy();
    expect(screen.getByText('Admin Checker')).toBeTruthy();
  });

  it('should dynamically slice signature validation when signatureRequired parameter is false', () => {
    render(
      <WorkflowCircles 
        status="PENDING_CALLBACK_VALIDATION" 
        signatureRequired={false} 
        callbackRequired={true} 
      />
    );
    expect(screen.queryByText('Signature Validation')).toBeNull();
    expect(screen.getByText('Callback Validation')).toBeTruthy();
  });

  it('should dynamically slice callback loops when callbackRequired parameter is false', () => {
    render(
      <WorkflowCircles 
        status="PENDING_PAYMENT_MAKER" 
        signatureRequired={true} 
        callbackRequired={false} 
      />
    );
    expect(screen.queryByText('Callback Validation')).toBeNull();
    expect(screen.getByText('Signature Validation')).toBeTruthy();
  });

  it('should apply critical color tokens when matching a REJECTED processing state', () => {
    const { container } = render(
      <WorkflowCircles 
        status="REJECTED" 
        signatureRequired={true} 
        callbackRequired={true} 
      />
    );
    expect(container.innerHTML).toContain('rgb(211, 47, 47)'); // hex representation #D32F2F inside browser DOM parses to rgb
  });

  it('should apply fallback warning token colors when matching a RETURNED_TO_ADMIN state', () => {
    const { container } = render(
      <WorkflowCircles 
        status="RETURNED_TO_ADMIN" 
        signatureRequired={true} 
        callbackRequired={true} 
      />
    );
    expect(container.innerHTML).toContain('rgb(245, 124, 0)'); // hex representation #F57C00 inside browser DOM parses to rgb
  });

  it('should override step label text output to Admin Rework when conditions align perfectly', () => {
    render(
      <WorkflowCircles 
        status="RETURNED_TO_ADMIN" 
        signatureRequired={true} 
        callbackRequired={true} 
      />
    );
    expect(screen.getByText('Admin Rework')).toBeTruthy();
    expect(screen.queryByText('Admin Maker')).toBeNull();
  });

  it('should process clean visual elements when workflow drops into terminal status', () => {
    render(
      <WorkflowCircles 
        status="COMPLETED" 
        signatureRequired={true} 
        callbackRequired={true} 
      />
    );
    expect(screen.getByText('Completed')).toBeTruthy();
  });
});


// The Fixed Top-Section for CreateInstructionPage.test.tsx

// Replace lines 1-15 inside your current CreateInstructionPage.test.tsx file with this cleanly un-commented block:

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import CreateInstructionPage from '../CreateInstructionPage';

// 1. Mock standard routing parameters
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, vi.fn()],
}));

// 2. Global Network Layer API Interception Bypasser
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  
  // FIXED: Intercepts raw global fetch connections, shutting down port 3000 ECONNREFUSED crashes completely
  vi.spyOn(global, 'fetch').mockImplementation(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [], totalElements: 0 }),
    } as Response)
  );
});
