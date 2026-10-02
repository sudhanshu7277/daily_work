//The Fix
Step 1: Update the Button Click in InstructionDetailPage.tsx (Lines 608–612 in image_22.png)
Pass actionText: buttonLabel along with



// image_22.png, around line 608:
onClick={() => {
    if (p.data && p.context?.onEditRow) {
      p.context.onEditRow({
        ...p.data,
        actionText: buttonLabel, // Explicitly pass "Edit" or "Review"
      });
    }
  }}



  // Step 2: Make handleEditRow Prioritize "Edit" (Lines 1682–1687 in image_24.png)
If the user clicked an "Edit" button, or if the status is "NEW" or "Payment Not Created", it is always Maker mode. Never treat it as Checker:


const handleEditRow = async (rowData: any) => {
    if (!rowData) return;
  
    // 1. Prioritize explicit Edit action or NEW items for Maker mode
    const isExplicitEdit =
      rowData?.actionText === 'Edit' ||
      rowData?.statusCode === 'NEW' ||
      rowData?.status === 'Payment Not Created';
  
    // 2. Identify if this is Checker mode
    const isChecker =
      !isExplicitEdit &&
      (rowData?.actionText === 'Review' ||
        rowData?.status === 'PAYMENT_CHECKER' ||
        rowData?.status === 'Payment Created' ||
        rowData?.status === 'Checker1 Approved' ||
        rowData?.statusCode === 'CHECKER1' ||
        rowData?.statusCode === 'CHECKER2' ||
        rowData?.statusCode === 'CHECKER3' ||
        (rowData?.statusCode === 'MAKER' && rowData?.actionText !== 'Edit'));
  
    if (isChecker) {
      try {
        // Prioritize paymentId over accountId to prevent backend lookup failures
        const resolvedPaymentId =
          rowData?.paymentId ||
          rowData?.stageDetails?.paymentId ||
          rowData?.paymentTransactionId ||
          rowData?.matchedAction?.paymentId ||
          rowData?.accountId ||
          '';
  
        const resolvedTxnId =
          rowData?.matchedAction?.paymentTransactionId ||
          rowData?.transactionId ||
          rowData?.stageDetails?.transactionId ||
          '';
  
        const resolvedInstructionId =
          rowData?.instructionId ||
          (instruction as any)?.instructionId ||
          (instruction as any)?.id ||
          rowData?.txnid ||
          '';
  
        const payload = {
          moduleName: 'GAB-LATAM',
          applicationName: 'GAB',
          maker: rowData?.maker || '',
          paymentId: String(resolvedPaymentId),
          transactionId: String(resolvedTxnId),
          txnid: String(resolvedInstructionId),
        };
  
        console.log('Fetching maker payment for checker review with payload:', payload);
  
        const res = await getMakerPaymentPerRecord(payload);
        const record = Array.isArray(res) ? res[0] : res;
        const pdr = record?.paymentDetailsRequest || {};
  
        setSelectedRowData({
          ...rowData,
          ...record,
          ...pdr,
          paymentDetailsRequest: pdr,
          paymentTransactionWorkflow:
            record?.paymentTransactionWorkflow ??
            rowData?.paymentTransactionWorkflow ??
            null,
          accountId: rowData?.accountId || record?.accountId,
          paymentId: record?.paymentId || rowData?.paymentId || resolvedPaymentId,
        });
      } catch (err) {
        console.error('Failed to fetch maker payment per record:', err);
        setSelectedRowData(rowData);
      }
    } else {
      // Maker Mode: Use rowData directly without fetching checker review payloads
      setSelectedRowData(rowData);
    }
  
    // 3. Set the resolved mode and open the modal
    setModalMode(isChecker ? 'checker' : 'maker');
    setShowSplitMakerModal(true);
  };

  onClick={() => {
    if (p.data && p.context?.onEditRow) {
      p.context.onEditRow({
        ...p.data,
        actionText: buttonLabel, // Explicitly forwards "Edit" or "Review"
      });
    }
  }}