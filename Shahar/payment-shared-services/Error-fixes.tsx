// File 1: src/pages/ss-payment/PaymentParent.tsx
// Replace the dynamicPaymentInput, handlePaymentOutput, and 
// handleMakerSubmit blocks (lines 249–375) with the following stabilized code:


// 1. Stabilize the initial payment model reference so it doesn't re-create every render
const stableInitialPaymentModel = useMemo(() => {
  return initialData ? { ...createEmptyPain001(), ...initialData } : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialData?.debtorAccountNumber, initialData?.instructedAmount]);

// 2. Stabilize dynamicPaymentInput to stop the top-down re-render cascade
const dynamicPaymentInput: PaymentComponentInput = useMemo(() => {
  switch (activeTab) {
    case 'repair':
      return {
        applicationName: 'ADR',
        applicationModule: 'ADR',
        currency: initialData?.instructedAmountCurrencyCode ?? 'USD',
        paymentMode: 'repair',
        dualBlindKeyFlag: 'N',
        paymentModel: stableInitialPaymentModel,
      };
    case 'checker':
      return {
        applicationName: 'ADR',
        applicationModule: 'ADR',
        currency: initialData?.instructedAmountCurrencyCode ?? 'USD',
        paymentMode: 'checker',
        dualBlindKeyFlag: 'Y',
        paymentModel: stableInitialPaymentModel,
      };
    default:
      return {
        applicationName: 'ADR',
        applicationModule: 'ADR',
        currency: initialData?.instructedAmountCurrencyCode ?? 'USD',
        paymentMode: 'maker',
        dualBlindKeyFlag: 'N',
        paymentModel: stableInitialPaymentModel,
      };
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  activeTab,
  stableInitialPaymentModel,
  activeSubmittedTransaction?.id,
  repairReviewFieldList,
]);

// 3. Output handler with pData extraction, JSON guard, and TypeScript cast
const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  const pData: any = output?.paymentData;
  if (!pData) return;

  const makerSSPaymentPayload = {
    txndId: instructionId ? String(instructionId) : undefined,
    maker: currentUserId || 'SS71872',
    paymentDetailsRequest: {
      requestedExecutionDate: pData.requestedExecutionDate || pData.valueDate || '',
      debtorName: pData.debtorName || '',
      source: 'UI',
      debtorAccountNumber: pData.debtorAccountNumber || '',
      debtorAgentBIC: pData.debtorAgentBIC || '',
      debtorAgentBank: pData.debtorAgentBank || '',
      chargeBearer: pData.chargeBearer || 'DEBT',
      chargesAmount: pData.chargesAmount || '',
      chargesAgentBIC: pData.chargesAgentBIC || '',
      debtorAddressLines: pData.debtorAddressLines || '',
      debtorStreetName: pData.debtorStreetName || '',
      debtorBuildingNumber: pData.debtorBuildingNumber || '',
      debtorPostalCode: pData.debtorPostalCode || '',
      debtorTownName: pData.debtorTownName || '',
      debtorCountrySubDivision: pData.debtorCountrySubDivision || '',
      debtorCountryCode: pData.debtorCountryCode || '',
      debtorSortCodeUK: pData.debtorSortCodeUK || '',
      debtorSortCodeUS: pData.debtorSortCodeUS || '',
      debtorAddressLines1: pData.debtorAddressLines1 || pData.debtorAddressLine1 || '',
      debtorAddressLines2: pData.debtorAddressLines2 || pData.debtorAddressLine2 || '',
      debtorState: pData.debtorState || '',
      instructedAmount: pData.instructedAmount != null ? String(pData.instructedAmount) : '',
      instructedAmountCurrencyCode: pData.instructedAmountCurrencyCode || pData.currency || 'USD',
      creditorName: pData.creditorName || '',
      creditorAccount: pData.creditorAccount || '',
      creditorAgentAccountNumber: pData.creditorAgentAccountNumber || '',
      creditorAgentFinancialInstitutionBIC: pData.creditorAgentFinancialInstitutionBIC || '',
      creditorAgentFinancialInstitutionName: pData.creditorAgentFinancialInstitutionName || '',
      creditorAgentPostalAddress: pData.creditorAgentPostalAddress || '',
      creditorAddressLines: pData.creditorAddressLines || '',
      creditorStreetName: pData.creditorStreetName || '',
      creditorBuildingNumber: pData.creditorBuildingNumber || '',
      creditorPostalCode: pData.creditorPostalCode || '',
      creditorTownName: pData.creditorTownName || '',
      creditorCountrySubDivision: pData.creditorCountrySubDivision || '',
      creditorCountryCode: pData.creditorCountryCode || '',
      creditorSortCodeUK: pData.creditorSortCodeUK || '',
      creditorSortCodeUS: pData.creditorSortCodeUS || '',
      creditorAddressLines1: pData.creditorAddressLines1 || pData.creditorAddressLine1 || '',
      creditorAddressLines2: pData.creditorAddressLines2 || pData.creditorAddressLine2 || '',
      creditorState: pData.creditorState || '',
      ustrdPaymentDetails: pData.ustrdPaymentDetails || '',
      painPaymentMethodType: pData.painPaymentMethodType || 'CBT',
      firstIntermediaryBankBIC: pData.firstIntermediaryBankBIC || '',
      firstIntermediaryBankRoutingCode: pData.firstIntermediaryBankRoutingCode || '',
      firstIntermediaryBankName: pData.firstIntermediaryBankName || '',
      firstIntermediaryBankCountryCode: pData.firstIntermediaryBankCountryCode || '',
      firstIntermediaryBankAccountID: pData.firstIntermediaryBankAccountID || '',
      secondIntermediaryBankBIC: pData.secondIntermediaryBankBIC || '',
      secondIntermediaryBankRoutingCode: pData.secondIntermediaryBankRoutingCode || '',
      secondIntermediaryBankName: pData.secondIntermediaryBankName || '',
      secondIntermediaryBankCountryCode: pData.secondIntermediaryBankCountryCode || '',
      secondIntermediaryBankAccountID: pData.secondIntermediaryBankAccountID || '',
      applicationName: 'GAB-LATAM',
      applicationModule: 'GAB-LATAM',
      region: 'LATAM',
      paymentId: pData.paymentId || 'PAY-2024-001',
      taxIdNumber: instructionId ? String(instructionId) : '',
      purposeOfPayment: pData.purposeOfPayment || '',
      taxIdType: instructionId ? String(instructionId) : '',
      taxPurposeCode: pData.taxPurposeCode || '',
      regulatoryReportingCode: pData.regulatoryReportingCode || '',
      invoiceReferenceNumber: pData.invoiceReferenceNumber || '',
    },
    dupValidityCheckDays: 30,
    duplicateCheckFieldList: ['debtorAccountNumber', 'instructedAmount'],
    overrideDuplicate: false,
    duplicateRefId: '',
    duplicateInputDataModel: {},
  };

  setCurrentFormPayload((prev: any) => {
    if (prev && JSON.stringify(prev) === JSON.stringify(makerSSPaymentPayload)) {
      return prev;
    }
    console.log('makerSSPaymentPayload line 360 :', makerSSPaymentPayload);
    return makerSSPaymentPayload as any;
  });
}, [currentUserId, instructionId]);

// 4. API Submit function targeting the correct proxied backend endpoint
const handleMakerSubmit = async (overrideDuplicate = false) => {
  if (!currentFormPayload || !isCurrentFormValid) return;
  setIsSubmitting(true);

  const endpoint = '/nextgengab/api/api/v1/gab/payments/createMakerPayment';

  const payload = {
    ...currentFormPayload,
    loginUser: soeId || currentUserId || 'SS71872',
    overrideDuplicateFlag: overrideDuplicate ? 'Y' : 'N',
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        SOEID: soeId || currentUserId || 'SS71872',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Submission failed with status ${res.status}`);
    }

    const data = await res.json();
    onPaymentSuccess?.(data?.referenceId || data?.paymentId, payload);
    onClose?.();
  } catch (err: any) {
    console.error('Submission failed:', err);
  } finally {
    setIsSubmitting(false);
  }
};


// File 2: src/pages/instructions/InstructionDetailPage.tsx
// Ensure the hook declarations are inside InstructionDetailPage 
// (around line 876) and wired to PaymentInfoCard and the Modal:

// 1. Inside InstructionDetailPage() Component Body


export default function InstructionDetailPage() {
  const [showAddPaymentModal, setShowAddPaymentModal] = useState<boolean>(false);

  const handleOpenAddPayment = useCallback(() => {
    setShowAddPaymentModal(true);
  }, []);

  const handleCloseAddPayment = useCallback(() => {
    setShowAddPaymentModal(false);
  }, []);

  // ... existing InstructionDetailPage state

  // 2. Pass onAddPayment to <PaymentInfoCard> (around line 2183)

  <PaymentInfoCard
  // ... other props
  onAddPayment={handleOpenAddPayment}
/>



// 3. Update PaymentInfoCard Header (lines 557–574)

return (
  <Card className="lmn-mb-12px">
    <Card header>
      <El className="lmn-d-flex lmn-justify-content-between lmn-align-items-center" style={{ width: '100%' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Payment Info</span>
        <Button
          color="primary"
          size="sm"
          onClick={onAddPayment}
        >
          <Icon type="plus" style={{ marginRight: 4 }} /> Add Payment
        </Button>
      </El>
    </Card>
    <Card body>{content}</Card>
  </Card>
);

// 4. Add Payment Modal Declaration (near line 3460)


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
>
  <El
    style={{
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: 8,
      padding: 24,
      maxHeight: '82vh',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    }}
  >
    <PaymentParent
      mode="maker"
      initialData={null}
      hideTabs={false}
      onPaymentSuccess={(refId?: string) => {
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