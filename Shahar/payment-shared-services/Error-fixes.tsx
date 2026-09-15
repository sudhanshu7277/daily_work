// 1. PaymentParent.tsx
// A. Add onPaymentError to component props interface:

export interface PaymentParentProps {
  mode: string;
  instructionId?: string | number;
  initialData?: any;
  onPaymentSuccess?: (refId?: string, payload?: any) => void;
  onPaymentError?: (errorMessage: string) => void;
  onClose?: () => void;
  // ... other existing props
}


// B. Update handleMakerSubmit (lines ~350–390):

const handleMakerSubmit = async (isDraft: boolean = false) => {
  try {
    setIsSubmitting(true);

    const response = await createMakerPayment(currentFormPayloadRef.current);

    const refId =
      response?.data?.referenceId ||
      response?.data?.paymentReferenceId ||
      response?.data?.id ||
      'N/A';

    onPaymentSuccess?.(refId, currentFormPayloadRef.current);
  } catch (err: any) {
    console.error('Payment submission failed:', err);
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      (err?.response?.status ? `Submission failed with status ${err.response.status}` : 'Payment submission failed');
    onPaymentError?.(msg);
  } finally {
    setIsSubmitting(false);
  }
};

// 2. SplitPaymentMakerModal.tsx
// A. Add onPaymentError to its interface (top of file):


export interface SplitPaymentMakerModalProps {
  isOpen: boolean;
  instructionId?: string | number;
  mode?: string;
  wireIndex?: number;
  movementAmount?: string;
  documents?: any[];
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalCount?: number;
  initialData?: any;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onClose: () => void;
  onPaymentSuccess?: (refId?: string, payload?: any) => void;
  onPaymentError?: (errorMessage: string) => void;
}


// B. Forward callbacks to <PaymentParent> (lines ~756–766):


<PaymentParent
  mode={mode}
  instructionId={instructionId}
  initialData={initialData}
  onPaymentSuccess={(refId?: string, payload?: any) => {
    onPaymentSuccess?.(refId, payload);
    onClose();
  }}
  onPaymentError={(errorMessage: string) => {
    onPaymentError?.(errorMessage);
    onClose();
  }}
  onClose={onClose}
/>


// 3. InstructionDetailPage.tsx
// A. Update <SplitPaymentMakerModal> props (lines ~5576–5587):


<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  instructionId={instructionId}
  mode={activePaymentMode}
  wireIndex={selectedLatamIndex}
  movementAmount={selectedRowData?.amount ? String(selectedRowData.amount) : undefined}
  documents={Array.isArray(documents) && documents.length > 0 ? documents : (instruction as any)?.documents || []}
  hasPrev={selectedLatamIndex !== undefined && selectedLatamIndex > 0}
  hasNext={selectedLatamIndex !== undefined && selectedLatamIndex < instructionAccounts.length - 1}
  currentIndex={selectedLatamIndex !== undefined ? selectedLatamIndex + 1 : 1}
  totalCount={instructionAccounts?.length || 1}
  onNavigate={handleNavigateLatamAccount}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  initialData={
    selectedRowData
      ? {
          debtorAccountNumber: String(selectedRowData.debitAccountNumber || '').replace(/\//g, ''),
          instructedAmountCurrencyCode: String(selectedRowData.currency || 'USD'),
          instructedAmount: typeof selectedRowData.amount === 'number' ? selectedRowData.amount : 0,
          debtorName: (instruction as any)?.clientName || (instruction as any)?.dealName || '',
          painPaymentMethodType: selectedRowData.transactionType || 'CBT',
          requestedExecutionDate: (instruction as any)?.valueDate || new Date().toISOString().split('T')[0],
        }
      : null
  }
  onPaymentSuccess={(refId?: string) => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
    setPaymentSuccessInfo({ refId: refId || 'N/A' });
    loadAll();
  }}
  onPaymentError={(errorMessage: string) => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
    setPaymentErrorInfo(errorMessage);
  }}
/>

// B. Add / Update the Success & Failure Modals 
// (near lines ~5640 or right after the Split/Add Modals):


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
      <Button color="primary" onClick={() => setPaymentSuccessInfo(null)}>
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
      <Button color="danger" onClick={() => setPaymentErrorInfo(null)}>
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

