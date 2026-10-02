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