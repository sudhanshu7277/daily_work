// Step 1: Update the Callback Handler in InstructionDetailPage.tsxIn InstructionDetailPage.tsx (around line 5024):   Check what setter manages instructionAccounts (typically setInstructionAccounts or similar). 
// Update handleAccountsUpdate to update that state:   

const handleAccountsUpdate = (updatedAccounts: any[]) => {
  console.log('Received updated accounts in InstructionDetailPage:', updatedAccounts);
  if (Array.isArray(updatedAccounts) && updatedAccounts.length > 0) {
    setInstructionAccounts(updatedAccounts);
  }
};


//Step 2: Auto-Run the Merge on Initial Page Load
//Because the main table on InstructionDetailPage needs to d
// isplay "Payment Checker" and "Review" before anyone ever clicks on a row modal:

//In InstructionDetailPage.tsx, wherever instructionAccounts or 
// instruction is fetched or set on mount, execute mergeAccountsWithActionDetails there as well:


// Add near where instruction data loads in InstructionDetailPage.tsx:
useEffect(() => {
  if (instructionAccounts && instructionAccounts.length > 0) {
    // details can be fetched from fetchDetailsForAction() or your details constant
    const enriched = mergeAccountsWithActionDetails(instructionAccounts, details);
    setInstructionAccounts(enriched);
  }
}, [/* your trigger or instructionAccounts on initial load */]);


//Step 3: Verify the Grid Table Columns
//In InstructionDetailPage.tsx, search for where the table columns are defined (usually columnDefs or table headers):

// Status column:
// Change the field or value getter from static 'Payment Maker' to:


params.data?.status || 'Payment Maker'


