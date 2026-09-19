// Part 2: Fix Status & Actions Columns in getAdditionalInfoColumns
// Change valueGetter on the Status column to cellRenderer, and pass p.data values:


{
  headerName: "Status",
  colId: "status",
  minWidth: 130,
  sortable: true,
  filter: true,
  // Change from valueGetter to cellRenderer so <StatusTag /> renders properly
  cellRenderer: (p: any) => {
    // Use the wire's own status (which we updated to "Payment Checker" / "PAYMENT_CHECKER")
    const rowStatus = p.data?.status || instruction?.status || "PAYMENT_MAKER";
    return (
      <StatusTag
        status={rowStatus as InstructionStatus}
        region={instruction?.region ?? "LATAM"}
      />
    );
  },
},
{
  headerName: "Actions",
  colId: "actions",
  minWidth: 110,
  width: 110,
  sortable: false,
  filter: false,
  pinned: "right",
  hide: !isActionAllowed,
  cellRenderer: (
    p: ICellRendererParams<InstructionAccountResponse, any, AdditionalInfoGridContext>
  ) => {
    // Reads the updated actionText or state directly from this specific row
    const isChecker = p.data?.actionText === "Review" || p.data?.state === "MAKER";
    const buttonLabel = isChecker ? "Review" : "Edit";

    return (
      <Button
        color="primary"
        size="sm"
        onClick={() => {
          if (p.data && p.context?.onEditRow) {
            console.log("p.data value on button click:", p.data);
            p.context.onEditRow(p.data);
          }
        }}
      >
        {buttonLabel}
      </Button>
    );
  },
},


//Option A: Track mode per selected row (Recommended)
// Add a state for the selected row's mode:


const [modalMode, setModalMode] = useState<'maker' | 'checker' | 'repair'>('maker');


// Define handleEditRow above that JSX:

const handleEditRow = (row: InstructionAccountResponse) => {
  console.log('Selected row for edit/review:', row);
  setSelectedRowData(row);
  setShowSplitMakerModal(true);
};


//It is called inside the Actions column's button click 
// via AG-Grid's gridOptions.context.   From image_51.png lines 576–580:   

onClick={() => {
  if (p.data && p.context?.onEditRow) {
    console.log('p.data value on button click : ', p.data);
    p.context.onEditRow(p.data);
  }
}}


//Find where <AgGridReact> (or your table wrapper) is defined in InstructionDetailPage.tsx:
// Look for the context prop passed to the grid component:   

<AgGridReact
  columnDefs={columnDefs}
  rowData={instructionAccounts}
  context={{
    onEditRow: handleEditRow, // <--- passed here
  }}
  // ... other grid props
/>


