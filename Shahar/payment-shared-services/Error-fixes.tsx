//1. Fix stableInitialPaymentModel (Lines 402–440 in image_66.png & image_67.png)

//Problem: stableInitialPaymentModel did not include BICs, payment methods, or Peru tax IDs, and hardcoded currency fallback to 'USD'. 
//   Replace lines 402–440 with:


const stableInitialPaymentModel = useMemo(() => {
    if (!initialData) return null;
  
    const raw = initialData as any;
    const nestedDetails =
      raw.paymentDetailsRequest ||
      raw.actionDetails ||
      raw.matchedAction ||
      raw.paymentInitPayload ||
      {};
  
    return {
      ...createEmptyPain001(),
      ...raw,
      ...nestedDetails,
      debtorAccountNumber: String(
        raw.debtorAccountNumber ||
        raw.debitAccountNumber ||
        nestedDetails.debtorAccountNumber ||
        nestedDetails.debitAccountNumber ||
        ''
      ).replace(/\//g, '').trim(),
  
      instructedAmount: String(
        raw.instructedAmount ??
        raw.amount ??
        nestedDetails.instructedAmount ??
        nestedDetails.amount ??
        ''
      ),
  
      instructedAmountCurrencyCode:
        raw.instructedAmountCurrencyCode ||
        raw.currency ||
        nestedDetails.instructedAmountCurrencyCode ||
        nestedDetails.currency ||
        'PEN',
  
      painPaymentMethodType:
        raw.painPaymentMethodType ||
        nestedDetails.painPaymentMethodType ||
        raw.paymentType ||
        'DFT',
  
      debtorName: raw.debtorName || nestedDetails.debtorName || '',
      debtorAgentBIC: raw.debtorAgentBIC || nestedDetails.debtorAgentBIC || '',
      debtorCountryCode: raw.debtorCountryCode || nestedDetails.debtorCountryCode || '',
  
      creditorName: raw.creditorName || nestedDetails.creditorName || '',
      creditorAccount: raw.creditorAccount || raw.creditorAccountNumber || nestedDetails.creditorAccount || '',
      creditorAgentFinancialInstitutionBIC:
        raw.creditorAgentFinancialInstitutionBIC ||
        raw.creditorAgentBIC ||
        nestedDetails.creditorAgentFinancialInstitutionBIC ||
        nestedDetails.creditorAgentBIC ||
        '',
      creditorCountryCode: raw.creditorCountryCode || nestedDetails.creditorCountryCode || '',
  
      taxIdNumber:
        raw.taxIdNumber ||
        raw.creditorOrgTaxId ||
        raw.creditorPersonTaxId ||
        nestedDetails.creditorOrgTaxId ||
        nestedDetails.creditorPersonTaxId ||
        '',
      taxIdType:
        raw.taxIdType ||
        raw.creditorOrgTaxCode ||
        raw.creditorPersonTaxCode ||
        nestedDetails.creditorOrgTaxCode ||
        nestedDetails.creditorPersonTaxCode ||
        'TXID',
      taxPurposeCode: raw.taxPurposeCode || nestedDetails.taxPurposeCode || '',
  
      paymentId: String(raw.paymentId || raw.accountId || nestedDetails.paymentId || ''),
    };
  }, [initialData]);


  //2. Fix isNonUsPayment (Lines 442–452 in image_68.png)Problem: It only checked debtorAgentBIC 
  // and failed to detect Peru (PE) or ISO country codes. 
  //   Replace lines 442–452 with:


  const isNonUsPayment = useMemo(() => {
    const raw = (initialData ?? stableInitialPaymentModel) as any;
    const pdr = raw?.paymentDetailsRequest || raw?.paymentInitPayload || {};
  
    const bic = String(
      raw?.debtorAgentBIC ||
      pdr?.debtorAgentBIC ||
      raw?.creditorAgentFinancialInstitutionBIC ||
      pdr?.creditorAgentFinancialInstitutionBIC ||
      ''
    ).toUpperCase().trim();
  
    const country = String(
      raw?.debtorCountryCode ||
      pdr?.debtorCountryCode ||
      raw?.creditorCountryCode ||
      pdr?.creditorCountryCode ||
      ''
    ).toUpperCase().trim();
  
    const LATAM_CODES = ['AR', 'BR', 'CO', 'CL', 'MX', 'PE', 'UY', 'PY', 'PA', 'CR', 'DO', 'EC', 'GT'];
  
    if (country && LATAM_CODES.includes(country)) return true;
    if (bic.length >= 6 && LATAM_CODES.includes(bic.substring(4, 6))) return true;
  
    return bic.length > 0 && !bic.includes('US');
  }, [initialData, stableInitialPaymentModel]);


  //3. Fix dynamicFieldConfig (Lines 454–492 
  // in image_68.png to image_70.png)Problem: In 
  // Maker mode, fields were remaining locked or not explicitly 
  // set to editable (disabled: false).   
  // Replace lines 454–492 with:

  const dynamicFieldConfig = useMemo(() => {
    const baseConfig = (PARENT_FIELD_CONFIG as FormFieldConfig[]) || [];
  
    const activeRekeyFields = isNonUsPayment
      ? [...DUAL_BLIND_REKEY_FIELDS, ...TAX_DUAL_BLIND_REKEY_FIELDS]
      : DUAL_BLIND_REKEY_FIELDS;
  
    if (activeTab === 'checker') {
      return baseConfig.map((cfg) => {
        const isRekeyField = activeRekeyFields.includes(cfg.fieldName);
        const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);
  
        return {
          ...cfg,
          required: isNonUsPayment && isTaxField ? true : cfg.required,
          hidden: isNonUsPayment && isTaxField ? false : cfg.hidden,
          disabled: !isRekeyField,
        };
      });
    }
  
    // Maker or Repair mode: Ensure all fields are enabled and editable
    return baseConfig.map((cfg) => {
      const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);
      return {
        ...cfg,
        disabled: false,
        required: isNonUsPayment && isTaxField ? true : cfg.required,
        hidden: isNonUsPayment && isTaxField ? false : cfg.hidden,
      };
    });
  }, [activeTab, isNonUsPayment]);


  //4. Fix Dual-Blind Checker Rekey Comparison (Lines 560–596 in image_73.png 
  // & image_74.png)Problem: Line 562 only iterated DUAL_BLIND_REKEY_FIELDS, 
  // skipping the tax fields, and line 574 had a currency mismatch.   
  // Replace lines 560–575 with:

  const failed: string[] = [];

    const rekeyFieldsToCheck = isNonUsPayment
      ? [...DUAL_BLIND_REKEY_FIELDS, ...TAX_DUAL_BLIND_REKEY_FIELDS]
      : DUAL_BLIND_REKEY_FIELDS;

    rekeyFieldsToCheck.forEach((field) => {
      const makerRaw =
        pdr[field] !== undefined && pdr[field] !== null && pdr[field] !== ''
          ? pdr[field]
          : act[field] !== undefined && act[field] !== null && act[field] !== ''
          ? act[field]
          : rawInitial[field] !== undefined && rawInitial[field] !== null && rawInitial[field] !== ''
          ? rawInitial[field]
          : '';

      let checkerRaw = pData[field];
      if (field === 'instructedAmountCurrencyCode') {
        checkerRaw = pData.instructedAmountCurrencyCode || pData.currency || makerRaw;
      }


      //5. Fix Leaked Instruction ID in Maker Submission Payload (Lines 682–704 in image_78.png & image_79.png)Problem: Lines 697 and 699 forced taxIdNumber and taxIdType to instructionId_ 
      // (sending 500015), and line 683 hardcoded 'CBT'.  
      //  Replace lines 682–704 with:


      ustrdPaymentDetails: pData.ustrdPaymentDetails || '',
      painPaymentMethodType:
        pData.painPaymentMethodType ||
        pData.paymentType ||
        (initialData as any)?.painPaymentMethodType ||
        'DFT',
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
      taxIdNumber: isNonUsPayment
        ? (pData.taxIdNumber || pData.creditorOrgTaxId || pData.creditorPersonTaxId || '')
        : '',
      purposeOfPayment: pData.purposeOfPayment || '',
      taxIdType: isNonUsPayment
        ? (pData.taxIdType || pData.creditorOrgTaxCode || pData.creditorPersonTaxCode || 'TXID')
        : '',
      taxPurposeCode: isNonUsPayment ? (pData.taxPurposeCode || '') : '',
      regulatoryReportingCode: pData.regulatoryReportingCode || '',
      invoiceReferenceNumber: pData.invoiceReferenceNumber || '',
    };