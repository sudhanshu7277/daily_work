// Solution: Use AG Grid gridOptions.context (Cleanest & Idiomatic)
//Step 1: Define the Grid Context Type (above ADDITIONAL_INFO_COLUMNS)
// Near line 340 of InstructionDetailPage.tsx:


type AdditionalInfoGridContext = {
    onEditRow: (row: InstructionAccountResponse) => Promise<void> | void;
  };


  // Step 2: Update ADDITIONAL_INFO_COLUMNS
// Replace the Actions column renderer to use p.context.onEditRow:

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
  


  // Step 2: Update ADDITIONAL_INFO_COLUMNS
//Replace the Actions column renderer to use p.context.onEditRow:

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


  // Step 3: Update PaymentInfoCard Props and JSX
//Update PaymentInfoCard (around line 475) so it accepts onEditRow and 
// passes it into AG Grid's context:

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
            context={{ onEditRow }} // <-- Injects handler into cellRenderer
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



  // Step 4: Add the Handler inside InstructionDetailPage & Pass to PaymentInfoCard
//Inside the main InstructionDetailPage function body (around line 1250):

const handleEditPaymentAccount = async (row: InstructionAccountResponse) => {
    setSelectedRowData(row);
  
    const targetDoc = selectedDocument || (documents.length > 0 ? documents[0] : null);
    if (targetDoc && !previewUrl) {
      await handlePreviewDocument(targetDoc);
    }
  
    setShowSplitMakerModal(true);
  };


  // Then in the Task Overview tab where PaymentInfoCard is rendered (around line 1995):

  <PaymentInfoCard
  loadingAccounts={loadingAccounts}
  instructionAccounts={instructionAccounts}
  onEditRow={handleEditPaymentAccount}
/>