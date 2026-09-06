formatAccountList(accounts: { accountType: string; accountNumber: string }[]): string {
  const grouped = new Map<string, string[]>();

  if (!Array.isArray(accounts) || accounts.length === 0) {
    return '';
  }

  for (const a of accounts) {
    if (!a) continue;

    const rawType = (a.accountType || '').trim();
    let type = rawType;
    let acNumber: string = '';

    // Check if the entry represents a card
    const isCreditCard = rawType.toLowerCase() === 'credit card';
    const isDebitCard = /debit\s*card/i.test(rawType);

    if (isCreditCard || isDebitCard) {
      // 1. Sanitize to pure digits (handles '0005-1912...', spaces, or plain numbers)
      const digitsOnly = String(a.accountNumber || '').replace(/\D/g, '');

      // 2. Remove system prefix padding:
      // Standard card numbers are 16 digits.
      // If the backend adds a prefix (e.g. 20 digits like 0005-...), take the last 16.
      // If it is 16 or fewer digits with leading zeros, strip the zeros.
      let cleanDigits = digitsOnly;
      if (cleanDigits.length > 16) {
        cleanDigits = cleanDigits.slice(-16);
      } else {
        cleanDigits = cleanDigits.replace(/^0+/, '');
      }

      // 3. Apply standard 4-digit grouping (XXXX-XXXX-XXXX-XXXX)
      if (cleanDigits.length === 16) {
        acNumber = cleanDigits.match(/.{1,4}/g)?.join('-') || cleanDigits;
      } else if (cleanDigits.length > 0) {
        // Fallback if card length is non-standard (e.g. 15-digit Amex or partial)
        acNumber = cleanDigits.match(/.{1,4}/g)?.join('-') || cleanDigits;
      } else {
        acNumber = String(a.accountNumber || '');
      }
    } else {
      // Standard formatting for all other non-card account types (Chequing, Savings, etc.)
      acNumber = this.formatAccountNumbersInText(a.accountNumber);
    }

    const nums = grouped.get(type) ?? [];
    nums.push(acNumber);
    grouped.set(type, nums);
  }

  return Array.from(grouped.entries())
    .map(([type, nums]) => `<strong>${type}:</strong> ${nums.join('; ')}`)
    .join('<br>');
}

// QUESTION TO QA

Copy and paste this message on the defect or Slack/Teams:

Regarding Homeowner ReadiLine Account Number:

The UI currently receives 0000-000022090124214 in the API response (which contains only the 11-digit internal account number 22090124214).

In Customer Connect, the expected number is displayed as 9105-2220-9012-4214 (16 digits).

Because the 9105 prefix does not exist anywhere in the payload sent to the frontend, could backend confirm:

Is there an API field mapping update needed from NCCS to send the full 16-digit customer card/account number?

Or is the UI supposed to display the 11-digit account number directly without the 16-digit hyphenation?



//1. TypeScript (.component.ts)
//On Line 129, add Validators.pattern(/^[a-zA-Z0-9 ]*$/) to holdName (allows alphanumeric characters and spaces):


this.applyForm = this.formBuilder.group({
  holdName: ['', [
    Validators.required, 
    Validators.maxLength(50),
    Validators.pattern(/^[a-zA-Z0-9 ]*$/)
  ]],
  managerName: ['', [Validators.required]],
  lawyerEmail: ['', [Validators.required, Validators.email]]
});