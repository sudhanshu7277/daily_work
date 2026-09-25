

<SSPaymentFlow
  key={`${activeTab}-${initialData?.accountId || initialData?.paymentId || initialData?.transactionId || initialData?.debtorAccountNumber || 'new'}`}
  paymentInput={dynamicPaymentInput}
  fieldConfig={dynamicFieldConfig as any}
  initialData={(stableInitialPaymentModel ?? initialData) as any}
  isMakerMode={activeTab === 'maker'}
  isCheckerMode={activeTab === 'checker'}
  isRepairMode={activeTab === 'repair'}
  repairReviewFieldList={activeTab === 'repair' ? repairReviewFieldList : undefined}
  repairNewlyModifyFieldList={activeTab === 'repair' ? repairNewlyModifyFieldList : undefined}
  
  // REMOVE 'checker' HERE (Only run for maker and repair):
  hardcapResultReceived={(activeTab === 'maker' || activeTab === 'repair') ? makerHardcapResult : undefined}
  onAmountChange={(activeTab === 'maker' || activeTab === 'repair') ? handleAmountChange : undefined}

  onFailedFieldListChange={activeTab === 'checker' ? setCheckerFailedFields : undefined}
  onFormChange={handleFormChange}
  onPaymentOutput={handlePaymentOutput}
/>


//Step 2: Ensure Checker Mode Does Not Run Verification on Amount
// Find the definition of handleAmountChange (usually located around line 1250–1350 in PaymentParent.tsx) and add an immediate early exit guard at the very top:

const handleAmountChange = async (amount: any, currency: any) => {
  // Never invoke backend verify in checker mode:
  if (activeTab === 'checker') {
    return;
  }

  // ... keep existing maker verify API call here ...
};