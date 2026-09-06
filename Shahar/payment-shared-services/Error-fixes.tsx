formatAccountList(accounts: { accountType: string; accountNumber: string }[]): string {
  const grouped = new Map<string, string[]>();

  for (const a of accounts) {
    let type = a.accountType;
    let acNumber: string = '';

    // Check if account is a Credit Card or Debit Card
    const isCard = /credit\s*card|mastercard|debit\s*card/i.test(type);

    if (isCard) {
      // Normalize any MasterCard label to Credit Card per Figma
      if (/mastercard/i.test(type)) {
        type = 'Credit Card';
      }

      // 1. Extract purely digits
      const digitsOnly = (a.accountNumber || '').replace(/\D/g, '');

      // 2. Remove leading prefix/zeros:
      // If padded (> 16 digits, e.g. 0005...), extract the 16 card digits from the end.
      // Otherwise, strip any leading zeroes.
      const cleanDigits = digitsOnly.length > 16 
        ? digitsOnly.slice(-16) 
        : digitsOnly.replace(/^0+/, '');

      // 3. Format as 4-digit groups (XXXX-XXXX-XXXX-XXXX)
      acNumber = cleanDigits.match(/.{1,4}/g)?.join('-') || cleanDigits;
    } else {
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