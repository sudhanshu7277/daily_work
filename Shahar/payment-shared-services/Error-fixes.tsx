//The Exact Replacement for Lines 575–630 of PaymentParent.tsx:
// Replace lines 575–630 with this clean block:


rekeyFieldsToCheck.forEach((field) => {
    // 1. Resolve Maker Value (prioritize root, then nested pdr, then act)
    let makerRaw =
      rawInitial[field] !== undefined && rawInitial[field] !== null && rawInitial[field] !== ''
        ? rawInitial[field]
        : pdr[field] !== undefined && pdr[field] !== null && pdr[field] !== ''
        ? pdr[field]
        : act[field] !== undefined && act[field] !== null && act[field] !== ''
        ? act[field]
        : '';

    // Field Aliases for Maker
    if (field === 'debtorAccountNumber') {
      makerRaw =
        rawInitial.debtorAccountNumber ||
        rawInitial.debitAccountNumber ||
        pdr.debtorAccountNumber ||
        pdr.debitAccountNumber ||
        makerRaw;
    }

    if (field === 'creditorAccount') {
      makerRaw =
        rawInitial.creditorAccount ||
        rawInitial.creditorAccountNumber ||
        pdr.creditorAccount ||
        makerRaw;
    }

    if (field === 'creditorAgentAccountNumber') {
      makerRaw =
        rawInitial.creditorAgentAccountNumber ||
        rawInitial.creditorAgentPostalAddress ||
        pdr.creditorAgentAccountNumber ||
        pdr.creditorAgentPostalAddress ||
        makerRaw;
    }

    if (field === 'taxIdNumber') {
      makerRaw =
        rawInitial.taxIdNumber ||
        rawInitial.creditorOrgTaxId ||
        rawInitial.creditorPersonTaxId ||
        rawInitial.invoiceReferenceNumber ||
        makerRaw;
    }

    // 2. Resolve Checker Input
    let checkerRaw = pData[field];
    if (field === 'creditorAgentAccountNumber') {
      checkerRaw = pData.creditorAgentAccountNumber || pData.creditorAgentPostalAddress || '';
    }
    if (field === 'instructedAmountCurrencyCode') {
      checkerRaw = pData.instructedAmountCurrencyCode || pData.currency || makerRaw;
    }

    const makerVal = normalizeValue(makerRaw);
    const checkerVal = normalizeValue(checkerRaw);

    // If both maker and checker are empty (optional field not populated), it's a MATCH
    if (!makerVal && !checkerVal) {
      return;
    }

    // Numerical comparison for instructedAmount
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
  const isPassed = isManualPassed || Boolean(newDualBlind);
  setCheckerDualBlindPassed(isPassed);
  setCheckerFailedFields(failed);

  // If Checker mode, we are done - do not execute Maker payload generation below!
  if (activeTab === 'checker') {
    return;
  }


  //2. In InstructionDetailPage.tsx — Fix Payload in handleEditRow
// In image_21.png and image_22.png (lines 1742–1768), 
// update handleEditRow so it uses resolvedPaymentId and spreads the root record fields:


const getMakerPayload = {
    moduleName: "GAB-LATAM",
    applicationName: "GAB",
    maker: rowData?.maker || "",
    paymentId: resolvedPaymentId,
    transactionId: resolvedTxnId,
    txnid: String(rowData?.instructionId || rowData?.txnid || ""),
  };

  console.log('Fetching maker payment for checker review with payload:', getMakerPayload);

  const res = await getMakerPaymentPerRecord(getMakerPayload);
  const record = Array.isArray(res) ? res[0] : res;
  const pdr = record?.paymentDetailsRequest || {};

  setSelectedRowData({
    ...rowData,
    ...pdr,
    ...(record || {}), // Spread root fields directly so debtorName, instructedAmount, etc. exist
    paymentDetailsRequest: pdr,
    paymentTransactionWorkflow:
      record?.paymentTransactionWorkflow ??
      rowData?.paymentTransactionWorkflow ??
      null,
    accountId: rowData?.accountId || record?.accountId,
    paymentId: resolvedPaymentId,
    transactionId: resolvedTxnId,
  });