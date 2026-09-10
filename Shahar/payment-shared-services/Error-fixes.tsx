// File 2: Usage in InstructionDetailPage.tsx
// 1. Add Indexing & Navigation Handler (above line 1399)


// Track active LATAM account row index for record flipping
const selectedLatamIndex = useMemo(() => {
  if (!selectedRowData || !instructionAccounts) return undefined;
  const idx = instructionAccounts.findIndex(
    (acc) =>
      acc === selectedRowData ||
      ((acc as any)?.id != null && (acc as any)?.id === (selectedRowData as any)?.id)
  );
  return idx >= 0 ? idx : undefined;
}, [instructionAccounts, selectedRowData]);

// Handle Next / Previous account navigation
const handleNavigateLatamAccount = useCallback((direction: 'prev' | 'next') => {
  if (!selectedRowData || !instructionAccounts || instructionAccounts.length === 0) return;
  const currentIndex = instructionAccounts.findIndex(
    (acc) =>
      acc === selectedRowData ||
      ((acc as any)?.id != null && (acc as any)?.id === (selectedRowData as any)?.id)
  );
  if (currentIndex < 0) return;

  const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  const target = instructionAccounts[targetIndex];
  if (target) {
    setSelectedRowData(target);
  }
}, [selectedRowData, instructionAccounts]);



// 2. Mount Modal in JSX (replacing lines 3356–3392)


{instruction && instruction.region !== 'NAM' && (
  <SplitPaymentMakerModal
    isOpen={showSplitMakerModal}
    instructionId={instructionId}
    mode={activePaymentMode}
    wireIndex={selectedLatamIndex}
    movementAmount={selectedRowData?.amount ? String(selectedRowData.amount) : undefined}
    documents={Array.isArray(documents) && documents.length > 0 ? documents : (instruction as any)?.documents || []}
    hasPrev={selectedLatamIndex !== undefined && selectedLatamIndex > 0}
    hasNext={selectedLatamIndex !== undefined && selectedLatamIndex < instructionAccounts.length - 1}
    currentIndex={selectedLatamIndex !== undefined ? selectedLatamIndex + 1 : 1}
    totalCount={instructionAccounts?.length || 1}
    onNavigate={handleNavigateLatamAccount}
    onClose={() => {
      setShowSplitMakerModal(false);
      setSelectedRowData(null);
    }}
    initialData={
      selectedRowData
        ? {
            debtorAccountNumber: String(selectedRowData.debitAccountNumber || ''),
            instructedAmountCurrencyCode: String(selectedRowData.currency || 'USD'),
            instructedAmount: typeof selectedRowData.amount === 'number' ? selectedRowData.amount : 0,
            debtorName: (instruction as any)?.clientName || (instruction as any)?.dealName || '',
            painPaymentMethodType: selectedRowData.transactionType || 'CBT',
            requestedExecutionDate: (instruction as any)?.valueDate || new Date().toISOString().split('T')[0],
          }
        : null
    }
    onPaymentSuccess={(refId?: string, payload?: Pain001Model) => {
      notification.success({
        title: 'Payment Processed',
        content: `Payment instruction ${refId || ''} processed successfully.`,
      });
      setShowSplitMakerModal(false);
      setSelectedRowData(null);
      loadAll();
    }}
  />
)}