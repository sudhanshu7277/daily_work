//Here are the exact, surgical changes to PaymentParent.tsx that enforce 
// non-negative numeric input and > 0 validation for Transaction Amount (
// instructedAmount) (and numeric-only >= 0 for Charges Amount 
// (chargesAmount)) across Maker, Checker, and Repair modes while keeping all existing BIC rules, 
// dual-blind rekey logic, and form configs intact.


// 1. Add a Non-Negative > 0 FieldValidationRule for instructedAmount (Lines 90–106)
// Add POSITIVE_INSTRUCTED_AMOUNT_RULE right above registerPaymentFormRules 
// (line 90) and register it on fields.instructedAmount inside registerPaymentFormRules.
//  This ensures the form validator shows the inline validation message and blocks 0, 0.00,
//   negative values, and non-numeric strings in Maker, Checker (re-key), 
//   and Repair modes—even before the hardcap API runs:

export const POSITIVE_AMOUNT_MESSAGE = 'Transaction Amount must be greater than 0';

export const POSITIVE_INSTRUCTED_AMOUNT_RULE: FieldValidationRule = {
  priority: 25,
  description: 'Transaction Amount must be a numeric value greater than 0',
  conditions: [],
  effect: {
    required: true,
    pattern: '^(?!0+(\\.0+)?$)\\d+(\\.\\d+)?$',
    patternMessage: POSITIVE_AMOUNT_MESSAGE,
  },
};


//Inside registerPaymentFormRules (around line 94), update 
// the early-return guard ID check to POSITIVE_INSTRUCTED_AMOUNT_RULE
//  (or keep DEBTOR_COUNTRY_TOWN_RULE.id and register instructedAmount 
// right below AGENT_BIC_FIELDS.forEach on line 99):


AGENT_BIC_FIELDS.forEach((field) => {
    fields[field] = [BIC_11_CHARACTER_RULE, BIC_8_OR_11_CHARACTER_RULE, ...(fields[field] ?? [])];
  });
  fields.instructedAmount = [
    POSITIVE_INSTRUCTED_AMOUNT_RULE,
    ...(fields.instructedAmount ?? []),
  ];


  //2. Add the Container-Level Numeric Input Guard on payment-component-wrapper 
  // (Around Line 538 & Line 1265)Since instructedAmount (and chargesAmount) 
  // are rendered inside <SSPaymentFlow/> as type="text", attach a ref to 
  // <div className="payment-component-wrapper"> (line 1265) to intercept 
  // keystrokes, paste events, and programmatic input across Maker, Checker, 
  // and Repair modes:   Transaction Amount (instructedAmount): Blocks -, +, e/E, 
  // letters, and duplicate . characters so the user can never type or paste a negative 
  // or non-numeric value.Charges Amount (chargesAmount): Same numeric-only guard 
  // (>= 0, allowing 0 / 0.00 while blocking - and letters).   Add this right above 
  // hardcapInputRef (around line 538):   


  const paymentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = paymentWrapperRef.current;
    if (!wrapper) return;

    const isNumericAmountInput = (target: EventTarget | null): target is HTMLInputElement => {
      if (!(target instanceof HTMLInputElement)) return false;
      const identifier = [
        target.name,
        target.id,
        target.placeholder,
        target.getAttribute('aria-label'),
      ]
        .filter(Boolean)
        .join(' ');
      return /transaction\s*amount|instructedamount|charges\s*amount|chargesamount/i.test(identifier);
    };

    const sanitizeNonNegativeDecimal = (raw: string): string => {
      const cleaned = raw.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isNumericAmountInput(e.target)) return;
      if (
        e.ctrlKey ||
        e.metaKey ||
        ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
      ) {
        return;
      }
      if (!/^[0-9.]$/.test(e.key) || (e.key === '.' && e.target.value.includes('.'))) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isNumericAmountInput(e.target)) return;
      const pasted = e.clipboardData?.getData('text') ?? '';
      if (pasted.trim().startsWith('-') || Number(pasted) < 0) {
        e.preventDefault();
      }
    };

    const handleInput = (e: Event) => {
      if (!isNumericAmountInput(e.target)) return;
      const sanitized = sanitizeNonNegativeDecimal(e.target.value);
      if (sanitized !== e.target.value) {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        nativeSetter?.call(e.target, sanitized);
        e.target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    wrapper.addEventListener('keydown', handleKeyDown, true);
    wrapper.addEventListener('paste', handlePaste, true);
    wrapper.addEventListener('input', handleInput, true);

    return () => {
      wrapper.removeEventListener('keydown', handleKeyDown, true);
      wrapper.removeEventListener('paste', handlePaste, true);
      wrapper.removeEventListener('input', handleInput, true);
    };
  }, []);


  //And attach ref={paymentWrapperRef} on line 1265:   

  <div ref={paymentWrapperRef} className="payment-component-wrapper">


  </div>


//3. Parse String Amount & Block <= 0 in handleAmountChange (Lines 551–569)
// Because the hardcap verify API may not reject 0 on its own, parse the 
// string instructedAmount explicitly in handleAmountChange (used by both 
// Maker and Repair via tracksHardcap) and reject <= 0, NaN, or empty values 
// before calling hardcapService.verifyHardCap:


const numericAmount = Number(String(instructedAmount ?? '').trim());
    if (!instructedAmount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      hardcapInputRef.current = null;
      setMakerHardcapResult(null);
      return;
    }


//And on line 568, pass the parsed numeric value to the hardcap API:   

paymentAmount: numericAmount,


//4. Enforce instructedAmount > 0 Across Maker, Checker & Repair in handlePaymentOutput (Lines 810–855)
//In handlePaymentOutput (lines 810–855), parse pData.instructedAmount as a number 
// and require numericAmount > 0 (plus chargesAmount >= 0 when populated) so Submit 
// Payment (maker), Approve Payment (checker), and Resubmit Repaired Payment (repair) 
// remain disabled if 0, 0.00, or a negative value ever reaches form state:

const rawAmountStr = String(pData.instructedAmount ?? '').trim();
    const numericAmount = Number(rawAmountStr);
    const isPositiveInstructedAmount =
      rawAmountStr !== '' && Number.isFinite(numericAmount) && numericAmount > 0;

    const rawChargesStr = String(pData.chargesAmount ?? '').trim();
    const isValidChargesAmount =
      rawChargesStr === '' ||
      (Number.isFinite(Number(rawChargesStr)) && Number(rawChargesStr) >= 0);

    const isAmountValid = isPositiveInstructedAmount && isValidChargesAmount;


//Apply isAmountValid to both branches in handlePaymentOutput:Line 812 (Maker & Repair initial form validity):   

// 1)Line 812 (Maker & Repair initial form validity):

const effectiveValid = newValid && isAmountValid;
setIsCurrentFormValid((prev) => (prev !== effectiveValid ? effectiveValid : prev));

// 2) Line 834 (Checker mode form validity):  

setIsCurrentFormValid(
    Boolean(output?.isValid) && isBktBicCountryValid && isAmountValid
  );


  //(Note: isCheckerRejectDisabled on line 1257 only checks isSubmitting, 
  // so the Checker can still click Reject even if an invalid amount is present.)  
  
  //5. Guard isRekeyMismatch Against <= 0 in Checker Mode (Lines 377–381)Update lines 377–381 in isRekeyMismatch so a 
  // checker re-keying 0 or a negative number is always flagged as a mismatch:   

  if (field === 'instructedAmount') {   
    const cNum = Number(checkerVal);
    return !checkerVal || !Number.isFinite(cNum) || cNum <= 0 || Number(makerVal) !== cNum;
  }
 