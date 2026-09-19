
/**
 * Strips '/' characters and whitespace from account numbers before comparison.
 */
const cleanAccountNumber = (acc: string | number | null | undefined): string => {
  if (!acc) return '';
  return String(acc).replace(/\//g, '').trim();
};

/**
 * Compares instruction accounts against details-for-action list.
 * Matches on instructionId and clean debitAccountNumber.
 */
export const compareAndMapAccountsWithActions = (
  accountsList: any[] = [],
  actionDetailsList: any[] = []
) => {
  return accountsList.map((account) => {
    // Current property names for instruction accounts
    const accountInstId = String(account?.instructionId ?? '').trim();
    const accountDebitNo = cleanAccountNumber(account?.debitAccountNumber);

    // Find all matching action records for this account/wire
    const matchedActions = actionDetailsList.filter((action) => {
      // Current property names in details-for-action response
      const actionInstId = String(action?.parentReferenceId ?? '').trim();
      const actionDebitNo = cleanAccountNumber(action?.debtorAccountNumber);

      const isInstIdMatch = accountInstId === actionInstId;
      const isAccountMatch = accountDebitNo === actionDebitNo;

      return isInstIdMatch && isAccountMatch;
    });

    return {
      ...account,
      // Boolean flag indicating if this wire has an action match
      hasActionMatch: matchedActions.length > 0,
      // Primary match (first record if single)
      matchedAction: matchedActions[0] || null,
      // Array of all matches if one instruction/account has multiple wires
      allMatchedActions: matchedActions,
    };
  });
};


//Implementation Inside PaymentParent.tsxInside 
// loadInitialDetailsForAction in PaymentParent.tsx:   


const details = await fetchDetailsForAction();
      if (isMounted) {
        setActionDetailsList(details);

        // Compare the two arrays
        const accounts = instruction?.accounts || [];
        const mergedGridData = compareAndMapAccountsWithActions(accounts, details);

        console.log('Successfully compared and merged grid data:', mergedGridData);
      }