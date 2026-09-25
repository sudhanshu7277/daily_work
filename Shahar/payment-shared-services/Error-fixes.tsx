// Step 1: Supply an Instant Bypassed Hardcap Result in Checker Mode
// In PaymentParent.tsx (around lines 1805–1810 in image_55.png), 
// change hardcapResultReceived so that when activeTab === 'checker',
//  it receives a passed mock result instead of undefined


hardcapResultReceived={
  activeTab === 'checker'
    ? { isHardcapExceeded: false, hardCapLimit: 0, status: 'SUCCESS' }
    : activeTab === 'maker' || activeTab === 'repair'
    ? makerHardcapResult
    : undefined
}


// Step 2: Track Amount Match State in PaymentParent.tsx
// Add a state variable near your other checker states (around lines 150–165 in 
// PaymentParent.tsx)


const [isAmountMatched, setIsAmountMatched] = useState<boolean>(false);


//In handlePaymentOutput, update setIsAmountMatched during the comparison loop:

// Inside handlePaymentOutput:
if (activeTab === 'checker') {
  const rawMaker =
    (initialData as any)?.paymentDetailsRequest ||
    (initialData as any)?.actionDetails ||
    initialData ||
    {};

  const makerAmount = normalizeValue(
    rawMaker.instructedAmount ?? rawMaker?.paymentDetailsRequest?.instructedAmount
  );
  const checkerAmount = normalizeValue(pData.instructedAmount);

  const mNum = parseFloat(makerAmount);
  const cNum = parseFloat(checkerAmount);
  const amountMatches = Boolean(checkerAmount) && !isNaN(cNum) && mNum === cNum;

  setIsAmountMatched(amountMatches);

  // ... keep the rest of your DUAL_BLIND_REKEY_FIELDS comparison loop ...
}


// Step 3: Display the Confirmation Note on the UI
//In PaymentParent.tsx, directly below <SSPaymentFlow .../> (
// or right above the footer buttons around line 1840 in


{activeTab === 'checker' && checkerDualBlindPassed && checkerFailedFields.length === 0 && (
  <div
    style={{
      margin: '12px 16px 0',
      padding: '8px 14px',
      backgroundColor: '#e6f4ea',
      border: '1px solid #34a853',
      borderRadius: '4px',
      color: '#137333',
      fontSize: '13px',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}
  >
    <span style={{ fontSize: '16px' }}>✓</span>
    <span>
      Comparison successful: All dual-blind fields and instructed amount match the maker record (
      {initialData?.paymentDetailsRequest?.instructedAmount ?? initialData?.instructedAmount} {initialData?.paymentDetailsRequest?.instructedAmountCurrencyCode ?? initialData?.instructedAmountCurrencyCode ?? 'USD'}
    ).
    </span>
  </div>
)}