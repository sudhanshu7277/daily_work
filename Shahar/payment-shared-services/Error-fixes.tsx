// The Final, Robust handlePaymentOutput
Replace lines 1106–1270 in PaymentParent.tsx


const handlePaymentOutput = useCallback(
  (output: PaymentComponentOutput) => {
    const newValid = Boolean(output?.isValid);
    const newDualBlind = Boolean(output?.isDualBlindKeyPassed);
    setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));

    const pData: any = output?.paymentData;
    if (!pData) return;

    // ==============================================================
    // 1. ACTIVE PER-RECORD DUAL-BLIND REKEY VALIDATION
    // ==============================================================
    if (activeTab === 'checker') {
      const rawInitial = (initialData as any) || {};
      const pdr = rawInitial.paymentDetailsRequest || {};
      const act = rawInitial.actionDetails || {};

      const failed: string[] = [];

      DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
        // Look across all possible nesting depths from the API response
        const makerRaw =
          pdr[field] !== undefined
            ? pdr[field]
            : rawInitial[field] !== undefined
            ? rawInitial[field]
            : act[field];

        const checkerRaw = pData[field];

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

      // Rekey passes if all 10 fields match OR library internal check succeeds
      const isManualPassed = failed.length === 0;
      const isPassed = isManualPassed || newDualBlind;

      setCheckerDualBlindPassed(isPassed);
      setCheckerFailedFields(failed);
    } else {
      setCheckerDualBlindPassed(newDualBlind);
    }

    // ==============================================================
    // 2. ACCOUNT RESOLUTION FOR paymentId (Nested)
    // ==============================================================
    const cleanFormAccount = String(pData.debtorAccountNumber || '')
      .replace(/\//g, '')
      .trim();

    const matchedAccount =
      (instruction?.accounts as any[])?.find(
        (acc: any) =>
          String(acc?.debitAccountNumber || acc?.debtorAccountNumber || '')
            .replace(/\//g, '')
            .trim() === cleanFormAccount
      ) ||
      actionDetailsList?.find(
        (action: any) =>
          String(action?.debitAccountNumber || action?.debtorAccountNumber || '')
            .replace(/\//g, '')
            .trim() === cleanFormAccount
      );

    const resolvedAccountId = String(
      (initialData as any)?.paymentId ??
      initialData?.accountId ??
      (initialData as any)?.actionDetails?.accountId ??
      matchedAccount?.accountId ??
      pData?.accountId ??
      ''
    ).trim();

    // ==============================================================
    // 3. PAYLOAD CONSTRUCTION FOR SUBMISSION / APPROVAL
    // ==============================================================
    const makerSSPaymentPayload = {
      txnId: instructionId_ ? String(instructionId_) : undefined,
      maker: 'SS47983',
      dupValidityCheckDays: 30,
      duplicateCheckFieldList: ['debtorAccountNumber', 'instructedAmount'],
      overrideDuplicate: false,
      duplicateRefId: '',
      duplicateInputDataModel: {},
      paymentDetailsRequest: {
        ...pData,
        paymentId: resolvedAccountId,
        requestedExecutionDate:
          pData.requestedExecutionDate || pData.valueDate || '',
        debtorName: pData.debtorName || '',
        source: 'UI',
        debtorAccountNumber: pData.debtorAccountNumber || '',
        debtorAgentBIC: pData.debtorAgentBIC || '',
        debtorAgentBank: pData.debtorAgentBank || '',
        chargeBearer: pData.chargeBearer || 'DEBT',
        chargesAmount: pData.chargesAmount || '',
        chargesAgentBIC: pData.chargesAgentBIC || '',
        debtorAddressLines: pData.debtorAddressLines || '',
        debtorStreetName: pData.debtorStreetName || '',
        debtorBuildingNumber: pData.debtorBuildingNumber || '',
        debtorPostalCode: pData.debtorPostalCode || '',
        debtorTownName: pData.debtorTownName || '',
        debtorCountrySubDivision: pData.debtorCountrySubDivision || '',
        debtorCountryCode: pData.debtorCountryCode || '',
        debtorSortCodeUK: pData.debtorSortCodeUK || '',
        debtorSortCodeUS: pData.debtorSortCodeUS || '',
        debtorAddressLines1: pData.debtorAddressLines1 || pData.debtorAddressLine1 || '',
        debtorAddressLines2: pData.debtorAddressLines2 || pData.debtorAddressLine2 || '',
        debtorState: pData.debtorState || '',
        instructedAmount: pData.instructedAmount != null ? String(pData.instructedAmount) : '',
        instructedAmountCurrencyCode: pData.instructedAmountCurrencyCode || pData.currency || 'USD',
        creditorName: pData.creditorName || '',
        creditorAccount: pData.creditorAccount || '',
        creditorAgentAccountNumber: pData.creditorAgentAccountNumber || '',
        creditorAgentFinancialInstitutionBIC: pData.creditorAgentFinancialInstitutionBIC || '',
        creditorAgentFinancialInstitutionName: pData.creditorAgentFinancialInstitutionName || '',
        creditorAgentPostalAddress: pData.creditorAgentPostalAddress || '',
        creditorAddressLines: pData.creditorAddressLines || '',
        creditorStreetName: pData.creditorStreetName || '',
        creditorBuildingNumber: pData.creditorBuildingNumber || '',
        creditorPostalCode: pData.creditorPostalCode || '',
        creditorTownName: pData.creditorTownName || '',
        creditorCountrySubDivision: pData.creditorCountrySubDivision || '',
        creditorCountryCode: pData.creditorCountryCode || '',
        creditorSortCodeUK: pData.creditorSortCodeUK || '',
        creditorSortCodeUS: pData.creditorSortCodeUS || '',
        creditorAddressLines1: pData.creditorAddressLines1 || pData.creditorAddressLine1 || '',
        creditorAddressLines2: pData.creditorAddressLines2 || pData.creditorAddressLine2 || '',
        creditorState: pData.creditorState || '',
        ustrdPaymentDetails: pData.ustrdPaymentDetails || '',
        painPaymentMethodType: pData.painPaymentMethodType || 'CBT',
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
        taxIdNumber: instructionId_ ? String(instructionId_) : '',
        purposeOfPayment: pData.purposeOfPayment || '',
        taxIdType: instructionId_ ? String(instructionId_) : '',
        taxPurposeCode: pData.taxPurposeCode || '',
        regulatoryReportingCode: pData.regulatoryReportingCode || '',
        invoiceReferenceNumber: pData.invoiceReferenceNumber || '',
      },
    };

    currentFormPayload.current = makerSSPaymentPayload;
  },
  [currentUserId, instructionId_, instruction, actionDetailsList, initialData, activeTab]
);