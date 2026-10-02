//Step 1: Fix accessibleRows in InstructionDetailPage.tsx
// Remove the fallback to allRows so only enabled, reviewable rows are included:

// 1. Get ONLY the records the current user can actually review/act on
const accessibleRows = useMemo(() => {
    const allRows: any[] =
      (Array.isArray(instructionAccounts) && instructionAccounts.length > 0)
        ? instructionAccounts
        : (instruction as any)?.instructionAccounts ||
          (instruction as any)?.accounts ||
          [];

    const activeUserId = String(typeof getUserId === 'function' ? getUserId() : '').trim().toUpperCase();

    return allRows.filter((row: any) => {
      // Maker ID (Segregation of Duties: Creator cannot review/approve their own record)
      const makerId = String(
        row?.paymentTransactionWorkflow?.makerId ||
        row?.actionDetails?.makerSoeId ||
        row?.makerId ||
        ''
      ).trim().toUpperCase();

      if (activeUserId && makerId && activeUserId === makerId) {
        return false;
      }

      // Checker IDs: If current user already approved as Checker 1, they cannot review again
      const checker1Id = String(
        row?.paymentTransactionWorkflow?.checker1Id ||
        row?.actionDetails?.checker1SoeId ||
        row?.checker1Id ||
        ''
      ).trim().toUpperCase();

      if (activeUserId && checker1Id && activeUserId === checker1Id) {
        return false;
      }

      // Check status: Must be pending review, not completed/rejected or uncreated
      const status = String(
        row?.status ||
        row?.paymentTransactionWorkflow?.status ||
        row?.actionDetails?.statusCode ||
        ''
      ).toUpperCase();

      if (status.includes('NOT CREATED') || status.includes('REJECTED') || status.includes('COMPLETED')) {
        return false;
      }

      return true;
    });
  }, [instructionAccounts, instruction]);


  // 2. Lock modalMode in handleEditRow
  //  (No Flipping to Maker)Prevent handleEditRow from
  //  resetting to 'maker' when you navigate between records:  
  //  Around line 1825 in InstructionDetailPage.tsx:   

  // Ensure we do not drop to maker mode if we are in the Checker stage
  const isChecker = 
  modalMode === 'checker' || 
  (typeof activePaymentMode !== 'undefined' && activePaymentMode === 'checker') ||
  Boolean(rowData?.status?.includes('Checker'));

setModalMode(isChecker ? 'checker' : 'maker');
setShowSplitMakerModal(true);



//3. Ensure handleModalNavigate Passes the Filtered Record
// Right below currentAccessibleIndex:

const handleModalNavigate = async (direction: 'prev' | 'next') => {
    const targetIndex = direction === 'next' ? currentAccessibleIndex + 1 : currentAccessibleIndex - 1;
    if (targetIndex >= 0 && targetIndex < accessibleRows.length) {
      const targetRow = accessibleRows[targetIndex];
      await handleEditRow(targetRow);
    }
  };


  //4. <SplitPaymentMakerModal> JSX (Lines 5923–5935)Ensure 
  // the navigation props point to accessibleRows:   


  hasPrev={currentAccessibleIndex > 0}
          hasNext={currentAccessibleIndex < accessibleRows.length - 1}
          currentIndex={currentAccessibleIndex + 1}
          totalCount={accessibleRows.length}
          onNavigate={accessibleRows.length > 1 ? handleModalNavigate : undefined}
          onClose={() => {
            setShowSplitMakerModal(false);
            setSelectedRowData(null);
          }}
          initialData={selectedRowData}