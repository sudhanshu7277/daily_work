// 1. Close showAddPaymentModal on Submission Completion
// Since the submission attempt is finished (and showing the dialog), 
// close showAddPaymentModal right inside the callbacks so the Payment Maker 
// modal is dismissed and never traps the screen:

<PaymentParent
  mode="maker"
  instructionId={instructionId}
  initialData={null}
  onPaymentSuccess={(refId?: string) => {
    setShowAddPaymentModal(false); // Dismisses payment form
    setPaymentSuccessInfo({ refId: refId || 'N/A' });
    loadAll();
  }}
  onPaymentError={(errorMessage: string) => {
    setShowAddPaymentModal(false); // Dismisses payment form
    setPaymentErrorInfo(errorMessage);
  }}
  onClose={handleCloseAddPayment}
/>


// 2. Force Top-Level Stacking for the Dialogs
// To ensure the success/failure dialogs always sit in 
// front of every other layer, pass wrapClassName with an 
// explicit high z-index and set the modal style:

{/* Success Modal */}
<Modal
  visible={Boolean(paymentSuccessInfo)}
  title="Payment Instruction Created"
  closable
  wrapClassName="top-priority-modal"
  style={{ zIndex: 9999 }}
  onClose={() => setPaymentSuccessInfo(null)}
  onCancel={() => setPaymentSuccessInfo(null)}
  footer={
    <El className="lmn-d-flex lmn-justify-content-end">
      <Button
        color="primary"
        onClick={() => setPaymentSuccessInfo(null)}
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

{/* Failure Modal */}
<Modal
  visible={Boolean(paymentErrorInfo)}
  title="Payment Submission Failed"
  closable
  wrapClassName="top-priority-modal"
  style={{ zIndex: 9999 }}
  onClose={() => setPaymentErrorInfo(null)}
  onCancel={() => setPaymentErrorInfo(null)}
  footer={
    <El className="lmn-d-flex lmn-justify-content-end">
      <Button
        color="danger"
        onClick={() => setPaymentErrorInfo(null)}
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

.top-priority-modal,
.top-priority-modal ~ .lmn-modal-backdrop {
  z-index: 9999 !important;
}