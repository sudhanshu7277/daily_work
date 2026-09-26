// Step 1: Add the new dedicated function in history.component.ts
// Add this new standalone method right above or below formatAccountNumbersInText:


formatHoldingAccountNumber(accountNumber: string, accountType?: string): string {
  if (!accountNumber) return '';

  const cleanNum = accountNumber.trim();

  // If already formatted with sub-account/branch parens like "23970666(10)" (RIS profile accounts)
  // or specifically an InvestorLine/RIS type, preserve it as-is without hyphenating:
  if (/\(\d+\)$/.test(cleanNum) || /investorline|ris/i.test(accountType || '')) {
    return cleanNum;
  }

  // Fallback to existing format logic for other standard accounts
  return this.formatAccountNumbersInText(cleanNum);
}


//Step 2: Use it inside formatAccountListIn history.component.ts, 
// replace line 511 in formatAccountList (image_35.png):   

// Replace line 511:
// acNumber = this.formatAccountNumbersInText(a.accountNumber);

acNumber = this.formatHoldingAccountNumber(a.accountNumber, rawType);