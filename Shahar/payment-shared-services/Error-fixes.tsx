//The Fix
//In InstructionDetailPage.tsx:

// 1. Update accessibleRows to include instructionAccounts


const accessibleRows = useMemo(() => {
    // Read from instructionAccounts state first, then fallback to instruction object
    const allRows: any[] =
      (typeof instructionAccounts !== 'undefined' && Array.isArray(instructionAccounts) && instructionAccounts.length > 0)
        ? instructionAccounts
        : (instruction as any)?.instructionAccounts ||
          (instruction as any)?.accounts ||
          [];

    const activeUserId = typeof getUserId === 'function' ? getUserId() : '';

    const filtered = allRows.filter((r: any) => isRowActionableForUser(r, activeUserId, modalMode));
    
    // Fallback: If filter returns empty (e.g. while permissions/auth are hydrating), don't collapse to 0
    return filtered.length > 0 ? filtered : allRows;
  }, [instructionAccounts, instruction, modalMode]);


  //2. In the JSX of <SplitPaymentMakerModal>:
// Pass onNavigate={handleModalNavigate} unconditionally so the footer never vanishes:

hasPrev={currentAccessibleIndex > 0}
          hasNext={currentAccessibleIndex < (accessibleRows.length || 1) - 1}
          currentIndex={currentAccessibleIndex + 1}
          totalCount={accessibleRows.length || 1}
          onNavigate={handleModalNavigate}
          onClose={() => {
            setShowSplitMakerModal(false);
            setSelectedRowData(null);
          }}
          initialData={selectedRowData}