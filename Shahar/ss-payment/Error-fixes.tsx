// Step 1: Fix Endpoint URL in PaymentParent.tsx
//In PaymentParent.tsx, update line ~120 inside handleMakerSubmit:

// Change from:
// const endpoint = '/shared-services/api/payment/api/payments';

// Change to:
const endpoint = '/shared-services/api/payment/payments';



// Also check the endpoints inside the other handlers in PaymentParent.tsx:

//Checker Decision:

const endpoint = '/shared-services/api/payment/checker/decision';

// Repair Resubmit:

const endpoint = '/shared-services/api/payment/repair/resubmit';


// Step 2: Address Lookup Endpoints in PaymentChild.tsx
//Ensure the address lookup endpoints inside PaymentChild.tsx also use the correct path:

//Debtor Lookup:

const res = await addressService.lookupDebtorAddresss(
    '/shared-services/api/payment',
    {
      account: debtorAccountNumber,
      bic: debtorAgentBIC,
      countryCode: debtorCountryCode
    }
  );

  // Creditor Lookup:

  
  const res = await addressService.lookupCreditorAddesss(
    '/shared-services/api/payment',
    {
      bic: creditorAgentFinancialInstitutionBIC,
      countryCode: creditorCountryCode,
      shortCode
    }
  );

