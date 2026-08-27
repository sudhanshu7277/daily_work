// 1. Define Allowed Status Set & Factory Function
//In InstructionDetailPage.tsx, replace the static ADDITIONAL_INFO_COLUMNS 
// array with a factory function that computes column definitions based on instruction?.status:


const ALLOWED_ACTION_STATUSES = [
  'PAYMENT_MAKER',
  'PAYMENT_CHECKER',
  'PAYMENT_REWORK'
];

export const getAdditionalInfoColumns = (
  status?: string
): ColDef<InstructionAccountResponse>[] => {
  const isActionAllowed = status && ALLOWED_ACTION_STATUSES.includes(status.toUpperCase());

  return [
    // ... preceding columns (e.g. Value Date, Debit Account Number, CCY)
    {
      headerName: 'Amount',
      colId: 'amount',
      minWidth: 130,
      sortable: true,
      filter: true,
      valueGetter: (p) => {
        const amount = p.data?.amount;
        if (typeof amount !== 'number' || !Number.isFinite(amount)) return '-';
        return formatCurrency(amount, p.data?.currency);
      }
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      minWidth: 110,
      width: 110,
      sortable: false,
      filter: false,
      pinned: 'right',
      hide: !isActionAllowed, // Hidden for PAYMENT_SUPER_CHECKER, APPROVED, etc.
      cellRenderer: (
        p: ICellRendererParams<InstructionAccountResponse, any, AdditionalInfoGridContext>
      ) => {
        return (
          <Button
            color="primary"
            size="sm"
            onClick={() => {
              if (p.data && p.context?.onEditRow) {
                p.context.onEditRow(p.data);
              }
            }}
          >
            Edit
          </Button>
        );
      }
    }
  ];
};


// 2. Integration inside InstructionDetailPage.tsx Component Body
//Inside InstructionDetailPage:


export const InstructionDetailPage: FC = () => {
  // ... existing state & fetch logic (e.g. instruction details)
  const [instruction, setInstruction] = useState<InstructionDetailResponse | null>(null);

  // Dynamically memoize columns whenever instruction status updates
  const additionalInfoColumns = useMemo(() => {
    return getAdditionalInfoColumns(instruction?.status);
  }, [instruction?.status]);

  // Context passed to AG Grid cell renderer
  const gridContext: AdditionalInfoGridContext = useMemo(() => ({
    onEditRow: (rowData) => {
      // Map mode from status
      const currentMode = instruction?.status === 'PAYMENT_CHECKER'
        ? 'checker'
        : instruction?.status === 'PAYMENT_REWORK'
        ? 'repair'
        : 'maker';

      setSelectedRowData(rowData);
      setModalMode(currentMode);
      setIsSplitModalOpen(true);
    }
  }), [instruction?.status]);

  return (
    <div className="instruction-detail-page">
      {/* ... Instruction Summary Panels ... */}

      <div className="ag-theme-alpine" style={{ width: '100%', height: 320 }}>
        <AgGridReact
          rowData={instruction?.accountResponses || []}
          columnDefs={additionalInfoColumns}
          context={gridContext}
          // ... other grid options
        />
      </div>

      {/* Split Payment Modal */}
      <SplitPaymentMakerModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        mode={modalMode}
        document={selectedDoc}
        previewUrl={previewStreamUrl}
        initialData={selectedRowData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default InstructionDetailPage;