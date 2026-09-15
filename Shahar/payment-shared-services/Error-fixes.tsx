// Step 1: Update PaymentParent.tsx to notify failure
//Add an onPaymentError prop callback to PaymentParentProps so the parent page catches rejected API calls.

// In PaymentParentProps interface:

interface PaymentParentProps {
  // ... existing props
  onPaymentSuccess?: (refId?: string, payload?: any) => void;
  onPaymentError?: (errorMessage: string) => void;
  onClose?: () => void;
}


// In handleMakerSubmit (inside catch):

} catch (err: any) {
  console.error('Submission failed:', err);
  const msg = err?.message || 'Payment submission failed. Please try again.';
  onPaymentError?.(msg);
} finally {
  setIsSubmitting(false);
}


//Step 2: Add Success/Failure Modal States in InstructionDetailPage.tsx
// In InstructionDetailPage.tsx, declare states to track the modals (around line 920):

const [paymentSuccessInfo, setPaymentSuccessInfo] = useState<{ refId?: string } | null>(null);
const [paymentErrorInfo, setPaymentErrorInfo] = useState<string | null>(null);

//Step 3: Wire Callbacks on <PaymentParent> (Lines 3634–3648)
// Replace the existing onPaymentSuccess block (shown in Image 51) with:

<PaymentParent
  mode="maker"
  instructionId={instructionId}
  initialData={null}
  onPaymentSuccess={(refId?: string) => {
    setShowAddPaymentModal(false);
    setPaymentSuccessInfo({ refId: refId || 'N/A' });
    loadAll();
  }}
  onPaymentError={(errorMessage: string) => {
    // Keep or close the payment modal depending on preference, then show error dialog
    setPaymentErrorInfo(errorMessage);
  }}
  onClose={handleCloseAddPayment}
/>


// Step 4: Render the Success and Failure Modals in InstructionDetailPage.tsx
// Add these two standard ICGDS <Modal> components right after the showAddPaymentModal 
// block (around line 3652):


{/* Success Modal */}
<Modal
  visible={Boolean(paymentSuccessInfo)}
  title="Payment Instruction Created"
  closable
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