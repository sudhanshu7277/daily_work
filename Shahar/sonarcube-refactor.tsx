// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// CallbackValidationForm.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CallbackValidationForm from './CallbackValidationForm';
import * as callbackService from './callbackValidationService'; // Adjust path if service is located in API directory

vi.mock('./callbackValidationService', () => ({
  getCallbackValidationData: vi.fn(),
}));

describe('CallbackValidationForm', () => {
  const mockOnClose = vi.fn();
  const mockId = '12345';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when visible and fetches initial data', async () => {
    const mockResponseData = {
      clientName: 'Test Client',
      status: 'Validated',
    };

    (callbackService.getCallbackValidationData as any).mockResolvedValue({
      data: mockResponseData,
    });

    render(
      <CallbackValidationForm
        visible={true}
        onClose={mockOnClose}
        id={mockId}
      />
    );

    // Verify service call was triggered on mount when visible is true
    expect(callbackService.getCallbackValidationData).toHaveBeenCalledTimes(1);
    expect(callbackService.getCallbackValidationData).toHaveBeenCalledWith(mockId);

    // Wait for async request to resolve and state updates to render
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
        id={mockId}
      />
    );

    // Verify API service is not invoked when hidden
    expect(callbackService.getCallbackValidationData).not.toHaveBeenCalled();

    // Verify Modal is not present in the DOM
    expect(screen.queryByText('Callback Validation')).not.toBeInTheDocument();
  });
});