// Defined at top level (outside component) - NO HOOKS INSIDE HERE
const ADDITIONAL_INFO_COLUMNS: ColDef<InstructionAccountResponse>[] = [
    // ... other columns ...
    {
      headerName: 'Actions',
      colId: 'actions',
      minWidth: 110,
      width: 110,
      sortable: false,
      filter: false,
      cellRenderer: (p: ICellRendererParams<InstructionAccountResponse>) => {
        return (
          <Button
            color="primary"
            size="sm"
            onClick={() => {
              if (p.data && (p.context as any)?.onEditRow) {
                (p.context as any).onEditRow(p.data);
              }
            }}
          >
            Edit
          </Button>
        );
      }
    }
  ];