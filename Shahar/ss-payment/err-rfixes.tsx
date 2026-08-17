// Step 1: Update handleMakerSubmit in PaymentParent.tsx
// diagnostic logging and use fallback payload resolution so it never 
// returns early without feedback:

const [modalData, setModalData] = useState<{
    referenceId: string;
    amount: string | number;
    status: string;
    message: string;
    isSuccess: boolean;
  } | null>(null);

  const handleMakerSubmit = async (overrideDuplicate = false) => {
    console.log('[PaymentParent] Submit clicked. Validity:', makerFormValid, 'Payload:', makerPayload);

    // Fallback if makerPayload state hasn't flushed yet
    const payloadToSend = makerPayload || { ...createEmptyPain001() };
    setIsMakerSubmitting(true);

    const endpoint = '/shared-services/api/payment/api/payments';
    const payload = {
      ...payloadToSend,
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
      console.log('[PaymentParent] API Response:', res.status, data);

      if (!res.ok) {
        if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
          if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
            await handleMakerSubmit(true);
            return;
          }
        }
        throw new Error(data?.error || data?.message || `Payment creation failed (${res.status})`);
      }

      setModalData({
        referenceId: data.referenceId || data.transactionId || data.id || 'N/A',
        amount: `${payloadToSend.instructedAmountCurrencyCode || 'USD'} ${payloadToSend.instructedAmount || '0'}`,
        status: data.status || 'SUBMITTED',
        message: 'Payment record saved successfully !',
        isSuccess: true
      });
    } catch (err: any) {
      console.error('[PaymentParent] Submit Error:', err);
      setModalData({
        referenceId: 'N/A',
        amount: `${payloadToSend.instructedAmountCurrencyCode || 'USD'} ${payloadToSend.instructedAmount || '0'}`,
        status: 'FAILED',
        message: err.message || 'Payment creation failed !',
        isSuccess: false
      });
    } finally {
      setIsMakerSubmitting(false);
    }
  };



  // Step 2: Use React Portal for the Modal (Guaranteed to Render on Top)
//Using createPortal(..., document.body) renders the modal directly at the root of the document, completely bypassing any CSS parent bounds, overflows, or z-index issues.

//Import createPortal at top of PaymentParent.tsx:


import { createPortal } from 'react-dom';


// Then replace the modal JSX at the bottom of PaymentParent.tsx with:

{/* Bulletproof Portal Modal */}
{modalData && createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={() => setModalData(null)}
    >
      <div
        style={{
          width: '460px',
          maxWidth: '90vw',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
            {modalData.isSuccess ? 'MAKER RECORD SAVED' : 'MAKER RECORD NOT CREATED'}
          </h3>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              color: '#64748b'
            }}
            onClick={() => setModalData(null)}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Sender Reference ID:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{modalData.referenceId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Amount:</span>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>{modalData.amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Status:</span>
              <span
                style={{
                  fontWeight: 600,
                  color: modalData.isSuccess ? '#059669' : '#dc2626'
                }}
              >
                {modalData.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Message:</span>
              <span style={{ color: '#334155' }}>{modalData.message}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            className="lmn-btn lmn-btn-primary"
            style={{
              padding: '8px 20px',
              backgroundColor: '#056dae',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setModalData(null)}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}


  // Step 3: Button Call
//Ensure the button uses the arrow function syntax:

<button
  type="button"
  className={!makerFormValid || isMakerSubmitting ? 'lmn-btn-unclickable lmn-btn-grey' : 'lmn-btn lmn-btn-primary'}
  disabled={!makerFormValid || isMakerSubmitting}
  onClick={() => handleMakerSubmit(false)}
>
  {isMakerSubmitting ? 'Submitting...' : 'Submit Payment'}
</button>
