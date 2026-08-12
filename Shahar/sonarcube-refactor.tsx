// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// signatureValidation/SignatureValidationPage.test.tsx

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
      {
        signatureSource: 'OLD',
        signatureValidationSource: 'OLD',
        signatureStatus: 'Pending',
        validationNotes: 'old',
        commentText: 'old',
      },
      {
        signatureSource: 'EMAIL',
        signatureValidationSource: 'EMAIL',
        signatureStatus: 'Signature Approved',
        validationNotes: 'looks good',
        commentText: 'looks good',
      },
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
    expect(mockSubmitSignatureValidation).toHaveBeenCalledWith(123, expect.objectContaining({
      signatureValidationSource: 'EMAIL',
      signatureStatus: 'Signature Approved',
      commentText: 'looks good',
    }));
  });

  expect(mockNotification.success).toHaveBeenCalled();
  expect(onComplete).toHaveBeenCalled();
});