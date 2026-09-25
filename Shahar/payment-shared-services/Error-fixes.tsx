//1. Update the Props on <SSPaymentFlow>
// In PaymentParent.tsx around lines 1830–1838:


hardcapResultReceived={
  activeTab === 'checker'
    ? undefined
    : (activeTab === 'maker' || activeTab === 'repair')
    ? makerHardcapResult
    : undefined
}
onAmountChange={
  activeTab === 'checker'
    ? undefined
    : (activeTab === 'maker' || activeTab === 'repair')
    ? handleAmountChange
    : undefined
}

//2. Clear Any Stale Hardcap State on Checker Entry
//If makerHardcapResult retains data from a previous maker run, 
// clear it when activeTab === 'checker'. Near your tab switch handler or useEffect

useEffect(() => {
  if (activeTab === 'checker') {
    setMakerHardcapResult(null);
  }
}, [activeTab]);


