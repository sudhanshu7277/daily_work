// Route onEditRow to open showAddPaymentModal when the instruction is in Maker status:


const gridContext = useMemo(() => ({
  onEditRow: (rowData: any) => {
    setSelectedRowData(rowData);

    // If it's Payment Maker, open the exact same working Maker modal:
    if (instruction?.status?.toUpperCase() === 'PAYMENT_MAKER') {
      setShowAddPaymentModal(true);
    } else {
      // Checker/Review flows keep split modal
      setShowSplitMakerModal(true);
    }
  },
}), [instruction?.status]);


// In InstructionDetailPage.tsx (around lines 3634–3650):

// Ensure initialData receives selectedRowData:


<Modal
  visible={showAddPaymentModal}
  onCancel={() => {
    setShowAddPaymentModal(false);
    setSelectedRowData(null);
  }}
  onClose={() => {
    setShowAddPaymentModal(false);
    setSelectedRowData(null);
  }}
  footer={null}
  width="85vw"
>
  <PaymentParent
    mode="maker"
    instructionId={instructionId}
    initialData={selectedRowData} // Pre-fills row data when editing
    onPaymentSuccess={(refId?: string) => {
      setShowAddPaymentModal(false);
      setSelectedRowData(null);
      setPaymentSuccessInfo({ refId: refId || 'N/A' });
      loadAll();
    }}
    onPaymentError={(errorMessage: string) => {
      setShowAddPaymentModal(false);
      setSelectedRowData(null);
      setPaymentErrorInfo(errorMessage);
    }}
    onClose={() => {
      setShowAddPaymentModal(false);
      setSelectedRowData(null);
    }}
  />
</Modal>


context={gridContext}