// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx



const getRelatedInstructionPlaceholder = () => {
  if (relatedInstructionLoading) return 'Loading instructions...';
  if (!canShowRelatedDropdown) return 'Select Instruction Type or Request Type first';
  return 'Search and select instructions to mark as duplicate...';
};


// Replace lines 2054–2060 with the clean helper call:

<Input
  placeholder={getRelatedInstructionPlaceholder()}
  value={relatedInstructionSearch}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRelatedInstructionsReadOnly) return;
    setRelatedInstructionSearch(e.target.value);
    setRelatedDropdownOpen(true);
  }}
  onFocus={() => {
    if (isRelatedInstructionsReadOnly) return;
    setRelatedDropdownOpen(true);
  }}
  disabled={!canShowRelatedDropdown || isRelatedInstructionsReadOnly}
/>