//1. Suppress Unused Address-Lookup API Calls (Lines 26 & 453–565)
//Line 26: Comment out addressService in the ../services import:

import {
  ValidationEffect,
  genericValidator,
  // addressService,
  LATAM_COUNTRIES,
} from "../services";


//Lines 453–506: Comment out the Debtor address lookup useEffect (debtorAddrDebouncer).

// Lines 508–565: Comment out the Creditor address lookup useEffect (creditorAddrDebouncer).


//2. Capture 0 in instructedAmountChange (Lines 586–591)
// Emit 0 to onAmountChange when the user enters 0, while still clearing hardcap messages:

if (isNaN(parsedAmount) || parsedAmount <= 0) {
  setHardcapChecking(false);
  setHardcapError("");
  setHardcapSuccessMessage("");
  if (!isNaN(parsedAmount) && parsedAmount === 0) {
    onAmountChange?.({
      instructedAmountCurrencyCode:
        formValues.instructedAmountCurrencyCode || "USD",
      instructedAmount: 0,
    });
  }
  return;
}


//3. Capture 0 in onAmountBlur (Line 606)
// Change parsedAmount > 0 to parsedAmount >= 0:

if (!isNaN(parsedAmount) && parsedAmount >= 0) {

//4. Switch #instructedAmount to type="text" and Preserve 0 (Lines 1129–1135)
// Replace type="number" with type="text" (inputMode="decimal") and remove the === 0 ? "" 
// coercion so 0 stays visible in the input:

type="text"
      inputMode="decimal"
      placeholder="Enter Transaction Amount"
      value={formValues.instructedAmount ?? ""}