// Step 1: Fix PaymentChild.tsx (around lines 410–430)
//Wrap the callback emissions in queueMicrotask or s
// etTimeout so parent state updates occur after React finishes rendering the child component:

useEffect(() => {
    const payload: PaymentComponentOutput = {
      paymentData: buildPain001FromForm(formValues),
      isValid: isFormValid,
      outputMessage: isFormValid ? 'Valid' : 'Invalid form requirements',
      dualBlindKeyResult: isDualBlindEnabled ? (isDualBlindPassed ? 'passed' : 'failed') : null,
      isDualBlindKeyPassed: isDualBlindPassed
    };

    // Defer parent notification to the next tick to prevent render collisions
    queueMicrotask(() => {
      onPaymentOutput?.(payload);
      onFormValidityChange?.({
        validForm: isFormValid,
        makerPayload: formValues as unknown as Record<string, unknown>
      });
    });
  }, [
    isFormValid,
    formValues,
    isDualBlindEnabled,
    isDualBlindPassed,
    onPaymentOutput,
    onFormValidityChange
  ]);


  // Step 2: Fix setField in PaymentChild.tsx
//Ensure the change notification in setField does not execute during an active state transition:


const setField = useCallback((fieldName: keyof Pain001Model, value: unknown, emitEvent = true) => {
    setFormValues(prev => {
      if ((prev as any)[fieldName] === value) return prev;
      return { ...prev, [fieldName]: value };
    });

    if (isRepair) {
      setNewlyModifiedFields(prev => (prev.includes(fieldName as string) ? prev : [...prev, fieldName as string]));
    }

    if (emitEvent) {
      queueMicrotask(() => {
        onFormChange?.({ ...formValues, [fieldName]: value } as unknown as Record<string, unknown>);
      });
    }
  }, [isRepair, formValues, onFormChange]);


  