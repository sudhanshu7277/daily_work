//Step 1: Centralize the Actionability Check
//In InstructionDetailPage.tsx, right above getAdditionalInfoColumns
//  (or right above the component), define this single reusable 
// function so the Grid and the Modal use the exact same truth:


export const isRowReviewableForUser = (row: any, activeUserId: string): boolean => {
    const user = String(activeUserId || '').trim().toUpperCase();
  
    // 1. Maker check (Segregation of Duties: Creator cannot review/approve)
    const makerId = String(
      row?.maker ||
      row?.paymentTransactionWorkflow?.makerId ||
      row?.actionDetails?.makerSoeId ||
      ''
    ).trim().toUpperCase();
  
    if (user && makerId && user === makerId) {
      return false;
    }
  
    // 2. Checkers check (No checker can check twice)
    const checker1 = String(row?.checker1 || row?.paymentTransactionWorkflow?.checker1Id || '').trim().toUpperCase();
    const checker2 = String(row?.checker2 || row?.paymentTransactionWorkflow?.checker2Id || '').trim().toUpperCase();
    const checker3 = String(row?.checker3 || row?.paymentTransactionWorkflow?.checker3Id || '').trim().toUpperCase();
  
    if (user && (user === checker1 || user === checker2 || user === checker3)) {
      return false;
    }
  
    // 3. Status check: Only actionable Checker stages (e.g. Checker1 Approved waiting for Checker2, or Payment Created)
    const statusCode = String(row?.statusCode || row?.paymentTransactionWorkflow?.statusCode || '').toUpperCase();
    const statusDesc = String(row?.statusDescription || row?.status || '').toUpperCase();
  
    if (
      statusDesc.includes('NOT CREATED') ||
      statusCode === 'COMPLETED' ||
      statusDesc.includes('COMPLETED') ||
      statusDesc.includes('REJECTED')
    ) {
      return false;
    }
  
    return true;
  };


  //Step 2: Use It in accessibleRows & Index Calculation
// Inside InstructionDetailPage:


// 1. Filter rows to ONLY the ones where Review is enabled for this user
const accessibleRows = useMemo(() => {
    // Look at rowsWithDynamicStatus or instructionAccounts (whichever AG Grid is rendering)
    const sourceRows: any[] =
      (Array.isArray(rowsWithDynamicStatus) && rowsWithDynamicStatus.length > 0)
        ? rowsWithDynamicStatus
        : (Array.isArray(instructionAccounts) && instructionAccounts.length > 0)
        ? instructionAccounts
        : (instruction as any)?.instructionAccounts || [];

    const activeUser = typeof getUserId === 'function' ? getUserId() : '';

    return sourceRows.filter((r: any) => isRowReviewableForUser(r, activeUser));
  }, [rowsWithDynamicStatus, instructionAccounts, instruction]);

  // 2. Find current position within accessibleRows
  const currentAccessibleIndex = useMemo(() => {
    if (!selectedRowData || accessibleRows.length === 0) return 0;
    const currentId = String(
      selectedRowData.accountId ||
      selectedRowData.paymentId ||
      selectedRowData.instructionAccountId ||
      ''
    );
    const idx = accessibleRows.findIndex((r: any) => {
      const rId = String(r.accountId || r.paymentId || r.instructionAccountId || '');
      return rId && rId === currentId;
    });
    return idx >= 0 ? idx : 0;
  }, [selectedRowData, accessibleRows]);

  // 3. Navigation handler that ONLY flips across accessibleRows
  const handleModalNavigate = async (direction: 'prev' | 'next') => {
    const nextIdx = direction === 'next' ? currentAccessibleIndex + 1 : currentAccessibleIndex - 1;
    if (nextIdx >= 0 && nextIdx < accessibleRows.length) {
      const targetRow = accessibleRows[nextIdx];
      // Keep mode locked to checker
      setModalMode('checker');
      await handleEditRow(targetRow);
    }
  };


  // 
  <SplitPaymentMakerModal Lock InstructionDetailPage.tsx ```tsx and block degrades hasPrev="{currentAccessibleIndex" in instruction="{instruction}" instructionId="{instructionId}" isOpen="{showSplitMakerModal}" it lines mode navigation never props: so the to update> 0}
hasNext={currentAccessibleIndex < accessibleRows.length - 1}
currentIndex={currentAccessibleIndex + 1}
totalCount={accessibleRows.length}
onNavigate={accessibleRows.length > 1 ? handleModalNavigate : undefined}
onClose={() => {
setShowSplitMakerModal(false);
setSelectedRowData(null);
}}
initialData={selectedRowData}