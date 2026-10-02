//Step 1: Update handleModalNavigate
// Near line 1860 (where accessibleRows and 
// currentAccessibleIndex were declared), add this navigation function:

const handleModalNavigate = async (direction: 'prev' | 'next') => {
    const targetIndex = direction === 'next' ? currentAccessibleIndex + 1 : currentAccessibleIndex - 1;
    if (targetIndex >= 0 && targetIndex < accessibleRows.length) {
      const targetRow = accessibleRows[targetIndex];
      await handleEditRow(targetRow);
    }
  };


  //Step 2: Update <SplitPaymentMakerModal> in JSX
  //  (Lines 5923–5956)Replace lines 5923 to 5956 in 
  // image_43.png and image_44.png with this clean block:  
  
  
  hasPrev={currentAccessibleIndex > 0}
          hasNext={currentAccessibleIndex < accessibleRows.length - 1}
          currentIndex={currentAccessibleIndex + 1}
          totalCount={accessibleRows.length || 1}
          onNavigate={accessibleRows.length > 1 ? handleModalNavigate : undefined}
          onClose={() => {
            setShowSplitMakerModal(false);
            setSelectedRowData(null);
          }}
          initialData={selectedRowData}