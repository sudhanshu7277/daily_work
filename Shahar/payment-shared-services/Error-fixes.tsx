// The maker values inside paymentDetailsRequest 
// must be flattened onto the root of initialData so both 
// <SSPaymentFlow> and your local comparison see the ground-truth values at the top level.

//In InstructionDetailPage.tsx (Line 5661

initialData={
  selectedRowData
    ? {
        ...((selectedRowData as any).actionDetails || {}),
        ...((selectedRowData as any).paymentDetailsRequest || {}), // <-- ADD THIS LINE
        ...selectedRowData,
        accountId: (selectedRowData as any).accountId || (selectedRowData as any).paymentId,
        statusCode: (selectedRowData as any).statusCode,
        statusDescription: (selectedRowData as any).statusDescription,
        debtorAccountNumber: String(
          (selectedRowData as any).debtorAccountNumber ||
          (selectedRowData as any).paymentDetailsRequest?.debtorAccountNumber ||
          (selectedRowData as any).debitAccountNumber ||
          ""
        )
          .replace(/\/V\//g, "")
          .trim(),
      }
    : null
}


//Also in PaymentParent.tsx (Lines 1050–1060 where 
// stableInitialPaymentModel is computed):
// Ensure stableInitialPaymentModel flattens paymentDetailsRequest 
// to prevent null root properties from overriding it:


const stableInitialPaymentModel = useMemo(() => {
  if (!initialData) return null;

  const raw = initialData as any;
  const pdr = raw.paymentDetailsRequest || {};
  const act = raw.actionDetails || {};
  const matched = raw.matchedAction || {};

  // 1. Merge nested payloads with paymentDetailsRequest having top priority
  const nestedDetails = {
    ...matched,
    ...act,
    ...pdr,
  };

  // 2. Preserve instructedAmount as a Number (do NOT wrap in String())
  const rawAmount =
    pdr.instructedAmount ??
    act.instructedAmount ??
    raw.instructedAmount ??
    raw.amount;

  const parsedAmount =
    rawAmount !== undefined && rawAmount !== null && rawAmount !== ''
      ? Number(rawAmount)
      : undefined;

  return {
    ...createEmptyPain001(),
    // 3. Base API root
    ...raw,
    // 4. Overwrite with actual maker values from paymentDetailsRequest
    ...nestedDetails,
    instructedAmount: parsedAmount,
    // 5. Normalized critical rekey fields
    debtorAccountNumber: String(
      pdr.debtorAccountNumber ||
      act.debtorAccountNumber ||
      raw.debtorAccountNumber ||
      raw.debitAccountNumber ||
      ''
    )
      .replace(/\/V\//g, '')
      .trim(),
    debtorName: pdr.debtorName || act.debtorName || raw.debtorName || '',
    debtorAgentBIC: pdr.debtorAgentBIC || act.debtorAgentBIC || raw.debtorAgentBIC || '',
    creditorName: pdr.creditorName || act.creditorName || raw.creditorName || '',
    creditorAccount: pdr.creditorAccount || act.creditorAccount || raw.creditorAccount || '',
    creditorAgentFinancialInstitutionBIC:
      pdr.creditorAgentFinancialInstitutionBIC ||
      act.creditorAgentFinancialInstitutionBIC ||
      raw.creditorAgentFinancialInstitutionBIC ||
      '',
    instructedAmountCurrencyCode:
      pdr.instructedAmountCurrencyCode ||
      act.instructedAmountCurrencyCode ||
      raw.instructedAmountCurrencyCode ||
      raw.currency ||
      'USD',
    paymentId: String(raw.paymentId || raw.accountId || nestedDetails.paymentId || ''),
  };
}, [initialData]);