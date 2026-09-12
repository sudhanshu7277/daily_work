//Step 1: Memoize all callback props passed to <SSPaymentFlow>
In PaymentParent.tsx, lines 658–668 show multiple inline functions:


const handleFormChange = useCallback((val: any) => {
  if (activeTab === 'repair') {
    setRepairNewlyModifiedFields((prev) => {
      const changed = Object.keys(val).filter(
        (k) => val[k] !== (dynamicPaymentInput.paymentModel as any)?.[k]
      );
      if (changed.length === 0) return prev;
      const nextSet = new Set([...prev, ...changed]);
      return nextSet.size === prev.length ? prev : Array.from(nextSet);
    });
  }
}, [activeTab, dynamicPaymentInput.paymentModel]);


//And update lines 658–668 to use stable references:

<SSPaymentFlow
  paymentInput={dynamicPaymentInput}
  fieldConfig={PARENT_FIELD_CONFIG as any}
  initialData={activeTab === 'maker' ? (initialData ?? undefined) : undefined}
  isMakerMode={activeTab === 'maker'}
  isCheckerMode={activeTab === 'checker'}
  isRepairMode={activeTab === 'repair'}
  repairReviewFieldList={activeTab === 'repair' ? repairReviewFieldList : undefined}
  repairNewlyModifyFieldList={activeTab === 'repair' ? repairNewlyModifiedFields : undefined}
  onFormChange={handleFormChange}
  onPaymentOutput={handlePaymentOutput}
/>

useEffect(() => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
    
    if (url.includes('address-lookup')) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return originalFetch(...args);
  };

  return () => {
    window.fetch = originalFetch;
  };
}, []);
