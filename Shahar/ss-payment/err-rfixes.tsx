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



  /// handleSubmit function

  const handleMakerSubmit = async (overrideDuplicate: boolean | React.MouseEvent = false) => {
    const isOverride = typeof overrideDuplicate === 'boolean' ? overrideDuplicate : false;
    if (!makerPayload || !makerFormValid) return;
    setIsMakerSubmitting(true);
  
    const endpoint = '/shared-services/api/payment/api/payments';
    const payload = {
      ...makerPayload,
      loginUser: soeId,
      overrideDuplicateFlag: isOverride ? 'Y' : 'N'
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


  // modal css


  .modal {
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 99999 !important;
    display: block !important; /* Overrides Bootstrap display: none */
  }
  
  .modal-backdrop {
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: rgba(0, 0, 0, 0.55) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 99999 !important;
  }
  
  .modal-container {
    width: 480px !important;
    max-width: 90vw !important;
    background: #ffffff !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    z-index: 100000 !important;
    animation: modalFadeIn 0.2s ease-out;
  }
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .modal-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 14px 20px !important;
    border-bottom: 1px solid #e2e8f0 !important;
    background: #f8fafc !important;
  }
  
  .modal-header h3 {
    margin: 0 !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    color: #1e293b !important;
  }
  
  .modal-body {
    padding: 20px !important;
    background: #ffffff !important;
  }
  
  .modal-footer {
    padding: 12px 20px !important;
    border-top: 1px solid #e2e8f0 !important;
    background: #f8fafc !important;
    display: flex !important;
    justify-content: flex-end !important;
  }