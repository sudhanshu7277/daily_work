// 1. Validator Helper Function
// Place this above PaymentParent (or right above handlePaymentOutput):


const validateMakerFormDetails = (pData: any): boolean => {
  if (!pData) return false;

  // 1. Payment Information (Value Date *, Currency *, Amount *)
  const hasValueDate = Boolean(pData.requestedExecutionDate || pData.valueDate);
  const hasCurrency = Boolean(pData.instructedAmountCurrencyCode || pData.currency);
  const rawAmt = pData.instructedAmount ?? pData.amount;
  const hasAmount =
    rawAmt !== '' && rawAmt !== null && rawAmt !== undefined && Number(rawAmt) > 0;

  if (!hasValueDate || !hasCurrency || !hasAmount) return false;

  // 2. Debtor Information (Name *, Account *, Agent BIC *)
  const hasDebtorName = Boolean(pData.debtorName?.toString().trim());
  const hasDebtorAccount = Boolean(pData.debtorAccountNumber?.toString().trim());
  const hasDebtorBIC = Boolean(pData.debtorAgentBIC?.toString().trim());

  if (!hasDebtorName || !hasDebtorAccount || !hasDebtorBIC) return false;

  // 3. Debtor Address Conditional Validation:
  // If Debtor Address Line 1 has text, Town/City and Country are mandatory.
  const debtorAddr1 = (
    pData.debtorAddressLines1 ||
    pData.debtorAddressLine1 ||
    pData.debtorAddressLines ||
    ''
  ).toString().trim();

  if (debtorAddr1.length > 0) {
    const hasDebtorTown = Boolean(
      (pData.debtorTownName || pData.debtorTown || pData.debtorCity)?.toString().trim()
    );
    const hasDebtorCountry = Boolean(
      (pData.debtorCountryCode || pData.debtorCountry)?.toString().trim()
    );

    if (!hasDebtorTown || !hasDebtorCountry) return false;
  }

  // 4. Beneficiary / Creditor Information (Name *, Account *, Agent BIC *, Agent Bank Name *)
  const hasCreditorName = Boolean(pData.creditorName?.toString().trim());
  const hasCreditorAccount = Boolean(
    (pData.creditorAccount || pData.creditorAccountNumber)?.toString().trim()
  );
  const hasCreditorBIC = Boolean(
    (
      pData.creditorAgentFinancialInstitutionBIC ||
      pData.creditorAgentBIC
    )?.toString().trim()
  );
  const hasCreditorBankName = Boolean(
    (
      pData.creditorAgentFinancialInstitutionName ||
      pData.creditorAgentBankName
    )?.toString().trim()
  );

  if (!hasCreditorName || !hasCreditorAccount || !hasCreditorBIC || !hasCreditorBankName)
    return false;

  // 5. Creditor Address Line 1 * (Mandatory with red star)
  const hasCreditorAddr1 = Boolean(
    (
      pData.creditorAddressLines1 ||
      pData.creditorAddressLine1 ||
      pData.creditorAddressLines ||
      ''
    ).toString().trim()
  );
  if (!hasCreditorAddr1) return false;

  // 6. Charge Details (Charge Information *)
  const hasChargeInfo = Boolean(
    (pData.chargeBearer || pData.chargeInformation)?.toString().trim()
  );
  if (!hasChargeInfo) return false;

  return true;
};


// 2. Updated handlePaymentOutput
// Replace lines 280–290 with:

const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  console.log('checking if form is valid : ', output?.isValid);
  console.log('checking payload of maker form output : ', output);

  const pData: any = output?.paymentData;

  // Check if form is valid via library OR our mandatory field checks
  const isFieldsValid = validateMakerFormDetails(pData);
  const newValid = Boolean(output?.isValid) || isFieldsValid;
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  if (!pData) return;

  const makerSSPaymentPayload = {
    txndId: instructionId_ ? String(instructionId_) : undefined,
    maker: 'SS71872',
    paymentDetailsRequest: {
      requestedExecutionDate: pData.requestedExecutionDate || pData.valueDate || '',
      debtorName: pData.debtorName || '',
      source: 'UI',
      debtorAccountNumber: pData.debtorAccountNumber || '',
      // ... keep existing mapping lines 299 onwards