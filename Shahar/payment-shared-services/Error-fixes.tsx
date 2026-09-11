// File 2: Usage in InstructionDetailPage.tsx
// 1. Add Indexing & Navigation Handler (above line 1399)


// Track active LATAM account row index for record flipping
const selectedLatamIndex = useMemo(() => {
  if (!selectedRowData || !instructionAccounts) return undefined;
  const idx = instructionAccounts.findIndex(
    (acc) =>
      acc === selectedRowData ||
      ((acc as any)?.id != null && (acc as any)?.id === (selectedRowData as any)?.id)
  );
  return idx >= 0 ? idx : undefined;
}, [instructionAccounts, selectedRowData]);

// Handle Next / Previous account navigation
const handleNavigateLatamAccount = useCallback((direction: 'prev' | 'next') => {
  if (!selectedRowData || !instructionAccounts || instructionAccounts.length === 0) return;
  const currentIndex = instructionAccounts.findIndex(
    (acc) =>
      acc === selectedRowData ||
      ((acc as any)?.id != null && (acc as any)?.id === (selectedRowData as any)?.id)
  );
  if (currentIndex < 0) return;

  const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  const target = instructionAccounts[targetIndex];
  if (target) {
    setSelectedRowData(target);
  }
}, [selectedRowData, instructionAccounts]);



// 2. Mount Modal in JSX (replacing lines 3356–3392)


{instruction && instruction.region !== 'NAM' && (
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
            debtorAccountNumber: String(selectedRowData.debitAccountNumber || ''),
            instructedAmountCurrencyCode: String(selectedRowData.currency || 'USD'),
            instructedAmount: typeof selectedRowData.amount === 'number' ? selectedRowData.amount : 0,
            debtorName: (instruction as any)?.clientName || (instruction as any)?.dealName || '',
            painPaymentMethodType: selectedRowData.transactionType || 'CBT',
            requestedExecutionDate: (instruction as any)?.valueDate || new Date().toISOString().split('T')[0],
          }
        : null
    }
    onPaymentSuccess={(refId?: string, payload?: Pain001Model) => {
      notification.success({
        title: 'Payment Processed',
        content: `Payment instruction ${refId || ''} processed successfully.`,
      });
      setShowSplitMakerModal(false);
      setSelectedRowData(null);
      loadAll();
    }}
  />
)}




// Step 1: Add the Open Handler
// In the component containing this Card (or directly in 
// InstructionDetailPage.tsx near your other handlers):


const handleAddPayment = () => {
  setSelectedRowData(null);
  setActivePaymentMode('maker');
  setShowSplitMakerModal(true);
};



  // Step 2: Update the Card JSX (Lines 554–559 in image_17.png)
/// Replace lines 554–559 with:

return (
  <Card className="lmn-mb-12px">
    <Card header>
      <El className="lmn-d-flex lmn-justify-content-between lmn-align-items-center" style={{ width: '100%' }}>
        <span>Payment Info</span>
        <Button
          color="primary"
          size="sm"
          onClick={handleAddPayment}
        >
          <Icon type="plus" style={{ marginRight: 6 }} /> Add Payment
        </Button>
      </El>
    </Card>
    <Card body>{content}</Card>
  </Card>
);  








// POPULATING SSPAYMENT COMPONENT IN A MODAL


// Step 1: Manage Modal State and Handler
// In InstructionDetailPage.tsx:


const [showAddPaymentModal, setShowAddPaymentModal] = useState<boolean>(false);

const handleOpenAddPayment = useCallback(() => {
  setShowAddPaymentModal(true);
}, []);

const handleCloseAddPayment = useCallback(() => {
  setShowAddPaymentModal(false);
}, []);


// Step 2: Wire the "Add Payment" Button in the Card Header
// Update lines 554–559 where the Payment Info <Card> is defined:


<Card className="lmn-mb-12px">
  <Card header>
    <El className="lmn-d-flex lmn-justify-content-between lmn-align-items-center" style={{ width: '100%' }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>Payment Info</span>
      <El className="lmn-d-flex lmn-align-items-center" style={{ gap: 8 }}>
        <Button
          color="primary"
          size="sm"
          onClick={handleOpenAddPayment}
        >
          <Icon type="plus" style={{ marginRight: 4 }} /> Add Payment
        </Button>
      </El>
    </El>
  </Card>
  <Card body>{content}</Card>
</Card>


//Step 3: Mount the Modal with Transparent Background
// Mount the modal in the modal declaration area (near line 3350+). 
// Apply custom styles to ensure the backdrop and modal card render 
// transparently without the default opaque white box:


<Modal
  visible={showAddPaymentModal}
  onCancel={handleCloseAddPayment}
  onClose={handleCloseAddPayment}
  footer={null}
  closable
  width="85vw"
  style={{
    background: 'transparent',
    boxShadow: 'none',
  }}
  bodyStyle={{
    background: 'transparent',
    padding: 0,
  }}
  maskStyle={{
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(2px)',
  }}
>
  <El
    style={{
      background: 'rgba(255, 255, 255, 0.96)',
      borderRadius: 8,
      padding: 20,
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
    }}
  >
    <PaymentParent
      mode="maker"
      initialData={null}
      hideTabs={false}
      onPaymentSuccess={(refId?: string, payload?: Pain001Model) => {
        notification.success({
          title: 'Payment Created',
          content: `Payment instruction ${refId || ''} created successfully.`,
        });
        setShowAddPaymentModal(false);
        loadAll();
      }}
      onClose={handleCloseAddPayment}
    />
  </El>
</Modal>



// Step 1: Destructure onAddPayment in PaymentInfoCard
// Scroll up to line 511 where const PaymentInfoCard = 
// ({ ... }) is declared. Add onAddPayment to the destructured props:


const PaymentInfoCard = ({
  // ... existing props like rows, onEditRow, instruction, etc.
  onAddPayment,
}: {
  // if typed inline:
  [key: string]: any;
  onAddPayment?: () => void;
}) => {


  // Step 2: Use onAddPayment on line 567
//Replace onClick={handleOpenAddPayment} with onClick={onAddPayment}:


<Button
  color="primary"
  size="sm"
  onClick={onAddPayment}
>
  <Icon type="plus" style={{ marginRight: 4 }} /> Add Payment
</Button>



// function fix

const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const newIsValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev === newIsValid ? prev : newIsValid));
  setCheckerDualBlindPassed((prev) => (prev === newDualBlind ? prev : newDualBlind));

  if (output?.paymentData) {
    setCurrentFormPayload((prev) => {
      // Prevent re-render if payload content hasn't changed
      if (prev && JSON.stringify(prev) === JSON.stringify(output.paymentData)) {
        return prev;
      }
      return output.paymentData;
    });
  }
}, []);


// end point gab backend server

const endpoint = '/nextgengab/api/api/v1/gab/payments/createMakerPayment';