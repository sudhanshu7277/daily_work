// In InstructionDetailPage.tsx (around lines 3220–3248), replace the <SplitPaymentMakerModal/> JSX block with:\


<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  document={selectedDocument || (documents.length > 0 ? documents[0] : null)}
  documents={documents}
  onSelectDocument={handlePreviewDocument}
  previewUrl={previewUrl}
  previewLoading={previewLoading}
  initialData={
    selectedRowData
      ? {
          debtorAccountNumber: selectedRowData.debitAccountNumber,
          instructedAmountCurrencyCode: selectedRowData.currency,
          instructedAmount: selectedRowData.amount,
          debtorName: instruction?.clientName || instruction?.dealName || '',
          painPaymentMethodType: selectedRowData.transactionType || 'WIRE',
          requestedExecutionDate: instruction?.valueDate || new Date().toISOString().split('T')[0]
        }
      : null
  }
  onPaymentSuccess={(referenceId: string) => {
    notification.success({
      title: 'Payment Submitted',
      content: `Payment instruction ${referenceId} submitted successfully.`
    });
    loadAll();
  }}
/>


