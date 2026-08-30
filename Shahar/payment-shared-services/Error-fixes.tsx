// 1. PaymentParent.tsx: Safe extraction in handlePaymentOutput (Images 71 & 72)
//Problem: Depending on whether PaymentComponentOutput comes from your
//  local models or the published @citi-icg-179025/payment-flow-reactjs-ui-lib 
// package, the payload might be keyed as paymentData vs paymentModel, 
// or isValid vs isDualBlindKeyPassed.

//Fix in src/pages/ss-payment/PaymentParent.tsx (around line 258):


const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  setIsCurrentFormValid(Boolean((output as any)?.isValid ?? (output as any)?.validForm));
  setCheckerDualBlindPassed(Boolean((output as any)?.isDualBlindKeyPassed ?? (output as any)?.dualBlindKeyPassed));

  const payload = (output as any)?.paymentData ?? (output as any)?.paymentModel;
  if (payload) {
    setCurrentFormPayload(payload);
  }
}, []);


//2. InstructionDetailPage.tsx: Wrap handlePreviewDocument in useCallback (Images 73 & 74)
//Problem: handleEditPaymentAccount lists handlePreviewDocument in its dependency array, but handlePreviewDocument is an unmemoized async function recreated on every render. This forces AgGridReact context to invalidate constantly.

//Fix in src/pages/instructions/InstructionDetailPage.tsx:

//Find where handlePreviewDocument is defined (above line 1347) and wrap it in useCallback:

const handlePreviewDocument = useCallback(
  async (doc: GabInstructionDocument, force: boolean = false) => {
    // ... existing implementation body remains untouched ...
  },
  [selectedDocument, previewUrl, instructionId, documents]
);


// 3. PaymentParent.tsx: Replace window.confirm with non-blocking logic (Images 75 & 76)
//Problem: window.confirm blocks UI execution and fails corporate code scans.

//Fix in src/pages/ss-payment/PaymentParent.tsx:

//Add state:


const [duplicateWarning, setDuplicateWarning] = useState<{ referenceId: string } | null>(null);


//Replace lines 288–293:


if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
  setDuplicateWarning({ referenceId: data?.referenceId ?? 'N/A' });
  return;
}


// Render the confirmation dialog in JSX (or bind to your existing app modal component):

{duplicateWarning && (
  <div className="modal-backdrop">
    <div className="modal-dialog">
      <h4>Duplicate Payment Detected</h4>
      <p>A similar payment exists with Reference ID: {duplicateWarning.referenceId}. Do you want to proceed?</p>
      <div className="modal-actions">
        <button type="button" className="lmn-btn" onClick={() => setDuplicateWarning(null)}>
          Cancel
        </button>
        <button
          type="button"
          className="lmn-btn lmn-btn-primary"
          onClick={async () => {
            setDuplicateWarning(null);
            await handleMakerSubmit(true);
          }}
        >
          Proceed
        </button>
      </div>
    </div>
  </div>
)}


/// 4. PaymentParent.spec.tsx: Align useAuth mock property name (Images 77 & 78)
//Problem: The component executes const { soeid: soeId } = useAuth(); expecting lowercase soeid from AuthContext, but PaymentParent.spec.tsx mocked { soeId: 'sj81534' }. Because of this, soeid was undefined during test execution.

//Fix in src/pages/ss-payment/PaymentParent.spec.tsx (around lines 8–11):


vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    soeid: 'sj81534',
    soeId: 'sj81534',
    user: { soeid: 'sj81534', soeId: 'sj81534', name: 'Sudhanshu Jain' }
  })
}));

