// Step 1: Fix setField in PaymentChild.tsx
//In src/pages/ss-payment/components/PaymentChild.tsx, replace the 
// setField definition with this clean version that updates state 
// outside of the updater function:


const setField = useCallback((fieldName: keyof Pain001Model, value: unknown, emitEvent = true) => {
    setFormValues(prev => {
      if ((prev as any)[fieldName] === value) return prev;
      return { ...prev, [fieldName]: value };
    });

    if (isRepair) {
      setNewlyModifiedFields(prev => (prev.includes(fieldName as string) ? prev : [...prev, fieldName as string]));
    }

    if (emitEvent) {
      // Use queueMicrotask or direct call outside the state updater
      queueMicrotask(() => {
        setFormValues(latest => {
          onFormChange?.(latest as unknown as Record<string, unknown>);
          return latest;
        });
      });
    }
  }, [isRepair, onFormChange]);


  // Step 2: Update PaymentParent.tsx (Repair Mode Section)
//In src/pages/ss-payment/components/PaymentParent.tsx,
//  update the Repair Mode JSX block around line 580:


<div className="payment-component-wrapper">
            <PaymentChild
              paymentInput={repairPaymentInput}
              fieldConfig={PARENT_FIELD_CONFIG}
              isRepairMode={true}
              repairReviewFieldList={repairReviewFieldList}
              repairNewlyModifyFieldList={repairNewlyModifiedFields}
              onPaymentOutput={handleRepairOutput}
              onFormChange={val => {
                // Safely track newly modified fields without triggering render loops
                const modifiedKeys = Object.keys(val).filter(
                  key => (val as any)[key] !== (sampleRepairData as any)[key]
                );
                if (modifiedKeys.length > 0) {
                  setRepairNewlyModifiedFields(prev => Array.from(new Set([...prev, ...modifiedKeys])));
                }
              }}
            />
          </div>