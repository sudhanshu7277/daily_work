//1. Fix Currency Matching in handlePaymentOutput
// Inside the DUAL_BLIND_REKEY_FIELDS.forEach((field) => { ... }) loop in PaymentParent.tsx


DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
  const makerRaw =
    pdr[field] !== undefined
      ? pdr[field]
      : rawInitial[field] !== undefined
      ? rawInitial[field]
      : act[field];

  // If field is currency, read from either property or fallback to maker's locked currency
  let checkerRaw = pData[field];
  if (field === 'instructedAmountCurrencyCode') {
    checkerRaw = pData.instructedAmountCurrencyCode || pData.currency || makerRaw;
  }

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



//2. Ensure isCheckerApproveDisabled Only Depends on the Rekey MatchLines 1519–1520 previously included flags like !activeSubmittedTransaction or library form validity checks that can stay false due to disabled fields.   Set line 1519 strictly to:

const isCheckerApproveDisabled =
  isSubmitting ||
  checkerFailedFields.length > 0;