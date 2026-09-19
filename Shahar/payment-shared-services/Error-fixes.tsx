/**
 * Strips '/' and whitespace from account numbers.
 */
const cleanAccountNumber = (acc: string | number | null | undefined): string => {
  if (!acc) return '';
  return String(acc).replace(/\//g, '').trim();
};

/**
 * Enriches existing instruction.accounts rows directly with updated status,
 * button text, and action properties without creating extra nested arrays.
 */
export const mergeAccountsWithActionDetails = (
  accountsList: any[] = [],
  actionDetailsList: any[] = []
) => {
  return accountsList.map((account) => {
    const accInstId = String(account?.instructionId ?? '').trim();
    const accDebitNo = cleanAccountNumber(account?.debitAccountNumber);

    // Find the single corresponding action entry
    const matchedAction = actionDetailsList.find((action) => {
      const actionInstId = String(action?.parentReferenceId ?? '').trim();
      const actionDebitNo = cleanAccountNumber(action?.debtorAccountNumber);
      return accInstId === actionInstId && accDebitNo === actionDebitNo;
    });

    const isMakerState = matchedAction?.state === 'MAKER';

    return {
      // 1. Preserve all existing account fields exactly as they are
      ...account,

      // 2. Conditionally update status & action button text
      status: isMakerState ? 'Payment Checker' : (account?.status || 'Payment Maker'),
      actionText: isMakerState ? 'Review' : 'Edit',

      // 3. Append only the required fields from details-for-action
      state: matchedAction?.state ?? null,
      paymentId: matchedAction?.paymentId ?? null,
      transactionId: matchedAction?.transactionId ?? null,
    };
  });
};


//How to Use Inside loadInitialDetailsForActionReplace 
// the previous comparison call inside PaymentParent.tsx:   

const details = await fetchDetailsForAction(); // or dummy data
if (isMounted) {
  setActionDetailsList(details);

  const rawAccounts = instruction?.accounts || [];
  const updatedAccounts = mergeAccountsWithActionDetails(rawAccounts, details);

  console.log('Updated instruction.accounts:', updatedAccounts);
  // Pass updatedAccounts to grid state or callback
}