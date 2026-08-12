// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Solution 1: Add the Import at the Top of the File (Recommended)
Add this import line right at the top of src/pages/signatureValidation/SignatureValidationPage.test.tsx:



import '@testing-library/jest-dom/vitest';



// Solution 2: Use Native Vitest Matcher
//Alternatively, replace .toBeInTheDocument() with .toBeTruthy(), which is built directly into Vitest and does not require type augmentation:

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

  const errorMsg = await screen.findByText(/Signature Validation Source is required/i);
  expect(errorMsg).toBeTruthy();
  expect(mockSubmitSignatureValidation).not.toHaveBeenCalled();
});