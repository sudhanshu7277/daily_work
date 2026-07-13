import { fileURLToPath } from 'url';
// dummy data

private mockCheckerData: CheckerDetails[] = Array.from({ length: 15 }, (_, i) => ({
    transactionId: `TXN-${100000 + i}`,
    securityId: `SEC-${1000 + i}`,
    securityName: `Test Issuer ${i + 1}`,
    creditorName: `Beneficiary ${i + 1}`,
    paymentAmount: 10000 + i * 250,
    paymentAmountUsdEquivalent: 10500 + i * 260,
    paymentCurrency: i % 2 === 0 ? 'USD' : 'EUR',
    state: i % 3 === 0 ? 'PENDING' : 'APPROVED',
    eventValueDate: '2026-07-01',
    paymentDate: '2026-07-05',
    legalEntityName: `Legal Entity ${i + 1}`,
    checkerLevel: 'L2',
    isDualBlindKey: i % 2 === 0 ? 'Yes' : 'No'
  } as CheckerDetails));

  // loadData

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
  
    // TEMP: local mock data until API is available
    this.totalRecords = this.mockCheckerData.length;
    this.gridOptions.rowData = this.mockCheckerData;
    this.gridReady = true;
    this.isLoading = false;
    return;
  
    const request: CheckerInput = { ... }
    // rest of existing API call untouched
  }

  // css to be added to authorization queue component



  :host ::ng-deep .ag-body-horizontal-scroll-viewport {
    overflow-x: scroll !important;
  }
  
  :host ::ng-deep .ag-body-horizontal-scroll {
    height: 14px !important;
    min-height: 14px !important;
  }
  
  :host ::ng-deep .ag-body-horizontal-scroll-container {
    height: 14px !important;
  }



  // check and change

  .grid-section {
    overflow-x: auto;   // change from overflow: hidden
  }


  // atis scss

  .ag-theme-alpine {
    .ag-body-horizontal-scroll {
      display: block;
      height: 14px !important;
      min-height: 14px !important;
    }
  
    .ag-body-horizontal-scroll-viewport {
      overflow-x: scroll !important;
    }
  
    .ag-body-horizontal-scroll-container {
      height: 14px !important;
    }
  }


  // add to atis scss
   
   .ag-theme-alpine .ag-body-horizontal-scroll-viewport {
    &::-webkit-scrollbar {
      height: 14px;
    }
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 7px;
      &:hover {
        background: #555;
      }
    }
  }

  .ag-theme-alpine .ag-body-horizontal-scroll {
    display: block;
    height: 14px !important;
    min-height: 14px !important;
    overflow-x: auto !important;   // ADD THIS — this is what actually made it appear
  }
