//The Fix in PaymentParent.tsx
//Update handleCheckerDecision (around line 1122) so that 
// paymentDetailsRequest merges the base metadata/non-rekey 
// fields from rawInitial.paymentDetailsRequest, while explicitly 
// overriding every DUAL_BLIND_REKEY_FIELDS entry with what the Checker
//  actually entered in currentFormPayload.current (defaulting to "" if left blank):

const handleCheckerDecision = async (action: 'Approved' | 'Rejected') => {
  setIsSubmitting(true);
  const endpoint = '/nextgengab/api/api/v1/gab/payments/checker/approve';
  const actionUpper = action === 'Rejected' ? 'REJECTED' : 'APPROVED';
  const rawInitial = (initialData as any) || {};
  const rawAction = rawInitial.paymentDetailsRequest || rawInitial.actionDetails || rawInitial;

  // Grab the live form values entered by the Checker
  const liveCheckerPaymentDetails = currentFormPayload.current?.paymentDetailsRequest || {};

  // Build paymentDetailsRequest so dual-blind fields ONLY come from Checker input (or '' if untouched)
  const sanitizedPaymentDetailsRequest: Record<string, any> = {
    ...(rawInitial.paymentDetailsRequest || {}),
  };

  DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
    const enteredValue = liveCheckerPaymentDetails[field];
    sanitizedPaymentDetailsRequest[field] =
      enteredValue !== undefined && enteredValue !== null ? String(enteredValue) : '';
  });

  const payload = {
    loginUser: soeId,
    action: actionUpper,
    comments: checkerComments?.trim() || '',
    eventRecordDate: Date.now(),
    eventType: rawAction.eventType || 'dividend',
    failedFieldList: action === 'Rejected' ? checkerFailedFields : [],
    issCode: rawAction.issCode || '',
    overrideDuplicate: false,
    paymentDetailsRequest: sanitizedPaymentDetailsRequest,
    transactionId: rawInitial?.paymentTransactionWorkflow?.transactionId,
    applicationModule: "GAB-LATAM",
    applicationName: "GAB",
    txnId: rawInitial?.instructionId,
    paymentId: rawInitial?.accountId,
  };



  //Change 1: Capture Checker's Live Inputs in handlePaymentOutput 
  // (Line 843)Right before the console.log and return; on line 849, 
  // store pData into currentFormPayload.current:   


  setCheckerDualBlindPassed(isPassed);
    setIsCurrentFormValid(Boolean(output?.isValid) && isBktBicCountryValid);

    // Save Checker's live form values so handleCheckerDecision can read what they actually entered
    currentFormPayload.current = {
      ...(currentFormPayload.current || {}),
      paymentDetailsRequest: pData,
    };

    console.log('[DualBlind Rekey Check]', {
      failedCount: failed.length,
      failedFields: failed,
      isPassed: failed.length === 0,
    });
    return;



    //Change 2: Sanitize Dual-Blind Fields in handleCheckerDecision 
    // (Line 1122)In handleCheckerDecision (image_68.jpg, lines 1120–1138),
    //  construct sanitizedPaymentDetailsRequest so that:   On Reject: 
    // only what the Checker actually typed into DUAL_BLIND_REKEY_FIELDS is 
    // sent; any untouched dual-blind field is forced to "" (never leaking Maker values).   


    const rawInitial = (initialData as any) || {};
    const rawAction = rawInitial.paymentDetailsRequest || rawInitial.actionDetails || rawInitial;

    const liveCheckerPaymentDetails = currentFormPayload.current?.paymentDetailsRequest || {};
    const sanitizedPaymentDetailsRequest: Record<string, any> = {
      ...(rawInitial.paymentDetailsRequest || {}),
    };

    DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
      const enteredValue = liveCheckerPaymentDetails[field];
      const hasEnteredValue =
        enteredValue !== undefined && enteredValue !== null && String(enteredValue).trim() !== '';

      if (hasEnteredValue) {
        sanitizedPaymentDetailsRequest[field] = String(enteredValue);
      } else if (action === 'Rejected') {
        sanitizedPaymentDetailsRequest[field] = '';
      } else {
        // Approved path: field was legitimately blank on both Maker & Checker; preserve original null/'' format
        sanitizedPaymentDetailsRequest[field] = rawInitial.paymentDetailsRequest?.[field] ?? '';
      }
    });

    const payload = {
      loginUser: soeId,
      action: actionUpper,
      comments: checkerComments?.trim() || '',
      eventRecordDate: Date.now(),
      eventType: rawAction.eventType || 'dividend',
      failedFieldList: action === 'Rejected' ? checkerFailedFields : [],
      issCode: rawAction.issCode || '',
      overrideDuplicate: false,
      paymentDetailsRequest: sanitizedPaymentDetailsRequest,
      transactionId: rawInitial?.paymentTransactionWorkflow?.transactionId,
      applicationModule: "GAB-LATAM",
      applicationName: "GAB",
      txnId: rawInitial?.instructionId,
      paymentId: rawInitial?.accountId,
    };


    