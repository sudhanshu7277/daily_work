// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx


const options = [...enriched].sort((a, b) =>
  (a.selectedLabel ?? a.label).localeCompare(b.selectedLabel ?? b.label)
);