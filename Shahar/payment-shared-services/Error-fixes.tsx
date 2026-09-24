// Step 1: In InstructionDetailPage.tsx
// When clicking "Review" in the AG-Grid column, call 
// getMakerPaymentPerRecord to fetch the record details, 
// then pass that fetched record to SplitPaymentMakerModal


const handleEditOrReviewRow = async (rowData: any) => {
  const isChecker = rowData?.actionText === "Review" || rowData?.status === "PAYMENT_CHECKER";

  if (isChecker) {
    try {
      // Prepare request payload matching line 474 in image_55.png
      const payload = {
        maker: rowData?.maker || 'SS47983',
        matchedAction: {
          accountId: rowData?.accountId,
          instructionId: rowData?.instructionId || instructionId,
        },
      };

      const res = await getMakerPaymentPerRecord(payload);
      const recordData = Array.isArray(res) ? res[0] : res;

      // Merge fetched data onto rowData
      setSelectedRowData({
        ...rowData,
        ...(recordData || {}),
        paymentDetailsRequest: recordData?.paymentDetailsRequest || rowData?.paymentDetailsRequest,
        accountId: recordData?.paymentId || rowData?.accountId,
        paymentId: recordData?.paymentId || rowData?.paymentId || rowData?.accountId,
        isCheckerMode: true,
      });
    } catch (err) {
      console.error("Failed to fetch maker payment details for review:", err);
      setSelectedRowData({ ...rowData, isCheckerMode: true });
    }
  } else {
    setSelectedRowData({ ...rowData, isCheckerMode: false });
  }

  setShowSplitMakerModal(true);
};

// Step 2: In SplitPaymentMakerModal.tsx
// Ensure the modal passes the complete initialData into PaymentParent:

<SplitPaymentMakerModal ...>
  <PaymentParent
    instruction={instruction}
    instructionId={instructionId}
    activeTab={selectedRowData?.isCheckerMode ? 'checker' : 'maker'}
    initialData={selectedRowData}
    onAccountsUpdate={handleAccountsUpdate}
    onClose={handleCloseModal}
  />
</SplitPaymentMakerModal>


// Step 3: In PaymentParent.tsx
//1. Flatten the Nested paymentDetailsRequest into stableInitialPaymentModel
//The data from the API response is nested inside paymentDetailsRequest. 
// Flatten it so SSPaymentFlow receives standard top-level Pain001Model keys:


const stableInitialPaymentModel = useMemo(() => {
  if (!initialData) return null;

  const raw = initialData as any;
  const pdr = raw.paymentDetailsRequest || raw.matchedAction?.paymentDetailsRequest || raw.actionDetails || {};

  return {
    ...createEmptyPain001(),
    // 1. Base row properties
    ...raw,
    // 2. Flattened payment form fields from the API
    ...pdr,
    // 3. Normalization of dates, amounts, and account strings
    requestedExecutionDate: pdr.requestedExecutionDate
      ? String(pdr.requestedExecutionDate).split('T')[0]
      : (raw.requestedExecutionDate || ''),
    debtorAccountNumber: String(
      pdr.debtorAccountNumber || raw.debtorAccountNumber || raw.debitAccountNumber || ''
    ).replace(/\//g, '').trim(),
    instructedAmount: String(pdr.instructedAmount ?? raw.instructedAmount ?? raw.amount ?? ''),
    instructedAmountCurrencyCode:
      pdr.instructedAmountCurrencyCode || raw.instructedAmountCurrencyCode || raw.currency || 'USD',
    paymentId: String(raw.paymentId || pdr.paymentId || raw.accountId || ''),
  };
}, [initialData]);


// 2. Define the Dual-Blind Rekey Fields & Dynamic Disabled ConfigOnly keep 
// the 10 key fields enabled in Checker mode; set disabled: true on all others:   


export const DUAL_BLIND_REKEY_FIELDS: string[] = [
  'debtorName',
  'debtorAccountNumber',
  'debtorAgentBIC',
  'instructedAmount',
  'instructedAmountCurrencyCode',
  'creditorName',
  'creditorAccount',
  'creditorAgentFinancialInstitutionBIC',
  'creditorAgentFinancialInstitutionName',
  'creditorAgentPostalAddress',
];

// Inside PaymentParent:
const dynamicFieldConfig = useMemo(() => {
  const baseConfig = (PARENT_FIELD_CONFIG as FormFieldConfig[]) || [];

  if (activeTab === 'checker') {
    return baseConfig.map((cfg) => ({
      ...cfg,
      // Enabled ONLY if fieldName is in DUAL_BLIND_REKEY_FIELDS; all others disabled
      disabled: !DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName),
    }));
  }

  return baseConfig;
}, [activeTab]);


//3. Update dynamicPaymentInput
// Pass dualBlindKeyFields and flag 'Y' to PaymentComponentInput:


const dynamicPaymentInput: PaymentComponentInput = useMemo(() => {
  const rawData = initialData as any;
  const resolvedCurrency = String(
    rawData?.paymentDetailsRequest?.instructedAmountCurrencyCode ||
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

  if (activeTab === 'checker') {
    return {
      ...baseInput,
      paymentMode: 'checker',
      dualBlindKeyFlag: 'Y',
      dualBlindKeyFields: DUAL_BLIND_REKEY_FIELDS,
    };
  }

  if (activeTab === 'repair') {
    return {
      ...baseInput,
      paymentMode: 'repair',
      dualBlindKeyFlag: 'N',
    };
  }

  return {
    ...baseInput,
    paymentMode: 'maker',
    dualBlindKeyFlag: 'N',
  };
}, [activeTab, initialData, stableInitialPaymentModel]);


//4. Mount <SSPaymentFlow/>
// Pass stableInitialPaymentModel as initialData with the dynamic disabled configuration


<SSPaymentFlow
  key={`${activeTab}-${initialData?.paymentId || initialData?.accountId || 'new'}`}
  paymentInput={dynamicPaymentInput}
  fieldConfig={dynamicFieldConfig as any}
  initialData={stableInitialPaymentModel as any}
  isMakerMode={activeTab === 'maker'}
  isCheckerMode={activeTab === 'checker'}
  isRepairMode={activeTab === 'repair'}
  onFailedFieldListChange={activeTab === 'checker' ? setCheckerFailedFields : undefined}
  onFormChange={handleFormChange}
  onPaymentOutput={handlePaymentOutput}
/>






// Where the Update Happens: In your Button Click Handler (onEditRow)
//Find where you call onEditRow or handleEditRow in InstructionDetailPage.tsx 
// (the function triggered by clicking the AG-Grid button from


const handleEditRow = async (rowData: any) => {
  const isChecker =
    rowData?.actionText === "Review" ||
    rowData?.status === "PAYMENT_CHECKER" ||
    rowData?.statusCode === "MAKER";

  if (isChecker) {
    try {
      // 1. Payload matching lines 473-478 of image_46.png
      const payload = {
        maker: rowData?.maker || "SS47983",
        matchedAction: {
          accountId: rowData?.accountId,
          instructionId: rowData?.instructionId || instructionId,
        },
      };

      // 2. Fetch the saved maker payment record (from image_46.png)
      const res = await getMakerPaymentPerRecord(payload);
      const record = Array.isArray(res) ? res[0] : res;

      // 3. Put the record directly into selectedRowData!
      // This merges paymentDetailsRequest and sets accountId/paymentId
      setSelectedRowData({
        ...rowData,
        ...(record || {}),
        // Spread the nested payment details so initialData picks them up immediately
        ...((record as any)?.paymentDetailsRequest || {}),
        paymentDetailsRequest: (record as any)?.paymentDetailsRequest || rowData?.paymentDetailsRequest,
        accountId: (record as any)?.paymentId || rowData?.accountId,
        paymentId: (record as any)?.paymentId || rowData?.accountId,
      });
    } catch (err) {
      console.error("Failed to fetch maker payment per record:", err);
      setSelectedRowData(rowData);
    }
  } else {
    // Maker flow (Edit)
    setSelectedRowData(rowData);
  }

  // 4. Open the modal (triggers the JSX in image_52.png/image_53.png)
  setModalMode(isChecker ? "checker" : "maker");
  setShowSplitMakerModal(true);
};




















/////////////////////////////////////////////

.form-field-group {
  display: flex;
  flex-direction: column;
  position: relative;
  /* Increase padding-bottom so 2 stacked error messages don't collide with elements below */
  padding-bottom: 34px !important; 
  box-sizing: border-box;

  /* Target the error div container directly from SCSS */
  > div[style*="position: absolute"] {
    /* Override inline bottom:-8px to anchor below the input instead of bottom-up */
    top: calc(100% - 32px) !important;
    bottom: auto !important;
  }

  .error-text {
    position: static !important;
    color: #a12000;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
    margin: 0 0 2px 0;
    display: block;
    animation: fadeInError 0.15s ease-in-out forwards;
  }
}