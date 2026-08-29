// Option 1: Turn ADDITIONAL_INFO_COLUMNS into a Function (Cleanest & Standard AG-Grid Pattern)
//Change ADDITIONAL_INFO_COLUMNS at the top of InstructionDetailPage.tsx to accept the status:


const ALLOWED_STATUSES = ['PAYMENT_MAKER', 'PAYMENT_CHECKER', 'PAYMENT_REWORK'];

export const getAdditionalInfoColumns = (status?: string): ColDef<InstructionAccountResponse>[] => {
  const isActionAllowed = status && ALLOWED_STATUSES.includes(status.toUpperCase());

  return [
    // ... all your other columns (Debit Account, Currency, Amount, etc.)
    {
      headerName: 'Actions',
      colId: 'actions',
      minWidth: 110,
      width: 110,
      sortable: false,
      filter: false,
      pinned: 'right',
      hide: !isActionAllowed, // <--- AG-Grid hides the whole column when true
      cellRenderer: (p: ICellRendererParams<InstructionAccountResponse, any, AdditionalInfoGridContext>) => (
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
      )
    }
  ];
};



// Then in PaymentInfoCard (Line 551), update columnDefs:



<AgGridReact
  rowData={instructionAccounts}
  columnDefs={getAdditionalInfoColumns(status)}
  defaultColDef={{ resizable: true, sortable: true, filter: true, flex: 1, minWidth: 100 }}
  animateRows
  pagination
  paginationPageSize={5}
  paginationPageSizeSelector={[5, 10, 20]}
  rowHeight={46}
  headerHeight={40}
  context={{ onEditRow }}
/>