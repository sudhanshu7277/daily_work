// Step 1: Update ADDITIONAL_INFO_COLUMNS
//In InstructionDetailPage.tsx (around line 349), remove pinned: 
// 'right', give Actions an explicit width, and assign a standalone renderer function:

// 1. Define standalone Action Cell Renderer
const renderPaymentInfoActionCell = (p: ICellRendererParams<InstructionAccountResponse, any, AdditionalInfoGridContext>) => {
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
  };
  
  // 2. Updated Column Definitions
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
      cellRenderer: renderPaymentInfoActionCell
    }
  ];


  // Step 2: Ensure PaymentInfoCard passes context into AgGridReact
//In PaymentInfoCard (around line 496):

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
            context={{ onEditRow }}
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


  // Step 3: Check Regional Branching
//In renderOverviewTab (around line 1946), verify whether this instruction is rendering under the instruction.region === 'NAM' block:

//If region === 'NAM': It renders <NamPaymentInfoCard .../> (which uses getNamPaymentColumns).

///If region !== 'NAM' (as seen on instruction 500520): It renders <PaymentInfoCard .../> (which uses ADDITIONAL_INFO_COLUMNS).

//Ensure onEditRow is passed where PaymentInfoCard is rendered:




<PaymentInfoCard
  loadingAccounts={loadingAccounts}
  instructionAccounts={instructionAccounts}
  onEditRow={async (row) => {
    setSelectedRowData(row);
    const targetDoc = selectedDocument || (documents.length > 0 ? documents[0] : null);
    if (targetDoc && !previewUrl) {
      await handlePreviewDocument(targetDoc);
    }
    setShowSplitMakerModal(true);
  }}
/>

