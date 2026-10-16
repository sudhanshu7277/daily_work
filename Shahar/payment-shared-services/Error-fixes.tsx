//Here are the exact changes:

//1. In PaymentParent.tsx
//Change 1.1: Fix Checker Mode Config in dynamicFieldConfig (Lines 420–448)
//Currently, in Checker mode, tax fields were being mapped to dual-blind 
// rekey fields. Update lines 420–448 so tax fields are non-mandatory, 
// pre-populated, and disabled for Checker:

// In Checker mode, only core dual-blind fields are rekeyed; tax fields are NOT rekeyed
const activeRekeyFields = DUAL_BLIND_REKEY_FIELDS;

if (activeTab === 'checker') {
  return baseConfig.map((cfg) => {
    const isRekeyField = activeRekeyFields.includes(cfg.fieldName);
    const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);

    if (isTaxField) {
      return {
        ...cfg,
        // Non-mandatory for checker
        required: false,
        // Show section if LATAM payment so checker can inspect maker values
        hidden: !isNonUsPayment,
        // Disabled/readonly so checker cannot edit it
        disabled: true,
      };
    }

    return {
      ...cfg,
      required: cfg.required,
      hidden: cfg.hidden,
      disabled: !isRekeyField,
    };
  });
}

// Maker or Repair mode: Tax details are mandatory for LATAM
return baseConfig.map((cfg) => {
  const isTaxField = TAX_DUAL_BLIND_REKEY_FIELDS.includes(cfg.fieldName);
  return {
    ...cfg,
    disabled: false,
    required: isNonUsPayment && isTaxField ? true : cfg.required,
    hidden: isNonUsPayment && isTaxField ? false : cfg.hidden,
  };
});

    //Change 1.2: Restrict Dual-Blind Fields in dynamicPaymentInput (Lines 480–488)
//Revert the case 'checker' dual-blind key list so it strictly contains 
// DUAL_BLIND_REKEY_FIELDS (excluding Tax fields):

case 'checker':
      return {
        ...baseInput,
        paymentMode: 'checker',
        dualBlindKeyFlag: 'Y',
        dualBlindKeyFields: DUAL_BLIND_REKEY_FIELDS,
      };


//Change 1.3: Exclude Tax Fields from Output Rekey Verification (Lines 516–522)
// In handlePaymentOutput, remove TAX_DUAL_BLIND_REKEY_FIELDS from rekeyFieldsToCheck:

const rekeyFieldsToCheck = DUAL_BLIND_REKEY_FIELDS;

//Change 1.4: Dynamic API Response Messages (Lines 885–912)
//In handleCheckerDecision and handleMakerSubmit, replace hardcoded
//  status codes in modals with the response message:

// In catch block:
const backendMessage =
err?.response?.data?.message ||
err?.response?.data?.error ||
err?.message ||
'Operation failed';

setModalResponse({
title: 'ACTION FAILED',
referenceId: instructionId_,
status: 'ERROR',
message: backendMessage,
color: '#d64545',
});


//3. In InstructionDetailPage.tsx
//Locate the action handlers where API responses and errors are processed:
//Replace any string like:

`Failed with status code: ${res.status}`


//With dynamic message extraction:

const apiMessage =
  response?.data?.message ||
  response?.data?.statusDesc ||
  error?.response?.data?.message ||
  error?.message ||
  'Instruction status updated';






  //Area 1: Inside InstructionDetailPage.tsx
//Look for where action submission handlers or toast/modal 
// notifications are triggered (search for res.status, toast, alert, 
// notification, or modalResponse).

//Update error/success extractions to prioritize the server's 
// descriptive message over fallback HTTP codes:

// Replace patterns like:
// const msg = `Action failed with status: ${res.status}`;

// With dynamic parsing:
let errorMsg = 'An error occurred while processing instruction';
try {
  const errJson = await res.json();
  errorMsg = errJson?.message || errJson?.error || errJson?.statusDesc || `Action failed with status: ${res.status}`;
} catch {
  errorMsg = `Action failed with status: ${res.status}`;
}


//Area 2: In PaymentParent.tsx (Lines 884–913 and Lines 938–958)
//Inside handleCheckerDecision and handleRepairResubmit:

//1. In handleCheckerDecision (Image 29 / 30)
//Change the catch block from:

catch (err: any) {
  setModalResponse({
    title: 'ACTION FAILED',
    referenceId: instructionId_,
    status: 'ERROR',
    message: err?.message || 'Failed to approve payment instruction.',
    color: '#d64545',
  });
}


//To:

catch (err: any) {
  const apiMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Failed to process payment decision.';

  setModalResponse({
    title: 'ACTION FAILED',
    referenceId: instructionId_,
    status: 'ERROR',
    message: apiMessage,
    color: '#d64545',
  });
}


//2. In handleRepairResubmit (Image 31 / 32)
//Update the error response handling:


if (!res.ok) {
  const errData = await res.json().catch(() => ({}));
  const displayMsg =
    errData?.message ||
    errData?.error ||
    `Repair resubmission failed (Status: ${res.status})`;

  throw new Error(displayMsg);
}


