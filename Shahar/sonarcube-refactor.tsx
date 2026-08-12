// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx

// Refactored Code (Lines 3329–3339)
Replace lines 3329 through 3339 with:

<button
  type="button"
  className="btn-unstyled"
  onClick={() => handleDownloadExistingDoc(doc)}
  title={`Download ${doc.fileName}`}
  style={{
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: 'var(--lmn-link-color, #1890ff)',
    textDecoration: 'underline',
    display: 'inline-flex',
    alignItems: 'center',
  }}
>
  <Icon type="download" className="lmn-mr-4px" />
  {doc.fileName}
</button>


// Refactored Code (Lines 1884–1889)
//Replace lines 1884 through 1889 with:

const resolvedInstructionType =
  form.requestType === REQUEST_TYPES.ADMINISTRATIVE || isNonPayment
    ? "Non-Payment"
    : "Payment";