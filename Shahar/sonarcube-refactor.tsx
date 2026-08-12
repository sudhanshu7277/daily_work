// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx
// 1. Add the Handler Function inside SetupInstructionModal (near your other event handlers)


const handleRemoveRelatedInstruction = (idToRemove: number | string) => {
  if (isRelatedInstructionsReadOnly) return;

  const newIds = (form.relatedInstructionIds ?? []).filter((x) => x !== idToRemove);

  const getRef = (nid: number | string) =>
    adminMakerInstructions.find((i) => i.instructionId === nid)?.instructionRef;

  const newRefs = newIds.map(getRef).filter(Boolean).join(', ');

  updateField('relatedInstructionIds', newIds);
  updateField('relatedInstructions', newRefs);
};


//2. Simplify the JSX inside renderTaskOverview
// Replace lines 2026–2036 with a direct call to the extracted handler:

<i
  className="lmnicon lmnicon-close"
  style={{
    fontSize: 10,
    cursor: isRelatedInstructionsReadOnly ? 'not-allowed' : 'pointer',
    color: isRelatedInstructionsReadOnly ? '#aaa' : '#666',
  }}
  onClick={() => handleRemoveRelatedInstruction(id)}
/>