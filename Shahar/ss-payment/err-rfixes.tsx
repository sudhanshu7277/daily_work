// 1. Update createEmptyPain001 in src/pages/ss-payment/types/models.ts
//Allow numeric fields in Pain001Model to be initialized to empty strings "" or numbers:


export interface Pain001Model {
    // ...
    chargesAmount: number | string;
    instructedAmount: number | string;
    // ...
  }
  
  export function createEmptyPain001(): Pain001Model {
    const empty: Record<string, unknown> = {};
    PAIN001_STRING_FIELDS.forEach(f => {
      empty[f] = '';
    });
    PAIN001_NUMERIC_FIELDS.forEach(f => {
      empty[f] = ''; // <-- Change from 0 to ''
    });
    empty.applicationName = 'ADR';
    empty.applicationModule = 'ADR';
    empty.region = '';
    return empty as Pain001Model;
  }


  // 2. Update Form Initialization in PaymentChild.tsx
// Ensure the state initialization honors empty strings instead of coercing empty values into 0:

  // Form State Initialization
  const [formValues, setFormValues] = useState<Pain001Model>(() => {
    const empty = createEmptyPain001() as Record<string, any>;
    const init = { ...(initialData || {}), ...(paymentInput?.paymentModel || {}) } as Record<string, any>;
    const values: Record<string, any> = {};

    fieldConfig.forEach(cfg => {
      const rawVal = cfg.value ?? init[cfg.fieldName] ?? empty[cfg.fieldName] ?? '';
      values[cfg.fieldName] = rawVal;
    });

    [
      'debtorAddressLines1',
      'debtorAddressLines2',
      'creditorAddressLines1',
      'creditorAddressLines2',
      'debtorState',
      'creditorState'
    ].forEach(f => {
      if (!(f in values)) {
        values[f] = String(init[f] ?? '');
      }
    });

    return { ...empty, ...values } as Pain001Model;
  });


  // 3. Update Amount Handlers in PaymentChild.tsx
// Parse the string value to a number only when calling onAmountChange 
// for the hardcap verification API:


// Form State Mutator
const setField = useCallback((fieldName: keyof Pain001Model, value: unknown, emitEvent = true) => {
    setFormValues(prev => {
      const next = { ...prev, [fieldName]: value };
      if (emitEvent) {
        onFormChange?.(next as unknown as Record<string, unknown>);
      }
      return next;
    });

    if (isRepair && !newlyModifiedFields.includes(fieldName as string)) {
      setNewlyModifiedFields(prev => [...prev, fieldName as string]);
    }
  }, [isRepair, newlyModifiedFields, onFormChange]);

  // Live Hardcap Threshold Integration (400ms Debounce)
  const instructedAmountChange = (rawInputVal?: string) => {
    if (amountDebouncer.current) clearTimeout(amountDebouncer.current);
    amountDebouncer.current = setTimeout(() => {
      const valToParse = rawInputVal !== undefined ? rawInputVal : String(formValues.instructedAmount ?? '');
      const parsedAmount = parseFloat(valToParse);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setHardcapChecking(false);
        setHardcapError('');
        setHardcapSuccessMessage('');
        return;
      }

      setHardcapChecking(true);
      onAmountChange?.({
        instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
        instructedAmount: parsedAmount // <-- Converted string to number
      });
    }, 400);
  };

  const onAmountBlur = () => {
    const parsedAmount = parseFloat(String(formValues.instructedAmount ?? ''));
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      onAmountChange?.({
        instructedAmountCurrencyCode: formValues.instructedAmountCurrencyCode || 'USD',
        instructedAmount: parsedAmount
      });
    }
  };


  // 4. Update the JSX for Transaction Amount in PaymentChild.tsx
// Ensure the input renders empty and pipes its event value directly:


<div className="form-field">
                <label className="field-label">
                  {pacsFormVerbiages.TransactionAmount || 'Transaction Amount'}
                  <span className="mandatory-indicator"> *</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter Transaction Amount"
                  value={formValues.instructedAmount === 0 ? '' : (formValues.instructedAmount ?? '')}
                  readOnly={isFieldReadonly('instructedAmount')}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const rawVal = e.target.value;
                    setField('instructedAmount', rawVal);
                    instructedAmountChange(rawVal);
                  }}
                  onBlur={() => {
                    validateSingleDualBlindKeyField('instructedAmount');
                    onAmountBlur();
                  }}
                />
                {hardcapChecking && <div className="hint">{pacsFormVerbiages.ValidatingHardcapLimit || 'Validating hardcap limit...'}</div>}
                {hardcapError && <div className="field-error">{hardcapError}</div>}
                {hardcapSuccessMessage && <div className="success-message">{hardcapSuccessMessage}</div>}
              </div>


// 5. Ensure buildPain001FromForm in src/pages/ss-payment/utils/paymentUtils.ts Converts to Numbers on Final Output

export function buildPain001FromForm(
    formValues: Pain001Model | Record<string, unknown> | Record<string, any>
  ): Pain001Model {
    const base = createEmptyPain001();
    const result: Record<string, any> = { ...base };
    const raw = formValues as Record<string, any>;
  
    Object.keys(base).forEach(key => {
      if (raw[key] === undefined) return;
      result[key] = NUMERIC_FIELDS.has(key as any)
        ? (parseFloat(String(raw[key])) || 0) // <-- Converts string state back to number for backend payload
        : raw[key];
    });
  
    if (raw.creditorAgentAccountNumber && !result.creditorAgentPostalAddress) {
      result.creditorAgentPostalAddress = raw.creditorAgentAccountNumber;
    }
  
    return result as Pain001Model;
  }