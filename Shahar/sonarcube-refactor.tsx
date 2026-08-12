// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx

// Refactored Code (Without IIFE)
//1. Add pre-computations at the top of renderTaskOverview
//Inside renderTaskOverview, place these variables right before its return ( statement:

const relatedIds = (form.relatedInstructionIds ?? []) as number[];
const searchLower = (relatedInstructionSearch ?? '').toLowerCase();

const filteredRelatedOptions = (relatedInstructionOptions ?? []).filter((opt) =>
  (opt.label ?? '').toLowerCase().includes(searchLower)
);


// Part 2: Replace the JSX block (Lines 2089–2134)
// Replace the entire mapping block (lines 2089 to 2134) in your JSX with:

{filteredRelatedOptions.map((opt) => {
  const numId = Number(opt.value);
  const isSelected = relatedIds.includes(numId);

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
})}


// id fix

<El key={row.id ?? `account-row-${idx}`} className="lmn-d-flex lmn-mb-8px lmn-align-items-center"></El>