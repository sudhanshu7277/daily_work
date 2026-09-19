const handleAccountsUpdate = (updatedAccounts: any[]) => {
  console.log('Received updated accounts in InstructionDetailPage:', updatedAccounts);
  if (Array.isArray(updatedAccounts) && updatedAccounts.length > 0) {
    // 1. Update instruction state cleanly by replacing its accounts array
    setInstruction((prev) => (prev ? { ...prev, accounts: updatedAccounts } : prev));

    // 2. If you also have a separate state for accounts (line 5027), update it as well:
    setInstructionAccounts?.(updatedAccounts);
  }
};