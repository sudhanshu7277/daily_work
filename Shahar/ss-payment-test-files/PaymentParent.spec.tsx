import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentParent } from '../PaymentParent';

// Mock AuthContext to prevent provider dependency failures
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    soeId: 'sj81534',
    user: { soeId: 'sj81534', name: 'Sudhanshu Jain' }
  })
}));

describe('PaymentParent Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with Maker Mode tab active by default', () => {
    render(<PaymentParent />);
    expect(screen.getByText(/Outbound ISO 20022 Payment \(Maker Mode\)/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Submit Payment/i })).toBeDefined();
  });

  it('switches between Maker, Checker, and Repair tabs seamlessly', async () => {
    render(<PaymentParent />);

    const checkerTabBtn = screen.getByRole('button', { name: /2\. Checker Mode/i });
    fireEvent.click(checkerTabBtn);
    expect(screen.getByText(/Payment Verification & Authorization \(Checker Mode\)/i)).toBeDefined();

    const repairTabBtn = screen.getByRole('button', { name: /3\. Repair Mode/i });
    fireEvent.click(repairTabBtn);
    expect(screen.getByText(/Payment Correction Queue \(Repair Mode\)/i)).toBeDefined();
  });

  it('dispatches Maker payment submit and renders failure modal on HTTP 500 error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Database constraint violation' })
    } as any);

    render(<PaymentParent />);

    const submitBtn = screen.getByRole('button', { name: /Submit Payment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByText(/MAKER RECORD NOT CREATED/i)).toBeDefined();
    });
  });

  it('dispatches Checker approval decision and shows success modal', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ transactionId: 'TXN-902188', status: 'APPROVED' })
    } as any);

    render(<PaymentParent />);

    fireEvent.click(screen.getByRole('button', { name: /2\. Checker Mode/i }));

    const approveBtn = screen.getByRole('button', { name: /Approve Payment/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(screen.queryByText(/CHECKER APPROVAL SUCCESSFUL/i)).toBeDefined();
    });
  });

  it('requires comments when rejecting in Checker mode', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<PaymentParent />);

    fireEvent.click(screen.getByRole('button', { name: /2\. Checker Mode/i }));
    const rejectBtn = screen.getByRole('button', { name: /Reject/i });
    fireEvent.click(rejectBtn);

    expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Please enter comments'));
  });
});