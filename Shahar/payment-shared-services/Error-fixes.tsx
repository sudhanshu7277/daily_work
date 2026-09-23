// Looking at image_50.png, the exact reason the data isn't populating into the form is found on lines 970–973:

const stableInitialPaymentModel = useMemo(() => 
  return initialData ? { ...createEmptyPain001(), ...initialData } : null;
// // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialData?.debtorAccountNumber, initialData?.instructedAmount]);


// The Fix
// Step 1: In PaymentParent.tsx, Update stableInitialPaymentModel (around line 970)
// Flatten all incoming stages (initialData, matchedAction, actionDetails, 
// paymentDetailsRequest) into stableInitialPaymentModel, and depend directly on initialData:


const stableInitialPaymentModel = useMemo(() => {
  if (!initialData) return null;

  const raw = initialData as any;
  const nestedDetails =
    raw.paymentDetailsRequest ||
    raw.actionDetails ||
    raw.matchedAction ||
    {};

  return {
    ...createEmptyPain001(),
    // 1. Base row/account properties
    ...raw,
    // 2. Extracted action/stage properties from API
    ...nestedDetails,
    // 3. Normalized critical fields
    debtorAccountNumber: String(
      raw.debtorAccountNumber ||
      raw.debitAccountNumber ||
      nestedDetails.debtorAccountNumber ||
      ''
    ).replace(/\//g, '').trim(),
    instructedAmount: String(
      raw.instructedAmount ??
      raw.amount ??
      nestedDetails.instructedAmount ??
      ''
    ),
    instructedAmountCurrencyCode:
      raw.instructedAmountCurrencyCode ||
      raw.currency ||
      nestedDetails.instructedAmountCurrencyCode ||
      'USD',
    paymentId: String(
      raw.accountId ||
      raw.paymentId ||
      nestedDetails.paymentId ||
      ''
    ),
  };
}, [initialData]);


// Step 2: Ensure dynamicPaymentInput Always Hands Over stableInitialPaymentModelIn 
// PaymentParent.tsx (lines 976–1004 in image_50.png / image_51.png), 
// ensure every mode (maker, checker, repair) feeds paymentModel: stableInitialPaymentModel:   

const dynamicPaymentInput: PaymentComponentInput = useMemo(() => {
  const baseInput = {
    applicationName: 'GAB',
    applicationModule: 'GAB-LATAM',
    currency: initialData?.instructedAmountCurrencyCode ?? initialData?.currency ?? 'USD',
    paymentModel: stableInitialPaymentModel,
  };

  switch (activeTab) {
    case 'repair':
      return {
        ...baseInput,
        paymentMode: 'repair',
        dualBlindKeyFlag: 'N',
      };
    case 'checker':
      return {
        ...baseInput,
        paymentMode: 'checker',
        dualBlindKeyFlag: 'Y',
        dualBlindKeyFields: DUAL_BLIND_REKEY_FIELDS,
      };
    case 'maker':
    default:
      return {
        ...baseInput,
        paymentMode: 'maker',
        dualBlindKeyFlag: 'N',
      };
  }
}, [activeTab, initialData, stableInitialPaymentModel]);


// Step 3: Verify the <SSPaymentFlow .../> Mount Call
// In PaymentParent.tsx lines 1448–1453 (image_48.png / image_52.png), 
// pass stableInitialPaymentModel directly to initialData so SSPaymentFlow 
// gets the merged dataset regardless of mode:


<SSPaymentFlow
  key={`${activeTab}-${initialData?.accountId || initialData?.paymentId || initialData?.transactionId || initialData?.debtorAccountNumber || 'new'}`}
  paymentInput={dynamicPaymentInput}
  fieldConfig={dynamicFieldConfig as any}
  initialData={(stableInitialPaymentModel ?? initialData) as any}
  isMakerMode={activeTab === 'maker'}
  isCheckerMode={activeTab === 'checker'}
  isRepairMode={activeTab === 'repair'}
  repairReviewFieldList={activeTab === 'repair' ? repairReviewFieldList : undefined}
  repairNewlyModifyFieldList={activeTab === 'repair' ? repairNewlyModifiedFields : undefined}
  hardcapResultReceived={activeTab === 'maker' ? makerHardcapResult : undefined}
  onAmountChange={activeTab === 'maker' ? handleAmountChange : undefined}
  onFailedFieldListChange={activeTab === 'checker' ? setCheckerFailedFields : undefined}
  onFormChange={handleFormChange}
  onPaymentOutput={handlePaymentOutput}
/>






const dynamicPaymentInput: PaymentComponentInput = useMemo(() => {
  const rawData = initialData as any;
  const resolvedCurrency = String(
    rawData?.instructedAmountCurrencyCode ||
    rawData?.currency ||
    'USD'
  );

  const baseInput = {
    applicationName: 'GAB',
    applicationModule: 'GAB-LATAM',
    currency: resolvedCurrency,
    paymentModel: stableInitialPaymentModel,
  };

  switch (activeTab) {
    case 'repair':
      return {
        ...baseInput,
        paymentMode: 'repair',
        dualBlindKeyFlag: 'N',
      };
    case 'checker':
      return {
        ...baseInput,
        paymentMode: 'checker',
        dualBlindKeyFlag: 'Y',
        dualBlindKeyFields: DUAL_BLIND_REKEY_FIELDS,
      };
    case 'maker':
    default:
      return {
        ...baseInput,
        paymentMode: 'maker',
        dualBlindKeyFlag: 'N',
      };
  }
}, [activeTab, initialData, stableInitialPaymentModel]);

