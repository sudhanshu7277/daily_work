// 4. Integration into InstructionDetailPage.tsx
//A. Import Modal (near line 50 of InstructionDetailPage.tsx):


import { SplitPaymentMakerModal } from '../../components/instructions/SplitPaymentMakerModal';

// B. Add State Hooks (around line 888):

const [showSplitMakerModal, setShowSplitMakerModal] = useState<boolean>(false);
const [selectedRowData, setSelectedRowData] = useState<InstructionAccountResponse | null>(null);


// C. Update ADDITIONAL_INFO_COLUMNS (around line 345) to include the Actions column with Edit button:

const ADDITIONAL_INFO_COLUMNS: ColDef<InstructionAccountResponse>[] = [
    {
      headerName: 'AWS Account?',
      field: 'awsAccount',
      minWidth: 130,
      sortable: true,
      filter: true,
      cellRenderer: renderAwsAccountCell
    },
    {
      headerName: 'Debit Account',
      field: 'debitAccountNumber',
      minWidth: 150,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayText(p.data?.debitAccountNumber)
    },
    {
      headerName: 'Txn System',
      field: 'transactionSystem',
      minWidth: 140,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayText(p.data?.transactionSystem)
    },
    {
      headerName: 'Currency',
      field: 'currency',
      minWidth: 110,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayText(p.data?.currency)
    },
    {
      headerName: 'Txn Qty',
      field: 'transactionQuantity',
      minWidth: 110,
      sortable: true,
      filter: true,
      valueGetter: (p) => toDisplayNumber(p.data?.transactionQuantity)
    },
    {
      headerName: 'Txn Type',
      field: 'transactionType',
      minWidth: 130,
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
      minWidth: 120,
      sortable: false,
      filter: false,
      pinned: 'right',
      cellRenderer: (p: ICellRendererParams<InstructionAccountResponse>) => {
        return (
          <Button
            color="primary"
            size="sm"
            onClick={async () => {
              setSelectedRowData(p.data || null);
  
              // Automatically resolve target document from documents array
              const targetDoc = selectedDocument || (documents.length > 0 ? documents[0] : null);
              if (targetDoc && !previewUrl) {
                await handlePreviewDocument(targetDoc);
              }
  
              setShowSplitMakerModal(true);
            }}
          >
            Edit
          </Button>
        );
      }
    }
  ];

  // D. Render Component (at the bottom of InstructionDetailPage.tsx, right before the final </> or </div>):

  <SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  document={selectedDocument || (documents.length > 0 ? documents[0] : null)}
  previewUrl={previewUrl}
  previewLoading={previewLoading}
  initialData={
    selectedRowData
      ? {
          debtorAccountNumber: selectedRowData.debitAccountNumber,
          instructedAmountCurrencyCode: selectedRowData.currency,
          instructedAmount: selectedRowData.amount
        }
      : null
  }
  onSubmitPayment={async (outputPayload) => {
    try {
      await submitNamCashwire(instructionId, outputPayload);
      notification.success({
        title: 'Submitted',
        content: 'Payment instruction updated successfully.'
      });
      loadAll();
    } catch (err: any) {
      notification.danger({
        title: 'Error',
        content: err?.message || 'Failed to submit payment instruction.'
      });
    }
  }}
/>

