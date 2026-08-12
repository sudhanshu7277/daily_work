// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx

// Step 1: Add the Handler Function
// Add this handler function inside SetupInstructionModal next 
// to your other handlers (such as handleRemoveRelatedInstruction):

const handleToggleRelatedInstruction = (targetId: number) => {
  if (isRelatedInstructionsReadOnly) return;

  const currentIds = (form.relatedInstructionIds ?? []) as number[];
  const isSelected = currentIds.includes(targetId);
  const newIds = isSelected
    ? currentIds.filter((x) => x !== targetId)
    : [...currentIds, targetId];

  const getRef = (nid: number) =>
    adminMakerInstructions.find((i) => i.instructionId === nid)?.instructionRef;

  const newRefs = newIds.map(getRef).filter(Boolean).join(', ');

  updateField('relatedInstructionIds', newIds);
  updateField('relatedInstructions', newRefs);
};


// Step 2: Replace Lines 2089 to 2134 in JSX
// Replace the entire block (lines 2089–2134) with this clean code:

{(() => {
  const relatedIds = (form.relatedInstructionIds ?? []) as number[];
  const searchLower = relatedInstructionSearch.toLowerCase();

  return relatedInstructionOptions
    .filter((opt) => opt.label.toLowerCase().includes(searchLower))
    .map((opt) => {
      const numId = Number(opt.value);
      const isSelected = relatedIds.includes(numId);

      return (
        <El
          key={opt.value}
          role="option"
          aria-selected={isSelected}
          tabIndex={0}
          className="lmn-d-flex lmn-align-items-center"
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            background: isSelected ? '#f0f5ff' : 'transparent',
            borderBottom: '1px solid #f0f0f0',
            fontSize: 12,
            gap: 8,
          }}
          onClick={() => handleToggleRelatedInstruction(numId)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggleRelatedInstruction(numId);
            }
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            style={{ cursor: 'pointer' }}
          />
          <span>{opt.label}</span>
        </El>
      );
    });
})()}


// Refactored JSX Block
// Replace lines 2117 through 2138 with this clean <label> structure:


return (
  <label
    key={opt.value}
    className="lmn-d-flex lmn-align-items-center"
    style={{
      padding: '8px 12px',
      cursor: 'pointer',
      background: isSelected ? '#f0f5ff' : 'transparent',
      borderBottom: '1px solid #f0f0f0',
      fontSize: 12,
      gap: 8,
      display: 'flex',
    }}
  >
    <input
      type="checkbox"
      checked={isSelected}
      onChange={() => handleToggleRelatedInstruction(numId)}
      style={{ cursor: 'pointer' }}
    />
    <span>{opt.label}</span>
  </label>
);