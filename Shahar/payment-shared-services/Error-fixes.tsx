// Step 1: Real-Time Comparison in handlePaymentOutput
// In PaymentParent.tsx (around lines 1100–1110 in image_47.png),
//  implement the field-by-field verification of the 10 dual-blind 
// keys against the maker's initialData



// Helper to normalize values for string and amount matching
const normalizeValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\//g, '').replace(/,/g, '').trim().toLowerCase();
};

const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const pData: any = output?.paymentData;
  if (!pData) return;

  const rawMaker = (initialData as any)?.paymentDetailsRequest || initialData || {};

  // Compare every dual blind key between Maker Record and Checker Input
  const failedFields: string[] = [];

  if (activeTab === 'checker') {
    DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
      const makerVal = normalizeValue(rawMaker[field] ?? (rawMaker as any)?.actionDetails?.[field]);
      const checkerVal = normalizeValue(pData[field]);

      // Special handling for decimal/amount equality (e.g. "20000.00" vs "20000")
      if (field === 'instructedAmount') {
        const numMaker = parseFloat(makerVal);
        const numChecker = parseFloat(checkerVal);
        if (!checkerVal || isNaN(numChecker) || numMaker !== numChecker) {
          failedFields.push(field);
        }
      } else {
        // Standard string match
        if (!checkerVal || makerVal !== checkerVal) {
          failedFields.push(field);
        }
      }
    });

    const isAllMatched = failedFields.length === 0;
    const isLibraryPassed = Boolean(output?.isDualBlindKeyPassed);
    const passed = isAllMatched || isLibraryPassed;

    setCheckerDualBlindPassed(passed);
    setCheckerFailedFields(failedFields);
  }

  setIsCurrentFormValid(Boolean(output?.isValid));
  currentFormPayload.current = pData;

  // ... keep existing accountId resolution & makerSSPaymentPayload construction ...
}, [initialData, activeTab]);




//Step 2: Fix isCheckerApproveDisabled on Line 1519
// In PaymentParent.tsx (replace lines 1519–1520 from

// FIX: Remove "!activeSubmittedTransaction" condition
const isCheckerApproveDisabled =
  isSubmitting ||
  !checkerDualBlindPassed ||
  checkerFailedFields.length > 0;


  // Step 3: Implement the handleCheckerDecision('Approved') Call
//Uncomment lines 1322–1412 in PaymentParent.tsx 
// (from image_42.png and image_43.png) and update it to use initialData properly:


const handleCheckerDecision = async (action: 'Approved' | 'Rejected') => {
  setIsSubmitting(true);
  const endpoint = '/nextgengab/api/v1/gab/payments/checker/approve';
  const actionUpper = action === 'Rejected' ? 'REJECTED' : 'APPROVED';

  const rawInitial = (initialData as any) || {};
  const rawAction = rawInitial.paymentDetailsRequest || rawInitial.actionDetails || rawInitial;

  const resolvedPaymentId = String(
    rawInitial.paymentId ||
    rawInitial.accountId ||
    rawAction.paymentId ||
    rawAction.accountId ||
    ''
  );

  const payload = {
    loginUser: soeId || 'SS47983',
    action: actionUpper,
    comments: checkerComments?.trim() || '',
    eventRecordDate: Date.now(),
    eventType: rawAction.eventType || 'dividend',
    failedFieldList: action === 'Rejected' ? checkerFailedFields : [],
    issCode: rawAction.issCode || '',
    overrideDuplicate: false,
    parentKeyData: {
      securityId: rawAction.securityId || String(instructionId_ ?? ''),
      eventType: rawAction.eventType || 'dividend',
      issCode: rawAction.issCode || '',
      eventRecordDate: rawAction.eventRecordDate || Date.now(),
    },
    paymentDetailsRequest: currentFormPayload.current || rawAction,
    paymentId: resolvedPaymentId,
    accountId: resolvedPaymentId,
    securityId: rawAction.securityId || String(instructionId_ ?? ''),
    transactionId: String(instructionId_ ?? ''),
    txnId: String(instructionId_ ?? ''),
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        SOEID: soeId || 'SS47983',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Checker approve failed with status ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));

    setModalResponse({
      title: 'CHECKER APPROVAL SUCCESSFUL',
      referenceId: data.transactionId || instructionId_,
      amount: `${rawAction.instructedAmountCurrencyCode || 'USD'} ${rawAction.instructedAmount || ''}`,
      status: 'APPROVED',
      message: 'Payment approved and released to clearing successfully!',
      color: '#002d72',
    });
  } catch (err: any) {
    setModalResponse({
      title: 'ACTION FAILED',
      referenceId: instructionId_,
      status: 'ERROR',
      message: err?.message || 'Failed to approve payment instruction.',
      color: '#d64545',
    });
  } finally {
    setIsSubmitting(false);
  }
};


//Step 4: Verify the Footer Buttons in JSX
//Make sure the modal footer buttons are wired to the disabled states and the click handler:


{activeTab === 'checker' ? (
  <div className="checker-actions-footer">
    <Button
      color="danger"
      variant="secondary"
      disabled={isCheckerRejectDisabled}
      onClick={() => handleCheckerDecision('Rejected')}
    >
      {rejectButtonLabel}
    </Button>
    <Button
      color="primary"
      disabled={isCheckerApproveDisabled}
      onClick={() => handleCheckerDecision('Approved')}
    >
      {isSubmitting ? 'Approving...' : 'Approve'}
    </Button>
  </div>
) : (
  <Button
    color="primary"
    disabled={!isCurrentFormValid || isSubmitting}
    onClick={handleMakerSubmit}
  >
    {isSubmitting ? 'Submitting...' : 'Submit Payment'}
  </Button>
)}





// Clean Addition to handlePaymentOutput
// We keep all existing account matching, field mapping, 
// and payload assignment intact. We only insert the active 
// comparison block directly after line 1108 (if (!pData) return;)



const handlePaymentOutput = useCallback(
  (output: PaymentComponentOutput) => {
    const newValid = Boolean(output?.isValid);
    const newDualBlind = Boolean(output?.isDualBlindKeyPassed);
    setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));

    const pData: any = output?.paymentData;
    if (!pData) return;

    // ==============================================================
    // 1. ACTIVE PER-RECORD DUAL-BLIND REKEY VALIDATION
    // ==============================================================
    if (activeTab === 'checker') {
      const rawMaker =
        (initialData as any)?.paymentDetailsRequest ||
        (initialData as any)?.actionDetails ||
        initialData ||
        {};

      const failed: string[] = [];

      DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
        const makerRaw = rawMaker[field] ?? rawMaker?.paymentDetailsRequest?.[field];
        const checkerRaw = pData[field];

        // Use normalizeValue to eliminate false negatives from formatting
        const makerVal = normalizeValue(makerRaw);
        const checkerVal = normalizeValue(checkerRaw);

        if (field === 'instructedAmount') {
          const mNum = parseFloat(makerVal);
          const cNum = parseFloat(checkerVal);
          if (!checkerVal || isNaN(cNum) || mNum !== cNum) {
            failed.push(field);
          }
        } else {
          if (!checkerVal || makerVal !== checkerVal) {
            failed.push(field);
          }
        }
      });

      // Passes if 0 mismatches exist and basic fields are keyed, or library flag is true
      const isManualPassed = failed.length === 0 && Boolean(pData.debtorAccountNumber);
      const isPassed = isManualPassed || newDualBlind;

      setCheckerDualBlindPassed(isPassed);
      setCheckerFailedFields(failed);
    } else {
      setCheckerDualBlindPassed(newDualBlind);
    }

    // ==============================================================
    // 2. ACCOUNT RESOLUTION FOR paymentId (Nested)
    // ==============================================================
    const cleanFormAccount = String(pData.debtorAccountNumber || '')
      .replace(/\//g, '')
      .trim();

    const matchedAccount =
      (instruction?.accounts as any[])?.find(
        (acc: any) =>
          String(acc?.debitAccountNumber || acc?.debtorAccountNumber || '')
            .replace(/\//g, '')
            .trim() === cleanFormAccount
      ) ||
      actionDetailsList?.find(
        (action: any) =>
          String(action?.debitAccountNumber || action?.debtorAccountNumber || '')
            .replace(/\//g, '')
            .trim() === cleanFormAccount
      );

    const resolvedAccountId = String(
      initialData?.accountId ??
      (initialData as any)?.actionDetails?.accountId ??
      matchedAccount?.accountId ??
      pData?.accountId ??
      ''
    ).trim();

    // ==============================================================
    // 3. PAYLOAD CONSTRUCTION FOR SUBMISSION / APPROVAL
    // ==============================================================
    const makerSSPaymentPayload = {
      txnId: instructionId_ ? String(instructionId_) : undefined,
      maker: 'SS47983',
      dupValidityCheckDays: 30,
      duplicateCheckFieldList: ['debtorAccountNumber', 'instructedAmount'],
      overrideDuplicate: false,
      duplicateRefId: '',
      duplicateInputDataModel: {},
      paymentDetailsRequest: {
        ...pData,
        paymentId: resolvedAccountId,
        requestedExecutionDate:
          pData.requestedExecutionDate || pData.valueDate || '',
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
        applicationName: 'GAB',
        applicationModule: 'GAB-LATAM',
        region: 'LATAM',
        taxIdNumber: instructionId_ ? String(instructionId_) : '',
        purposeOfPayment: pData.purposeOfPayment || '',
        taxIdType: instructionId_ ? String(instructionId_) : '',
        taxPurposeCode: pData.taxPurposeCode || '',
        regulatoryReportingCode: pData.regulatoryReportingCode || '',
        invoiceReferenceNumber: pData.invoiceReferenceNumber || '',
      },
    };

    currentFormPayload.current = makerSSPaymentPayload;
  },
  [currentUserId, instructionId_, instruction, actionDetailsList, initialData, activeTab]
);