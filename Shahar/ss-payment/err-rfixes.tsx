export const PaymentParent: FC = () => {
    // ... all other state ...
    const [displaySuccessOrFailureMessage, setDisplaysSuccessOrFailureMessage] = useState<any>(null);
  
    const handleMakerSubmit = async (overrideDuplicate = false) => {
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
          if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
            if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
              await handleMakerSubmit(true);
              return;
            }
          }
          throw new Error(data?.error || data?.message || `Payment creation failed (${res.status})`);
        }
  
        // Success payload
        setDisplaysSuccessOrFailureMessage({
          referenceId: data.referenceId || data.transactionId || data.id || 'N/A',
          status: data.status || 'SUBMITTED',
          message: 'Payment record saved successfully !',
          color: '#059669'
        });
      } catch (err: any) {
        console.error('Payment submission failed:', err);
        // Failure payload
        setDisplaysSuccessOrFailureMessage({
          referenceId: 'N/A',
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
  
    return (
      <div className="sample-container">
        <div className="parent-section-heading">Outbound ISO 20022 Payment (Maker Mode)</div>
        <div className="payment-component-wrapper">
          <PaymentChild
            paymentInput={makerPaymentInput}
            fieldConfig={PARENT_FIELD_CONFIG}
            isMakerMode={true}
            hardcapResultReceived={makerHardcapResult}
            onAmountChange={handleMakerAmountChange}
            onPaymentOutput={handleMakerOutput}
          />
        </div>
  
        <div className="action-bar">
          <button
            type="button"
            className={!makerFormValid || isMakerSubmitting ? 'lmn-btn-unclickable lmn-btn-grey' : 'lmn-btn lmn-btn-primary'}
            disabled={!makerFormValid || isMakerSubmitting}
            onClick={() => handleMakerSubmit(false)}
          >
            {isMakerSubmitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </div>
  
        {/* --- SUCCESS / FAILURE MODAL --- */}
        {displaySuccessOrFailureMessage && (
          <div id="myModal" className="modal" style={{ display: 'block' }}>
            <div className="modal-backdrop">
              <div className="modal-container">
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
                      <span className="value">
                        {makerPayload?.instructedAmountCurrencyCode} {makerPayload?.instructedAmount}
                      </span>
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
      </div>
    );
  };
  
  export default PaymentParent;