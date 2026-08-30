
//1. Declare the state near your other useState calls:

const [duplicateWarning, setDuplicateWarning] = useState<{ referenceId: string } | null>(null);



//2. Update handleMakerSubmit (lines 288–294):

if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
  setDuplicateWarning({ referenceId: data.referenceId ?? 'N/A' });
  return;
}


// 3. Render the confirmation dialog in your JSX 
// (just above the closing </div> of PaymentParent.tsx):


{duplicateWarning && (
  <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div className="modal-content" style={{ background: '#fff', padding: '24px', borderRadius: '6px', maxWidth: '400px', width: '100%' }}>
      <h4>Duplicate Payment Warning</h4>
      <p>Similar payment exists with ID: <strong>{duplicateWarning.referenceId}</strong>. Do you want to proceed?</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <button
          type="button"
          className="lmn-btn"
          onClick={() => setDuplicateWarning(null)}
        >
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