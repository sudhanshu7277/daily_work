//1. Add the Inline Validation Rule for instructedAmount (Lines 90–105)
//Check how validationRulesService works in your existing registerPaymentFormRules (lines 93–105): 
// fields holds FieldValidationRule[] keyed by fieldName. To display "please enter amount greater than 0" when the user enters 0 (or 0.00 / non-positive) without interfering with empty/required handling or any other field:

//Add POSITIVE_INSTRUCTED_AMOUNT_RULE right above registerPaymentFormRules (line 90) and 
// attach it only to fields.instructedAmount:


export const POSITIVE_AMOUNT_MESSAGE = 'please enter amount greater than 0';

export const POSITIVE_INSTRUCTED_AMOUNT_RULE: FieldValidationRule = {
  priority: 25,
  description: 'Transaction Amount must be greater than 0',
  conditions: [
    {
      sourceField: 'instructedAmount',
      operator: 'neq',
      value: '',
    },
  ],
  effect: {
    pattern: '^(?!0+(\\.0+)?$)\\d+(\\.\\d+)?$',
    patternMessage: POSITIVE_AMOUNT_MESSAGE,
  },
};


//(Notice the conditions: [{ sourceField: 'instructedAmount', operator: 'neq', value: '' }] — this ensures the rule only evaluates once the user has actually typed something, avoiding any clash with the library's built-in required: true check when the field is blank!)

//And inside registerPaymentFormRules (around line 97):

fields.instructedAmount = [
  POSITIVE_INSTRUCTED_AMOUNT_RULE,
  ...(fields.instructedAmount ?? []),
];


//2. Block - and Non-Numeric Characters in Transaction Amount via Keystroke/Paste Guard (Lines 538 & 1265)
// To stop the user from entering -0999 or letters in the type="text" Transaction Amount input—without 
// dispatching synthetic input events that caused issues earlier—attach a lightweight keydown + paste 
// listener on paymentWrapperRef:


const paymentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = paymentWrapperRef.current;
    if (!wrapper) return;

    const isTransactionAmountInput = (target: EventTarget | null): target is HTMLInputElement => {
      if (!(target instanceof HTMLInputElement)) return false;
      const identifier = [
        target.name,
        target.id,
        target.getAttribute('aria-label'),
      ]
        .filter(Boolean)
        .join(' ');
      return /instructedamount|transaction\s*amount/i.test(identifier);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTransactionAmountInput(e.target)) return;
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
      if (!isTransactionAmountInput(e.target)) return;
      const pasted = e.clipboardData?.getData('text') ?? '';
      if (!/^\d+(\.\d+)?$/.test(pasted.trim())) {
        e.preventDefault();
      }
    };

    wrapper.addEventListener('keydown', handleKeyDown, true);
    wrapper.addEventListener('paste', handlePaste, true);

    return () => {
      wrapper.removeEventListener('keydown', handleKeyDown, true);
      wrapper.removeEventListener('paste', handlePaste, true);
    };
  }, []);


  //And attach ref={paymentWrapperRef} on line 1265:

  <div ref={paymentWrapperRef} className="payment-component-wrapper">


  </div>

  //3. Parse String instructedAmount & Reject <= 0 in handleAmountChange and handlePaymentOutput
// Since instructedAmount is now a string coming out of SSPaymentFlow:

// In handleAmountChange (lines 551–569) — parse as Number so 0 / <= 0 / NaN never
//  triggers the hardcap API, and pass a number to verifyHardCap:


const numericAmount = Number(String(instructedAmount ?? '').trim());
if (!instructedAmount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
  hardcapInputRef.current = null;
  setMakerHardcapResult(null);
  return;
}

//(And on line 568: paymentAmount: numericAmount,)

// In handlePaymentOutput (lines 810–835) — ensure Number(pData.instructedAmount) > 0 
// before allowing isCurrentFormValid to be true:


const rawAmountStr = String(pData.instructedAmount ?? '').trim();
const numericAmount = Number(rawAmountStr);
const isPositiveAmount =
  rawAmountStr !== '' && Number.isFinite(numericAmount) && numericAmount > 0;
const effectiveValid = newValid && isPositiveAmount;
setIsCurrentFormValid((prev) => (prev !== effectiveValid ? effectiveValid : prev));


//(And in checker mode at line 834: setIsCurrentFormValid(Boolean(output?.isValid) && isBktBicCountryValid && isPositiveAmount);)

//In isRekeyMismatch (lines 377–381) — reject <= 0 if a checker re-keys 0 or a negative value:

if (field === 'instructedAmount') {
  const cNum = Number(checkerVal);
  return !checkerVal || !Number.isFinite(cNum) || cNum <= 0 || Number(makerVal) !== cNum;
}






///



export const registerPaymentFormRules = (): void => {
  const rules = validationRulesService.getRules();
  if (rules.formRules?.some((rule) => rule.id === DEBTOR_COUNTRY_TOWN_RULE.id)) return;
  const fields = { ...(rules.fields ?? {}) };
  AGENT_BIC_FIELDS.forEach((field) => {
    fields[field] = [BIC_11_CHARACTER_RULE, BIC_8_OR_11_CHARACTER_RULE, ...(fields[field] ?? [])];
  });
  fields.instructedAmount = [
    POSITIVE_INSTRUCTED_AMOUNT_RULE,
    ...(fields.instructedAmount ?? []),
  ];
  validationRulesService.setRules({
    ...rules,
    fields,
    formRules: [...(rules.formRules ?? []), DEBTOR_COUNTRY_TOWN_RULE],
  });
};






////////////FINAL CHANGES

//Here is the exact placement for both blocks in PaymentParent.tsx:   
// 1. First Block (isPositiveAmount & effectiveValid — inside handlePaymentOutput)Search 
// for const handlePaymentOutput = useCallback( (around line 825–835) and place it 
// right after if (!pData) { setIsCurrentFormValid(false); return; } (replacing the 
// old setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));):   


const pData: any = output?.paymentData;
      if (!pData) {
        setIsCurrentFormValid(false);
        return;
      }

      const rawAmountStr = String(pData.instructedAmount ?? '').trim();
      const numericAmount = Number(rawAmountStr);
      const isPositiveAmount =
        rawAmountStr !== '' && Number.isFinite(numericAmount) && numericAmount > 0;
      const effectiveValid = newValid && isPositiveAmount;
      setIsCurrentFormValid((prev) => (prev !== effectiveValid ? effectiveValid : prev));


//And ~20 lines lower inside that same handlePaymentOutput function (in the if 
// (activeTab === 'checker') block), update the existing setIsCurrentFormValid(...) 
// line to include && isPositiveAmount:   


setIsCurrentFormValid(Boolean(output?.isValid) && isBktBicCountryValid && isPositiveAmount);


//2. Second Block (if (field === 'instructedAmount') — inside isRekeyMismatch)Search for const 
// isRekeyMismatch (around line 390–400, above the PaymentParent component definition) and replace
//  the existing if (field === 'instructedAmount') block with:   


if (field === 'instructedAmount') {
  const cNum = Number(checkerVal);
  return !checkerVal || !Number.isFinite(cNum) || cNum <= 0 || Number(makerVal) !== cNum;
}
