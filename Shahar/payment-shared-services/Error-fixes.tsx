// 1. In InstructionDetailPage.tsx


//

// Initialize with accounts from instruction when available
useEffect(() => {
  if (instruction?.accounts) {
  setGridAccounts(instruction.accounts);
  }
  }, [instruction?.accounts]);



  const handleAccountsUpdate = (updatedAccounts: any[]) => {
    console.log('Received updated accounts in InstructionDetailPage:', updatedAccounts);
    setGridAccounts(updatedAccounts);
  };


  