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