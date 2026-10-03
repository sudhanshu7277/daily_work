//Implementation in InstructionDetailPage.tsx
// Inside getAdditionalInfoColumns, replace the button 
// configuration block (lines 575–598) with this logic:

// 1. Identify current logged-in user SOEID
const activeUser = String(typeof getUserId === 'function' ? getUserId() : '').trim().toUpperCase();

// 2. Identify workflow actors from the record
const makerId = String(
  p.data?.maker ||
  p.data?.paymentTransactionWorkflow?.makerId ||
  p.data?.actionDetails?.makerSoeId ||
  ''
).trim().toUpperCase();

const checker1Id = String(
  p.data?.checker1 ||
  p.data?.paymentTransactionWorkflow?.checker1Id ||
  p.data?.actionDetails?.checker1SoeId ||
  ''
).trim().toUpperCase();

const checker2Id = String(
  p.data?.checker2 ||
  p.data?.paymentTransactionWorkflow?.checker2Id ||
  p.data?.actionDetails?.checker2SoeId ||
  ''
).trim().toUpperCase();

const checker3Id = String(
  p.data?.checker3 ||
  p.data?.paymentTransactionWorkflow?.checker3Id ||
  p.data?.actionDetails?.checker3SoeId ||
  ''
).trim().toUpperCase();

// 3. Normalize status and codes
const rawStatusCode = String(
  p.data?.statusCode ||
  p.data?.paymentTransactionWorkflow?.statusCode ||
  ''
).toUpperCase();

const rawStatusDesc = String(
  p.data?.statusDescription ||
  p.data?.status ||
  ''
).toUpperCase();

const isCompleted =
  rawStatusCode === 'COMPLETED' ||
  rawStatusDesc === 'COMPLETED' ||
  rawStatusDesc.includes('COMPLETE');

const isRejected =
  rawStatusCode.includes('REJECT') ||
  rawStatusDesc.includes('REJECT');

const isMakerInitial =
  rawStatusCode === 'NEW' ||
  rawStatusDesc.includes('NOT CREATED');

const isCheckerStage =
  !isCompleted &&
  !isMakerInitial &&
  !isRejected &&
  (
    rawStatusCode.startsWith('CHECKER') ||
    rawStatusDesc.includes('CHECKER') ||
    rawStatusDesc.includes('PAYMENT CREATED') ||
    (rawStatusCode === 'MAKER' && rawStatusDesc.includes('CREATED'))
  );

// 4. Determine Button Label
let buttonLabel = 'Review';
if (isMakerInitial || isRejected) {
  buttonLabel = 'Edit';
}

// 5. Segregation of Duties Checks
const isUserTheMaker = Boolean(activeUser && makerId && activeUser === makerId);
const hasUserAlreadyChecked = Boolean(
  activeUser && (
    activeUser === checker1Id ||
    activeUser === checker2Id ||
    activeUser === checker3Id
  )
);

// 6. Compute Disabled State & Tooltip Message
let isDisabled = false;
let tooltipMessage = '';

if (isCompleted) {
  // Complete: Closed to all actions
  isDisabled = true;
  tooltipMessage = 'Payment instruction has already been fully approved and completed';
} else if (isMakerInitial) {
  // New wire: open to Maker
  isDisabled = false;
  tooltipMessage = '';
} else if (isRejected) {
  // Sent back to Maker for corrections
  if (!isUserTheMaker) {
    isDisabled = true;
    tooltipMessage = 'Payment rejected by Checker; awaiting original Maker revision';
  } else {
    isDisabled = false;
    tooltipMessage = '';
  }
} else if (isCheckerStage) {
  // Wire in Checker pipeline
  if (isUserTheMaker) {
    isDisabled = true;
    tooltipMessage = 'Maker cannot act as Checker (Segregation of Duties)';
  } else if (hasUserAlreadyChecked) {
    isDisabled = true;
    tooltipMessage = 'User has already acted on this payment at a previous checker step';
  } else {
    isDisabled = false;
    tooltipMessage = '';
  }
}


//Reusable Actionability Helper (For Grid and Modal Navigation)
// Define this helper function so accessibleRows and the navigation 
// handlers follow the identical rules:


export const isRecordActionableForUser = (row: any, activeUserId: string): boolean => {
    const user = String(activeUserId || '').trim().toUpperCase();
  
    const makerId = String(
      row?.maker ||
      row?.paymentTransactionWorkflow?.makerId ||
      row?.actionDetails?.makerSoeId ||
      ''
    ).trim().toUpperCase();
  
    const c1 = String(row?.checker1 || row?.paymentTransactionWorkflow?.checker1Id || '').trim().toUpperCase();
    const c2 = String(row?.checker2 || row?.paymentTransactionWorkflow?.checker2Id || '').trim().toUpperCase();
    const c3 = String(row?.checker3 || row?.paymentTransactionWorkflow?.checker3Id || '').trim().toUpperCase();
  
    const rawStatus = String(
      row?.statusDescription ||
      row?.statusCode ||
      row?.status ||
      ''
    ).toUpperCase();
  
    // 1. Never actionable if already completed
    if (rawStatus === 'COMPLETED' || rawStatus.includes('COMPLETE')) {
      return false;
    }
  
    // 2. If rejected, only actionable by the original Maker
    if (rawStatus.includes('REJECT')) {
      return Boolean(user && makerId && user === makerId);
    }
  
    // 3. In Checker stages: Maker cannot review, and previous checkers cannot re-check
    if (user && makerId && user === makerId) {
      return false;
    }
    if (user && (user === c1 || user === c2 || user === c3)) {
      return false;
    }
  
    return true;
  };