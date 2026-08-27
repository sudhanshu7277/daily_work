// Step 1: Pass status into context on <AgGridReact .../>
//In InstructionDetailPage.tsx, update the <AgGridReact> 
// JSX where the grid is rendered to pass status inside the context prop:


<AgGridReact
  rowData={instruction?.accountResponses || []}
  columnDefs={ADDITIONAL_INFO_COLUMNS}
  context={{
    status: instruction?.status,
    onEditRow: (rowData) => {
      // your existing onEditRow logic
    }
  }}
  // other grid props...
/>



/// Step 2: Read p.context?.status in ADDITIONAL_INFO_COLUMNS
//Update lines 405–412 in ADDITIONAL_INFO_COLUMNS:


cellRenderer: (p: ICellRendererParams<InstructionAccountResponse, any, AdditionalInfoGridContext>) => {
  const ALLOWED_STATUSES = ['PAYMENT_MAKER', 'PAYMENT_CHECKER', 'PAYMENT_REWORK'];
  
  const currentStatus = p.context?.status;

  if (!currentStatus || !ALLOWED_STATUSES.includes(currentStatus.toUpperCase())) {
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


// Step 3 (Optional TypeScript Interface Update):
//If AdditionalInfoGridContext gives a type warning 
// about status, add status?: string; to its definition:

export interface AdditionalInfoGridContext {
  status?: string;
  onEditRow?: (data: InstructionAccountResponse) => void;
  [key: string]: any;
}

