// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx

// Step 1: Add a Helper Function
//Add this helper function inside renderReview (or at the top level of the component):

const formatBoolean = (val?: boolean | null) => {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  return '-';
};


// Step 2: Update Lines 3573–3579
//Replace lines 3573–3579 with the single helper call:

{renderReviewRow("Xceptor", formatBoolean(form.xceptor))}