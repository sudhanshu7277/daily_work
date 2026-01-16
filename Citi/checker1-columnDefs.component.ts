dateFormatter(params: ValueFormatterParams<any>): string {
    const value = params.value;
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : '';
  }
  
  amountFormatter(params: ValueFormatterParams<any>): string {
    const value = params.value;
    return value?.toLocaleString() ?? '';
  }
  
  statusCellRenderer(params: ICellRendererParams<any>): any {
    const value = params.value ?? null;  // Fallback if undefined
    return this.circleRenderer(value);  // Assuming circleRenderer handles null safely
  }


  this.columnDefs = [
    { field: 'issueName', headerName: 'Issue Name', minWidth: 200 },
    { field: 'ddaAccount', headerName: 'DDA Account' },
    { field: 'accountNumber', headerName: 'Account No' },
    {
      field: 'eventValueDate',
      headerName: 'Value Date',
      valueFormatter: this.dateFormatter.bind(this),
    },
    { field: 'paymentAmountCurrency', headerName: 'CCY', width: 90 },
    {
      field: 'paymentAmount',
      headerName: 'Amount',
      valueFormatter: this.amountFormatter.bind(this),
    },
    {
      field: 'statusChoice1',
      headerName: 'S1',
      width: 80,
      cellRenderer: this.statusCellRenderer.bind(this),
    },
    // ... rest of your columns
  ];