// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// CallbackValidationForm.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CallbackValidationForm from './CallbackValidationForm';
import * as service from './callbackValidationService'; // Adjust path to API service

vi.mock('./callbackValidationService', () => ({
  getCallbackValidationData: vi.fn(),
}));

describe('CallbackValidationForm', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when visible and fetches initial data', async () => {
    const mockData = { clientName: 'Test Client', status: 'Pending' };
    (service.getCallbackValidationData as any).mockResolvedValue({ data: mockData });

    render(
      <CallbackValidationForm
        visible={true}
        onClose={mockOnClose}
        id="123"
      />
    );

    // Verify API request was triggered
    expect(service.getCallbackValidationData).toHaveBeenCalledTimes(1);
    expect(service.getCallbackValidationData).toHaveBeenCalledWith('123');

    // Wait for async state update and modal content rendering
    await waitFor(() => {
      expect(screen.getByText('Callback Validation')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Test Client')).toBeInTheDocument();
  });

  it('does not load anything when visible is false', () => {
    render(
      <CallbackValidationForm
        visible={false}
        onClose={mockOnClose}
        id="123"
      />
    );

    // Verify API is NOT called
    expect(service.getCallbackValidationData).not.toHaveBeenCalled();

    // Verify Modal is NOT rendered in the DOM
    expect(screen.queryByText('Callback Validation')).not.toBeInTheDocument();
  });
});