// InstructionDetailPage.tsx.


// 1. Top of File: Import the Split Modal
//Around line 45–55 where other modals are imported:


import { SplitPaymentMakerModal } from '../../components/instructions/SplitPaymentMakerModal';


// 2. Above Component: Column Context & Definitions
//Around line 340–390 (where ADDITIONAL_INFO_COLUMNS is 
// declared), ensure the actions column uses the AG Grid context renderer:

type AdditionalInfoGridContext = {
    onEditRow: (row: InstructionAccountResponse) => Promise<void> | void;
  };
  
  const ADDITIONAL_INFO_COLUMNS: ColDef<InstructionAccountResponse>[] = [
    {
      headerName: 'AWS Account?',
      field: 'awsAccount',
      minWidth: 120,
      sortable: true,
      filter: true,
      cellRenderer: renderAwsAccountCell
    },
    {
      headerName: 'Debit Account',
      field: 'debitAccountNumber',
      minWidth: 140,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayText(p.data?.debitAccountNumber)
    },
    {
      headerName: 'Txn System',
      field: 'transactionSystem',
      minWidth: 130,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayText(p.data?.transactionSystem)
    },
    {
      headerName: 'Currency',
      field: 'currency',
      minWidth: 100,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayText(p.data?.currency)
    },
    {
      headerName: 'Txn Qty',
      field: 'transactionQuantity',
      minWidth: 100,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayNumber(p.data?.transactionQuantity)
    },
    {
      headerName: 'Txn Type',
      field: 'transactionType',
      minWidth: 120,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayText(p.data?.transactionType)
    },
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
      cellRenderer: (p: ICellRendererParams<InstructionAccountResponse, any, AdditionalInfoGridContext>) => {
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


  // 3. Update PaymentInfoCard Props and Context
//Around line 475–515, accept onEditRow and attach it to context:

const PaymentInfoCard = ({
    loadingAccounts,
    instructionAccounts,
    onEditRow
  }: {
    loadingAccounts: boolean;
    instructionAccounts: InstructionAccountResponse[];
    onEditRow?: (row: InstructionAccountResponse) => Promise<void> | void;
  }) => {
    let content: React.ReactNode;
  
    if (loadingAccounts) {
      content = (
        <El className="lmn-text-center lmn-py-16px">
          <Loading tip="Loading accounts..." />
        </El>
      );
    } else if (!Array.isArray(instructionAccounts) || instructionAccounts.length === 0) {
      content = (
        <El className="lmn-text-center lmn-py-16px" style={{ color: 'var(--lmn-text-weak, #888)', fontSize: 13 }}>
          No Information to Display
        </El>
      );
    } else {
      content = (
        <div className="ag-theme-quartz" style={{ width: '100%', height: 360 }}>
          <AgGridReact
            rowData={instructionAccounts}
            columnDefs={ADDITIONAL_INFO_COLUMNS}
            defaultColDef={{ resizable: true, sortable: true, filter: true, flex: 1, minWidth: 100 }}
            animateRows
            pagination
            paginationPageSize={5}
            paginationPageSizeSelector={[5, 10, 20]}
            rowHeight={46}
            headerHeight={40}
            context={{ onEditRow }} // <-- Connects the click handler to the Edit button
          />
        </div>
      );
    }
  
    return (
      <Card className="lmn-mb-12px">
        <Card header>Payment Info</Card>
        <Card body>{content}</Card>
      </Card>
    );
  };


  // 4. Inside InstructionDetailPage(): State, Mode Routing & Click Handler
//Inside the main function body around line 920–950:

export default function InstructionDetailPage() {
    // Existing states...
    const [instruction, setInstruction] = useState<GabInstruction | null>(null);
  
    // 1. Add Modal & Row Selection State
    const [showSplitMakerModal, setShowSplitMakerModal] = useState<boolean>(false);
    const [selectedRowData, setSelectedRowData] = useState<InstructionAccountResponse | null>(null);
  
    // 2. Strict status mapping for PAYMENT_MAKER, PAYMENT_CHECKER, and PAYMENT_REWORK
    const activePaymentMode: 'maker' | 'checker' | 'repair' = useMemo(() => {
      const rawStatus = String(instruction?.status || '').toUpperCase().trim();
      if (rawStatus === 'PAYMENT_CHECKER') {
        return 'checker';
      }
      if (rawStatus === 'PAYMENT_REWORK') {
        return 'repair';
      }
      // Handles 'PAYMENT_MAKER' and any other initial status
      return 'maker';
    }, [instruction?.status]);
  
    // 3. Edit click handler that captures row data and executes the document API fetch
    const handleEditPaymentAccount = useCallback(async (row: InstructionAccountResponse) => {
      setSelectedRowData(row);
      setShowSplitMakerModal(true);
  
      try {
        const docsList = Array.isArray(documents) ? documents : [];
        const targetDoc =
          selectedDocument ||
          docsList.find((d) => d.documentType === 'PAYMENT_INSTRUCTION') ||
          (docsList.length > 0 ? docsList[0] : null);
  
        if (targetDoc && typeof handlePreviewDocument === 'function') {
          await handlePreviewDocument(targetDoc);
        }
      } catch (err) {
        console.warn('Failed to fetch document blob on Edit click:', err);
      }
    }, [documents, selectedDocument, handlePreviewDocument]);


    // 5. Pass onEditRow where PaymentInfoCard is Rendered
//Around line 1990–2010 in the Task Overview tab:

<PaymentInfoCard
  loadingAccounts={loadingAccounts}
  instructionAccounts={instructionAccounts}
  onEditRow={handleEditPaymentAccount}
/>


// 6. Render the Modal at the Bottom of InstructionDetailPage.tsx
//Around line 3230–3260 (just before the final </div> or closing fragment):

<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  mode={activePaymentMode}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  document={selectedDocument || (Array.isArray(documents) && documents.length > 0 ? documents[0] : null)}
  documents={Array.isArray(documents) ? documents : []}
  onSelectDocument={handlePreviewDocument}
  previewUrl={previewUrl || null}
  previewLoading={previewLoading || false}
  initialData={
    selectedRowData
      ? {
          // Values extracted directly from the clicked AG Grid row:
          debtorAccountNumber: String(selectedRowData.debitAccountNumber || ''),
          instructedAmountCurrencyCode: String(selectedRowData.currency || 'USD'),
          instructedAmount: typeof selectedRowData.amount === 'number' ? selectedRowData.amount : 0,

          // Instruction context defaults:
          debtorName: (instruction as any)?.clientName || (instruction as any)?.dealName || '',
          painPaymentMethodType: selectedRowData.transactionType || 'CBT',
          requestedExecutionDate: (instruction as any)?.valueDate || new Date().toISOString().split('T')[0]
        }
      : null
  }
  onPaymentSuccess={(refId: string) => {
    notification.success({
      title: 'Payment Processed',
      content: `Payment instruction ${refId} processed successfully.`
    });
    loadAll();
  }}
/>



