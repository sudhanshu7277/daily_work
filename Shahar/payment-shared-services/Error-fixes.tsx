//Here is the exact, compile-clean drop-in for lines 1832 to 1866 of InstructionDetailPage.tsx


// 1. Get only the records current user has permission to review/edit
const accessibleRows = useMemo(() => {
    const allRows: any[] =
      (instruction as any)?.accounts ||
      (instruction as any)?.instructionAccounts ||
      [];

    const activeUserId = typeof getUserId === 'function' ? getUserId() : '';

    return allRows.filter((r: any) => isRowActionableForUser(r, activeUserId, modalMode));
  }, [instruction, modalMode]);

  // 2. Find current position within ONLY accessible records
  const currentAccessibleIndex = useMemo(() => {
    if (!selectedRowData || !accessibleRows.length) return 0;
    const rawSelected = selectedRowData as any;
    const currTxnId = String(
      rawSelected?.transactionId ||
      rawSelected?.paymentTransactionWorkflow?.transactionId ||
      rawSelected?.paymentDetailsRequest?.transactionId ||
      rawSelected?.actionDetails?.transactionId ||
      rawSelected?.accountId ||
      ''
    );

    const idx = accessibleRows.findIndex((r: any) => {
      const rTxnId = String(
        r?.transactionId ||
        r?.paymentTransactionWorkflow?.transactionId ||
        r?.actionDetails?.transactionId ||
        r?.accountId ||
        ''
      );
      return rTxnId === currTxnId;
    });

    return idx >= 0 ? idx : 0;
  }, [selectedRowData, accessibleRows]);


  