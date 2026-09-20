// Step 1: Fix initialData in PaymentParent.tsxUpdate line 1288 so initialData 
// is supplied to <SSPaymentFlow/> during both 'maker' and 'checker' modes:   

<SSPaymentFlow
  paymentInput={dynamicPaymentInput}
  fieldConfig={PARENT_FIELD_CONFIG as any}
  // Allow initialData to be passed for both maker and checker
  initialData={initialData ?? undefined}
  isMakerMode={activeTab === 'maker'}
  isCheckerMode={activeTab === 'checker'}
  isRepairMode={activeTab === 'repair'}
  repairReviewFieldList={activeTab === 'repair' ? repairReviewFieldList : undefined}
  repairNewlyModifyFieldList={activeTab === 'repair' ? repairNewlyModifiedFields : undefined}
  hardcapResultReceived={activeTab === 'maker' ? makerHardcapResult : undefined}
  onAmountChange={activeTab === 'maker' ? handleAmountChange : undefined}
  onFailedFieldListChange={activeTab === 'checker' ? setCheckerFailedFields : undefined}
  onFormChange={handleFormChange}
  onPaymentOutput={handlePaymentOutput}
/>



// Step 2: Ensure activeTab Switches to 'checker' in PaymentParent.tsx
// Check where activeTab is initialized in PaymentParent.tsx (around lines 130–180):

// Sync activeTab with the incoming mode prop whenever the modal opens or mode changes
useEffect(() => {
  if (mode) {
    setActiveTab(mode);
  }
}, [mode]);


/// Step 3: Pass the Full Matched Record into initialDataIn 
// InstructionDetailPage.tsx, where <SplitPaymentMakerModal .../> is
//  invoked (lines 5551–5575 visible in image_36.png):   
// Currently, initialData is manually constructing only 
// debtorAccountNumber and defaults. Pass the full record 
// properties from selectedRowData so SSPaymentFlow receives the fields:   


<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  instructionId={instructionId}
  instruction={instruction}
  mode={modalMode} // 'checker' or 'maker'
  wireIndex={selectedLatamIndex}
  movementAmount={selectedRowData?.amount ? String(selectedRowData.amount) : undefined}
  initialData={{
    // Merge existing selectedRowData with the full matched action details
    ...(selectedRowData?.matchedAction || {}),
    ...selectedRowData,
    // Ensure form keys map to what SSPaymentFlow expects:
    paymentMethod: selectedRowData?.painPaymentMethodType || selectedRowData?.matchedAction?.painPaymentMethodType || 'BKT',
    instructedAmount: selectedRowData?.instructedAmount || selectedRowData?.matchedAction?.instructedAmount || selectedRowData?.amount,
    instructedAmountCurrencyCode: selectedRowData?.instructedAmountCurrencyCode || selectedRowData?.currency,
    debtorAccountNumber: selectedRowData?.debtorAccountNumber || selectedRowData?.debitAccountNumber?.replace(/\//g, ''),
    debtorName: selectedRowData?.debtorName || selectedRowData?.matchedAction?.debtorName,
    creditorName: selectedRowData?.creditorName || selectedRowData?.matchedAction?.creditorName,
    creditorAccount: selectedRowData?.creditorAccount || selectedRowData?.matchedAction?.creditorAccount,
  }}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  // ... other props
/>