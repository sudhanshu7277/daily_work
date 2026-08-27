// 


{
  headerName: 'Actions',
  colId: 'actions',
  minWidth: 110,
  width: 110,
  sortable: false,
  filter: false,
  pinned: 'right',
  cellRenderer: (p: ICellRendererParams<InstructionAccountResponse, any, AdditionalInfoGridContext>) => {
    const ALLOWED_STATUSES = ['PAYMENT_MAKER', 'PAYMENT_CHECKER', 'PAYMENT_REWORK'];
    
    // Check status from grid context
    const currentStatus = p.context?.status || p.context?.instruction?.status;
    if (!ALLOWED_STATUSES.includes(currentStatus)) {
      return null;
    }

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




//Make sure your grid context passes instruction or status:

<AgGridReact
  rowData={instruction?.accountResponses || []}
  columnDefs={ADDITIONAL_INFO_COLUMNS}
  context={{
    status: instruction?.status,
    onEditRow: handleEditRow
  }}
/>