// Replace lines 377–400 in VerifyPaymentDetailModal.tsx with:

// Helper to validate mode/detail pre-checks
function validatePrechecks(
  mode: string,
  paymentDetail: unknown,
  selectedDeal: unknown
): string | null {
  if ((mode === 'verify' || mode === 'edit') && !paymentDetail) {
    return 'No payment record selected';
  }
  if (mode === 'verify' && !selectedDeal) {
    return 'Please select a Deal Name';
  }
  return null;
}

// Helper to validate routing code requirements based on party count
function validatePartiesRouting(parties: number, form: Record<string, string>): string | null {
  if (![2, 3, 4].includes(parties)) {
    return 'Number of parties must be 2, 3 or 4';
  }
  if (parties === 2 && !form.beneBankRoutingCode?.trim()) {
    return 'Beneficiary bank routing code is required for a 2-party wire';
  }
  if (parties >= 3 && !form.firstIntRoutingCode?.trim()) {
    return 'First intermediary routing code is required for a 3- or 4-party wire';
  }
  if (parties === 4 && !form.secondIntBankName?.trim()) {
    return 'Second intermediary bank name is required for a 4-party wire';
  }
  return null;
}

// Helper to validate form field presence and values
function validateFormFields(form: Record<string, string>): string | null {
  if (!form.transactionDate?.trim()) return 'Transaction Date is required';
  if (!form.paymentAmount?.trim()) return 'Payment Amount is required';

  const amount = Number(form.paymentAmount);
  if (!Number.isFinite(amount) || amount < 0) {
    return 'Payment amount must be zero or greater';
  }
  return null;
}

/// Then update your validate callback inside the component:

const validate = useCallback((): string | null => {
  const precheckError = validatePrechecks(mode, paymentDetail, selectedDeal);
  if (precheckError) return precheckError;

  if (mode !== 'verify') {
    const formError = validateFormFields(form);
    if (formError) return formError;
  }

  return validatePartiesRouting(parties, form);
}, [mode, paymentDetail, selectedDeal, parties, form]);