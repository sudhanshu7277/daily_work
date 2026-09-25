//The Fix
Update lines 1100–1130 in PaymentParent.tsx to flatten the maker record correctly and log the live comparison to the console:


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
      // Flatten: Look inside paymentDetailsRequest FIRST
      const makerSource =
        (initialData as any)?.paymentDetailsRequest ||
        (initialData as any)?.actionDetails ||
        initialData ||
        {};

      const failed: string[] = [];

      DUAL_BLIND_REKEY_FIELDS.forEach((field) => {
        // Resolve maker value (checking nested paymentDetailsRequest as fallback)
        const makerRaw =
          makerSource[field] !== undefined
            ? makerSource[field]
            : (initialData as any)?.[field];

        const checkerRaw = pData[field];

        const makerVal = normalizeValue(makerRaw);
        const checkerVal = normalizeValue(checkerRaw);

        // Numeric comparison for instructedAmount (111111 vs "111111")
        if (field === 'instructedAmount') {
          const mNum = parseFloat(makerVal);
          const cNum = parseFloat(checkerVal);
          if (!checkerVal || isNaN(cNum) || mNum !== cNum) {
            failed.push(field);
          }
        } else {
          // General string comparison
          if (!checkerVal || makerVal !== checkerVal) {
            failed.push(field);
          }
        }
      });

      console.log('Dual-Blind Comparison [paymentId:', (initialData as any)?.paymentId || (initialData as any)?.accountId, ']');
      console.log('Failed Fields count:', failed.length, failed);

      // Rekey passes if all 10 match OR library reports true
      const isManualPassed = failed.length === 0;
      const isPassed = isManualPassed || newDualBlind;

      setCheckerDualBlindPassed(isPassed);
      setCheckerFailedFields(failed);
    } else {
      setCheckerDualBlindPassed(newDualBlind);
    }

    // ==============================================================
    // 2. EXISTING ACCOUNT MATCHING & CURRENT FORM CACHING
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
      initialData?.accountId ??
      (initialData as any)?.paymentId ??
      (initialData as any)?.actionDetails?.accountId ??
      matchedAccount?.accountId ??
      pData?.accountId ??
      ''
    ).trim();

    // Update currentFormPayload.current
    currentFormPayload.current = {
      ...currentFormPayload.current,
      txnId: instructionId_ ? String(instructionId_) : undefined,
      maker: 'SS47983',
      paymentDetailsRequest: {
        ...pData,
        paymentId: resolvedAccountId,
      },
    };
  },
  // CRITICAL: initialData and activeTab MUST be in the dependency array
  [initialData, activeTab, instruction, actionDetailsList, instructionId_]
);