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
    'creditorAgentAccountNumber', // <-- Replaced creditorAgentPostalAddress
  ];


  const rekeyFieldsToCheck = isNonUsPayment
  ? [...DUAL_BLIND_REKEY_FIELDS, ...TAX_DUAL_BLIND_REKEY_FIELDS]
  : DUAL_BLIND_REKEY_FIELDS;

rekeyFieldsToCheck.forEach((field) => {
  let makerRaw =
    pdr[field] !== undefined && pdr[field] !== null && pdr[field] !== ''
      ? pdr[field]
      : act[field] !== undefined && act[field] !== null && act[field] !== ''
      ? act[field]
      : rawInitial[field] !== undefined && rawInitial[field] !== null && rawInitial[field] !== ''
      ? rawInitial[field]
      : '';

  let checkerRaw = pData[field];

  if (field === 'creditorAgentAccountNumber') {
    makerRaw =
      pdr.creditorAgentAccountNumber ||
      pdr.creditorAgentPostalAddress ||
      act.creditorAgentAccountNumber ||
      act.creditorAgentPostalAddress ||
      rawInitial.creditorAgentAccountNumber ||
      rawInitial.creditorAgentPostalAddress ||
      '';
    checkerRaw = pData.creditorAgentAccountNumber || pData.creditorAgentPostalAddress || '';
  }

  if (field === 'instructedAmountCurrencyCode') {
    checkerRaw = pData.instructedAmountCurrencyCode || pData.currency || makerRaw;
  }

  const makerVal = normalizeValue(makerRaw);
  const checkerVal = normalizeValue(checkerRaw);

  // If both maker and checker are empty/unpopulated, treat as valid match
  if (!makerVal && !checkerVal) {
    return;
  }

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

const isManualPassed = failed.length === 0;
const isPassed = isManualPassed || newDualBlind;
setCheckerDualBlindPassed(isPassed);
setCheckerFailedFields(failed);