//


const handleEditRow = (row: InstructionAccountResponse) => {
  console.log('Selected row for edit/review:', row);
  setSelectedRowData(row);

  // Check row-level actionText, state, or status
  const isChecker =
    (row as any)?.actionText === 'Review' ||
    (row as any)?.state === 'MAKER' ||
    String((row as any)?.status).toUpperCase().includes('CHECKER');

  setModalMode(isChecker ? 'checker' : 'maker');
  setShowSplitMakerModal(true);
};