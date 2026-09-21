// In history.component.ts, replace lines 417 to 419 inside formatAccountList:

// OLD (Lines 417-419):
} else {
  acNumber = this.formatAccountNumbersInText(a.accountNumber);
}


// Replace with:


// NEW:
} else {
  const digitsOnly = String(a.accountNumber || '').replace(/\D/g, '');
  if (digitsOnly.length === 16) {
    acNumber = digitsOnly.match(/.{1,4}/g)?.join('-') || a.accountNumber;
  } else {
    acNumber = this.formatAccountNumbersInText(a.accountNumber);
  }
}