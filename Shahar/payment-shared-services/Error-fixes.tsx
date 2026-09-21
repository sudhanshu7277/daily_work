
// In PaymentParent.tsx, replace handleCheckerDecision (lines 1194–1228) with the updated endpoint and payload structure:


const handleCheckerDecision = async (action: 'Approved' | 'Rejected') => {
  const isReject = action === 'Rejected';
  if (isReject && !checkerComments.trim()) {
    setCheckerComments('Please enter comments stating the reason for rejection.');
    return;
  }

  setIsSubmitting(true);

  const endpoint = '/nextgengab/api/api/v1/gab/payments/checker/approve';
  const actionUpper = isReject ? 'REJECTED' : 'APPROVED';

  const activeSub = activeSubmittedTransaction || {};
  const matched = (initialData as any)?.matchedAction || (initialData as any)?.actionDetails || initialData || {};

  const paymentId = activeSub.paymentId || matched.paymentId || (initialData as any)?.paymentId || '';
  const transactionId = activeSub.transactionId || matched.transactionId || (initialData as any)?.transactionId || '';
  const securityId = matched.securityId || matched.parentReferenceId || String(instructionId ?? '');
  const eventType = matched.eventType || 'dividend';
  const issCode = matched.issCode || '';
  const eventRecordDate = matched.eventRecordDate || Date.now();
  const txnId = matched.txnId || transactionId;

  // Use current form output or fallback to existing details
  const paymentFormDetails =
    currentFormPayload.current ||
    activeSub.payload ||
    matched.paymentDetailsRequest ||
    matched;

  const payload = {
    loginUser: soeId,
    action: actionUpper,
    comments: checkerComments.trim(),
    eventRecordDate: eventRecordDate,
    eventType: eventType,
    failedFieldList: isReject ? checkerFailedFields : [],
    issCode: issCode,
    overrideDuplicate: false,
    parentKeyData: {
      securityId: securityId,
      eventType: eventType,
      issCode: issCode,
      eventRecordDate: eventRecordDate,
    },
    paymentDetailsRequest: paymentFormDetails,
    paymentId: paymentId,
    securityId: securityId,
    transactionId: transactionId,
    txnId: txnId,
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'SOEID': soeId,
      },
      body: JSON.stringify(payload),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(data?.error ?? data?.message ?? `Checker action failed (${res.status})`);
    }

    setModalResponse({
      title: !isReject ? 'CHECKER APPROVAL SUCCESSFUL' : 'CHECKER REJECTION RECORDED',
      referenceId: data.transactionId ?? transactionId,
      amount: `${paymentFormDetails?.instructedAmountCurrencyCode ?? 'USD'} ${paymentFormDetails?.instructedAmount ?? ''}`,
      status: !isReject ? 'APPROVED' : 'REJECTED',
      message: !isReject
        ? 'Payment approved and released to clearing successfully!'
        : 'Payment rejected and routed to the Repair Queue.',
      color: !isReject ? '#002d72' : '#d64545',
    });
  } catch (err: any) {
    setModalResponse({
      title: 'ACTION FAILED',
      referenceId: transactionId,
      status: 'ERROR',
      message: err?.message ?? `Failed to record checker ${action.toLowerCase()} decision. Please try again.`,
      color: '#d64545',
    });
  } finally {
    setIsSubmitting(false);
  }
};