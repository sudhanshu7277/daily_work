// Step 1: Create the Mapping Helper
// Add this typed helper function inside InstructionDetailPage.tsx
//  (or an imported helper file). It takes selectedRowData and formats 
// it into a valid Partial<Pain001Model>:


import { Pain001Model } from '@citi-icg-179025/payment-flow-reactjs-ui-lib';

/**
 * Normalizes account numbers by removing slashes and trimming
 */
const cleanAccountNumber = (acc: unknown): string => {
  if (!acc) return '';
  return String(acc).replace(/\//g, '').trim();
};

/**
 * Transforms the clicked row into a clean, strongly-typed Pain001Model payload
 */
export const buildModalInitialData = (
  selectedRow: any,
  instruction: any
): Partial<Pain001Model> | null => {
  if (!selectedRow) return null;

  // Extract action details if nested, or use row directly if merged in-place
  const action = selectedRow.matchedAction || selectedRow.actionDetails || selectedRow;

  return {
    // 1. Mandatory core identification & dates
    requestedExecutionDate:
      action.requestedExecutionDate ||
      selectedRow.requestedExecutionDate ||
      instruction?.valueDate ||
      new Date().toISOString().split('T')[0],

    // 2. Debtor Information
    debtorName:
      action.debtorName ||
      selectedRow.debtorName ||
      instruction?.clientName ||
      instruction?.dealName ||
      '',
    debtorAccountNumber: cleanAccountNumber(
      action.debtorAccountNumber || selectedRow.debtorAccountNumber || selectedRow.debitAccountNumber
    ),
    debtorAgentBIC: action.debtorAgentBic || selectedRow.debtorAgentBic || '',

    // 3. Payment Method & Amounts
    painPaymentMethodType:
      action.painPaymentMethodType ||
      selectedRow.painPaymentMethodType ||
      selectedRow.transactionType ||
      'BKT',
    instructedAmountCurrencyCode:
      action.instructedAmountCurrencyCode ||
      selectedRow.instructedAmountCurrencyCode ||
      selectedRow.currency ||
      'USD',
    instructedAmount:
      action.instructedAmount ??
      selectedRow.instructedAmount ??
      (typeof selectedRow.amount === 'number' ? selectedRow.amount : ''),

    // 4. Charge configuration
    chargeBearer: action.chargeBearer || selectedRow.chargeBearer || 'DEBT',
    chargesAmount: action.chargesAmount ?? selectedRow.chargesAmount ?? 200,
    chargesAgentBIC: action.chargesAgentBIC || action.chargesAgentBic || selectedRow.chargesAgentBIC || '',

    // 5. Creditor Information
    creditorName: action.creditorName || selectedRow.creditorName || '',
    creditorAccount: action.creditorAccount || selectedRow.creditorAccount || '',
    creditorAgentFinancialInstitutionBIC:
      action.creditorAgentFinancialInstitutionBIC ||
      selectedRow.creditorAgentFinancialInstitutionBIC ||
      action.creditorAgentBic ||
      '',
    creditorAgentFinancialInstitutionName:
      action.creditorAgentFinancialInstitutionName ||
      selectedRow.creditorAgentFinancialInstitutionName ||
      '',
    creditorAgentPostalAddress:
      action.creditorAgentPostalAddress ||
      selectedRow.creditorAgentPostalAddress ||
      '',

    // 6. Creditor Address
    creditorStreetName: action.creditorStreetName || selectedRow.creditorStreetName || '',
    creditorBuildingNumber: action.creditorBuildingNumber || selectedRow.creditorBuildingNumber || '',
    creditorPostalCode: action.creditorPostalCode || selectedRow.creditorPostalCode || '',
    creditorTownName: action.creditorTownName || selectedRow.creditorTownName || '',
    creditorCountrySubDivision:
      action.creditorCountrySubDivision || selectedRow.creditorCountrySubDivision || '',
    creditorCountryCode: action.creditorCountryCode || selectedRow.creditorCountryCode || '',

    // 7. System metadata
    applicationName: action.applicationName || selectedRow.applicationName || 'GAB',
    applicationModule: action.applicationModule || selectedRow.applicationModule || 'GAB-LATAM',
    region: action.region || selectedRow.region || instruction?.region || 'LATAM',
  };
};


// Step 2: Use in InstructionDetailPage.tsx
// Replace the inline logic in the modal call (lines 5583–5637) with:


<SplitPaymentMakerModal
  isOpen={showSplitMakerModal}
  instructionId={instructionId}
  instruction={instruction}
  mode={modalMode} // 'checker' when clicking Review, 'maker' when clicking Edit
  wireIndex={selectedLatamIndex}
  movementAmount={
    selectedRowData?.amount ? String(selectedRowData.amount) : undefined
  }
  documents={
    Array.isArray(documents) && documents.length > 0
      ? documents
      : (instruction as any)?.documents || []
  }
  initialData={buildModalInitialData(selectedRowData, instruction)}
  onClose={() => {
    setShowSplitMakerModal(false);
    setSelectedRowData(null);
  }}
  // ... callbacks
/>