//Step 1: Update PaymentInfoCard Props in InstructionDetailPage.tsx
// In PaymentInfoCard (around line 851 in image_33.png), 
// add allStagesData to the destructured props:



const PaymentInfoCard = ({
    loadingAccounts,
    instructionAccounts,
    instruction,
    handleEditRow,
    getMakerPaymentPerRecord,
    allStagesData = [], // <-- 1. Add allStagesData here
  }: {
    loadingAccounts: boolean;
    instructionAccounts: InstructionAccountResponse[];
    instruction: any;
    onEditRow?: (row: InstructionAccountResponse) => Promise<void> | void;
    onAddPayment?: () => void;
    activePaymentMode: any;
    handleEditRow: any;
    getMakerPaymentPerRecord: any;
    allStagesData?: any[]; // <-- 2. Add to type definition
  }) => {


    //Step 2: Merge the Rows Dynamically Before Rendering the Grid
//Right above line 867 (let content: React.ReactNode; in image_33.png),
//  create a useMemo that dynamically attaches the stage status to each row


const rowsWithDynamicStatus = useMemo(() => {
    if (!Array.isArray(instructionAccounts)) return [];
    if (!Array.isArray(allStagesData) || allStagesData.length === 0) {
      return instructionAccounts;
    }

    return instructionAccounts.map((account: any) => {
      // Find matching stage detail by accountId or debitAccountNumber
      const stageMatch = allStagesData.find((stage: any) => {
        const idMatches =
          stage.accountId != null &&
          account.accountId != null &&
          String(stage.accountId).trim() === String(account.accountId).trim();

        const debitMatches =
          stage.debitAccountNumber != null &&
          account.debitAccountNumber != null &&
          String(stage.debitAccountNumber).trim() === String(account.debitAccountNumber).trim();

        return idMatches || debitMatches;
      });

      if (!stageMatch) return account;

      // Status resolution fallback
      const resolvedStatus =
        stageMatch.statusDescription ||
        (stageMatch.statusCode === 'CHECKER1' ? 'Checker1 Approved' :
         stageMatch.statusCode === 'MAKER' ? 'Payment Created' :
         stageMatch.statusCode === 'NEW' ? 'Payment Not Created' :
         stageMatch.statusCode) ||
        account.status;

      return {
        ...account,
        status: resolvedStatus,
        statusDescription: stageMatch.statusDescription || resolvedStatus,
        statusCode: stageMatch.statusCode,
        stageDetails: stageMatch, // Store stage data inside the row object
      };
    });
  }, [instructionAccounts, allStagesData]);


  //Step 3: Update rowData in <AgGridReact>
//In image_34.png at line 891, replace instructionAccounts with rowsWithDynamicStatus:


<AgGridReact
  rowData={rowsWithDynamicStatus}
  columnDefs={getAdditionalInfoColumns(instruction) as any}
  defaultColDef={{
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
  }}
  animateRows
  pagination
  paginationPageSize={5}
  paginationPageSizeSelector={[5, 10, 20]}
  rowHeight={46}
  headerHeight={40}
  context={{
    status: instruction?.status,
    onEditRow: handleEditRow,
    getMakerPaymentPerRecord,
    allStagesData,
  }}
/>


//Step 4: Pass allStagesData Where <PaymentInfoCard> is Rendered
// Scroll down to where <PaymentInfoCard .../> 
// is invoked in InstructionDetailPage.tsx (usually around line 1500–1700):



<PaymentInfoCard
  loadingAccounts={loadingAccounts}
  instructionAccounts={instructionAccounts}
  instruction={instruction}
  handleEditRow={handleEditRow}
  getMakerPaymentPerRecord={getMakerPaymentPerRecord}
  allStagesData={allStagesData} // <-- Pass the state holding details-all-stage
  activePaymentMode={activePaymentMode}
/>
