// Updated handleMakerSubmit in PaymentParent.tsx
// Replace the mock handleMakerSubmit function (lines 107–115) with the real API call:

const [displaySuccessOrFailureMessage, setDisplaysSuccessOrFailureMessage] = useState<any>(null);

  const handleMakerSubmit = async (overrideDuplicate: boolean = false) => {
    if (!makerPayload || !makerFormValid) return;
    setIsMakerSubmitting(true);

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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Handle duplicate payment alert if backend flags it
        if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
          if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
            await handleMakerSubmit(true);
            return;
          }
        }
        throw new Error(data?.error || data?.message || `Payment creation failed (${res.status})`);
      }

      setDisplaysSuccessOrFailureMessage({
        referenceId: data.referenceId || data.transactionId || data.id || 'N/A',
        status: data.status || 'SUBMITTED',
        message: 'Payment record saved successfully !',
        color: 'green'
      });
    } catch (err: any) {
      console.error('Payment submission failed:', err);
      setDisplaysSuccessOrFailureMessage({
        referenceId: 'N/A',
        status: 'FAILED',
        message: err.message || 'Payment creation failed !',
        color: 'red'
      });
    } finally {
      setIsMakerSubmitting(false);
    }
  };

  const closeModelPopUp = () => {
    setDisplaysSuccessOrFailureMessage(null);
  };


  // Add the Success/Failure Modal in PaymentParent.tsx (Before Closing </div>)
 // Add this JSX right before the last closing </div> 
 // in PaymentParent.tsx to render the pop-up when the response returns:

 {/* Success / Error Response Modal */}
 {displaySuccessOrFailureMessage && (
    <div id="myModal" className="modal">
      <div className="modal-backdrop">
        <div className="modal-container">
          <header className="modal-header">
            <h3>
              {displaySuccessOrFailureMessage.message === 'Payment record saved successfully !'
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
                <span className="value"><strong>{displaySuccessOrFailureMessage.referenceId}</strong></span>
              </div>
              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value">
                  {makerPayload?.instructedAmountCurrencyCode} {makerPayload?.instructedAmount}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`value status-${displaySuccessOrFailureMessage.status?.toLowerCase()}`} style={{ color: displaySuccessOrFailureMessage.color }}>
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