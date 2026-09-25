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