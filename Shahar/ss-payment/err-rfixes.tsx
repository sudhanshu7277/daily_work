// Step 1: Update PaymentParent.tsx
//Replace the state declaration and handleMakerSubmit function to ensure:

//setDisplaysSuccessOrFailureMessage is defined and in scope.

//The URL and headers match the backend contract without breaking on network failure.


// 1. State Declaration
const [displaySuccessOrFailureMessage, setDisplaysSuccessOrFailureMessage] = useState<{
    referenceId: string;
    amount?: string | number;
    status: string;
    message: string;
    color: string;
  } | null>(null);

  // 2. Submit Handler
  const handleMakerSubmit = async (overrideDuplicate = false) => {
    if (!makerPayload || !makerFormValid) return;
    setIsMakerSubmitting(true);

    // Ensure this matches your backend controller mapping:
    const endpoint = '/shared-services/api/payment/api/payments';
    
    const payload = {
      ...makerPayload,
      loginUser: soeId,
      overrideDuplicateFlag: overrideDuplicate ? 'Y' : 'N'
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'SOEID': soeId
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
          if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
            await handleMakerSubmit(true);
            return;
          }
        }
        throw new Error(data?.error || data?.message || `Payment creation failed (${res.status})`);
      }

      // Success Modal Data
      setDisplaysSuccessOrFailureMessage({
        referenceId: data.referenceId || data.transactionId || data.id || 'REF-SUCCESS',
        amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
        status: data.status || 'SUBMITTED',
        message: 'Payment record saved successfully !',
        color: '#059669'
      });
    } catch (err: any) {
      console.error('Payment submission failed:', err);
      // Failure Modal Data
      setDisplaysSuccessOrFailureMessage({
        referenceId: 'N/A',
        amount: `${makerPayload?.instructedAmountCurrencyCode || 'USD'} ${makerPayload?.instructedAmount || 0}`,
        status: 'FAILED',
        message: err.message || 'Payment creation failed !',
        color: '#dc2626'
      });
    } finally {
      setIsMakerSubmitting(false);
    }
  };

  const closeModelPopUp = () => {
    setDisplaysSuccessOrFailureMessage(null);
  };


  // Step 2: Confirm Modal Template in PaymentParent.tsx
//Ensure the modal template at the bottom of PaymentParent.tsx 
// uses displaySuccessOrFailureMessage:


{/* Modal Popup */}
{displaySuccessOrFailureMessage && (
    <div id="myModal" className="modal" style={{ display: 'block' }}>
      <div className="modal-backdrop" onClick={closeModelPopUp}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          <header className="modal-header">
            <h3>
              {displaySuccessOrFailureMessage.status !== 'FAILED'
                ? 'MAKER RECORD SAVED'
                : 'MAKER RECORD NOT CREATED'}
            </h3>
            <button
              type="button"
              className="close-btn"
              aria-label="Close"
              onClick={closeModelPopUp}
            >
              &times;
            </button>
          </header>

          <div className="modal-body">
            <div className="details-card">
              <div className="detail-row">
                <span className="label">Sender Reference ID:</span>
                <span className="value">
                  <strong>{displaySuccessOrFailureMessage.referenceId}</strong>
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value">{displaySuccessOrFailureMessage.amount}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span
                  className="value"
                  style={{ color: displaySuccessOrFailureMessage.color, fontWeight: 600 }}
                >
                  {displaySuccessOrFailureMessage.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Message:</span>
                <span className="value">{displaySuccessOrFailureMessage.message}</span>
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="lmn-btn lmn-btn-primary"
              onClick={closeModelPopUp}
            >
              OK
            </button>
          </footer>
        </div>
      </div>
    </div>
  )}