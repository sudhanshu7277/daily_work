// 1. Updated Callbacks on <PaymentParent>
// In InstructionDetailPage.tsx (lines 3634–3648), 
// leave showAddPaymentModal(true) alone inside both callbacks
//  so the maker modal stays visible behind the alert:

<PaymentParent
  mode="maker"
  instructionId={instructionId}
  initialData={null}
  onPaymentSuccess={(refId?: string) => {
    // Keep maker modal visible behind the alert
    setPaymentSuccessInfo({ refId: refId || 'N/A' });
    loadAll();
  }}
  onPaymentError={(errorMessage: string) => {
    // Keep maker modal visible behind the alert
    setPaymentErrorInfo(errorMessage);
  }}
  onClose={handleCloseAddPayment}
/>


// 2. Success & Failure Modals (Closes Both on Dismiss)
// Add these modal definitions right after the Add Payment modal. 
// Setting zIndex={1300} ensures they sit on top of the payment modal, and their 
// dismiss handlers close both the alert and showAddPaymentModal:

{/* Success Modal - Displays on top, closes both on dismissal */}
<Modal
  visible={Boolean(paymentSuccessInfo)}
  title="Payment Instruction Created"
  closable
  zIndex={1300}
  style={{ zIndex: 1300 }}
  onClose={() => {
    setPaymentSuccessInfo(null);
    setShowAddPaymentModal(false);
  }}
  onCancel={() => {
    setPaymentSuccessInfo(null);
    setShowAddPaymentModal(false);
  }}
  footer={
    <El className="lmn-d-flex lmn-justify-content-end">
      <Button
        color="primary"
        onClick={() => {
          setPaymentSuccessInfo(null);
          setShowAddPaymentModal(false);
        }}
      >
        OK
      </Button>
    </El>
  }
>
  <El className="lmn-d-flex lmn-align-items-center" style={{ gap: 16, padding: '12px 0' }}>
    <Icon type="check-circle" style={{ color: '#2e7d32', fontSize: 32 }} />
    <El>
      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#2e7d32' }}>
        Payment instruction created successfully!
      </p>
      <p style={{ margin: '4px 0 0 0', color: '#555', fontSize: 13 }}>
        Reference ID: <strong>{paymentSuccessInfo?.refId}</strong>
      </p>
    </El>
  </El>
</Modal>

{/* Failure Modal - Displays on top, closes both on dismissal */}
<Modal
  visible={Boolean(paymentErrorInfo)}
  title="Payment Submission Failed"
  closable
  zIndex={1300}
  style={{ zIndex: 1300 }}
  onClose={() => {
    setPaymentErrorInfo(null);
    setShowAddPaymentModal(false);
  }}
  onCancel={() => {
    setPaymentErrorInfo(null);
    setShowAddPaymentModal(false);
  }}
  footer={
    <El className="lmn-d-flex lmn-justify-content-end">
      <Button
        color="danger"
        onClick={() => {
          setPaymentErrorInfo(null);
          setShowAddPaymentModal(false);
        }}
      >
        Dismiss
      </Button>
    </El>
  }
>
  <El className="lmn-d-flex lmn-align-items-start" style={{ gap: 16, padding: '12px 0' }}>
    <Icon type="times-circle" style={{ color: '#d32f2f', fontSize: 32, marginTop: 2 }} />
    <El style={{ flex: 1 }}>
      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#d32f2f' }}>
        Unable to process payment instruction
      </p>
      <p
        style={{
          margin: '8px 0 0 0',
          fontSize: 12,
          color: '#333',
          background: '#fff3f3',
          border: '1px solid #ffcdd2',
          padding: '8px 12px',
          borderRadius: 4,
          fontFamily: 'monospace',
          wordBreak: 'break-word',
        }}
      >
        {paymentErrorInfo}
      </p>
    </El>
  </El>
</Modal>


