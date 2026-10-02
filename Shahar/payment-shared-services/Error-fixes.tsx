//3. The Fix in InstructionDetailPage.tsx
// Filter the accessible list first, and run navigation strictly across the filtered records.

//A. Define the Accessibility Filter Helper
// In InstructionDetailPage.tsx, define which records the 
// current user is permitted to act on (using the exact same 
// logic already in your grid cellRenderer from lines 578–606 in image_13.png to image_15.png):


const isRowActionableForUser = (row: any, userSoeId: string, mode: 'checker' | 'maker' = 'checker'): boolean => {
    if (!row) return false;
  
    const currentUserId = String(userSoeId || '').trim().toUpperCase();
  
    const recordMaker = String(
      row?.maker ||
      row?.stageDetails?.maker ||
      row?.makerId ||
      row?.paymentTransactionWorkflow?.maker ||
      ''
    ).trim().toUpperCase();
  
    const recordChecker1 = String(row?.checker1 || row?.stageDetails?.checker1 || '').trim().toUpperCase();
    const recordChecker2 = String(row?.checker2 || row?.stageDetails?.checker2 || '').trim().toUpperCase();
  
    const isUserTheMaker = Boolean(currentUserId && recordMaker && currentUserId === recordMaker);
    const hasUserAlreadyChecked = Boolean(
      currentUserId && (currentUserId === recordChecker1 || currentUserId === recordChecker2)
    );
  
    const statusCode = String(row?.statusCode || row?.status || '').toUpperCase();
    const isCompleted = statusCode === 'COMPLETED';
  
    if (isCompleted) return false;
  
    if (mode === 'checker') {
      // Segregation of Duties: Maker cannot check, and user cannot check twice
      if (isUserTheMaker || hasUserAlreadyChecked) return false;
  
      const isCheckerStage =
        row?.statusCode === 'MAKER' ||
        row?.statusCode === 'CHECKER1' ||
        row?.statusCode === 'CHECKER2' ||
        row?.status === 'Payment Created' ||
        row?.status === 'Checker1 Approved';
  
      return Boolean(isCheckerStage);
    }
  
    return true;
  };

  //B. Compute Accessible Records List & Indices
// In InstructionDetailPage.tsx, compute the list of accessible items and pass them to the modal:

// 1. Get only the records current user has permission to review/edit
const accessibleRows = useMemo(() => {
    const allRows = instructionAccounts || instruction?.accounts || [];
    return allRows.filter((r: any) => isRowActionableForUser(r, soeId, modalMode));
  }, [instructionAccounts, instruction?.accounts, soeId, modalMode]);
  
  // 2. Find current position within ONLY accessible records
  const currentAccessibleIndex = useMemo(() => {
    if (!selectedRowData || !accessibleRows.length) return 0;
    const currTxnId = String(
      selectedRowData?.transactionId ||
      selectedRowData?.paymentTransactionWorkflow?.transactionId ||
      selectedRowData?.actionDetails?.transactionId ||
      selectedRowData?.accountId ||
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
  
  // 3. Navigation handler that only steps between accessible records
  const handleModalNavigate = async (direction: 'prev' | 'next') => {
    const targetIndex = direction === 'next' ? currentAccessibleIndex + 1 : currentAccessibleIndex - 1;
    
    if (targetIndex >= 0 && targetIndex < accessibleRows.length) {
      const targetRow = accessibleRows[targetIndex];
      // Re-use your handleEditRow / fetch maker workflow so targetRow loads cleanly
      await handleEditRow(targetRow);
    }
  };

  //C. Pass Navigation Props to SplitPaymentMakerModal
// In InstructionDetailPage.tsx JSX where <SplitPaymentMakerModal> is rendered:


<SplitPaymentMakerModal
  isOpen={isSplitPaymentModalOpen}
  mode={modalMode}
  initialData={selectedRowData}
  instructionId={instructionId}
  onClose={() => {
    setIsSplitPaymentModalOpen(false);
    setSelectedRowData(null);
  }}
  // Navigation strictly driven by accessibleRows
  onNavigate={accessibleRows.length > 1 ? handleModalNavigate : undefined}
  hasPrev={currentAccessibleIndex > 0}
  hasNext={currentAccessibleIndex < accessibleRows.length - 1}
  currentIndex={currentAccessibleIndex + 1}
  totalCount={accessibleRows.length}
/>