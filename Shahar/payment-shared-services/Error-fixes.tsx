//The Complete Button Disabling & SoD LogicIn InstructionDetailPage.tsx,
//  inside getAdditionalInfoColumns (around lines 565–598), update the evaluation logic:  


// 1. Resolve Active User SOEID
const activeUser = String(typeof getUserId === 'function' ? getUserId() : '').trim().toUpperCase();

// 2. Resolve Maker & Checker IDs from p.data (check direct keys and nested workflow)
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

// 3. Resolve Status & Stage
const statusCode = String(
  p.data?.statusCode || 
  p.data?.paymentTransactionWorkflow?.statusCode || 
  ''
).toUpperCase();

const statusDesc = String(
  p.data?.statusDescription || 
  p.data?.status || 
  ''
).toUpperCase();

// Checker stages: record is created and awaiting review/approval
const isCheckerStage = 
  statusCode === 'CHECKER' || 
  statusCode === 'CHECKER1' || 
  statusCode === 'CHECKER2' ||
  statusCode === 'MAKER' && statusDesc.includes('CREATED') ||
  statusDesc.includes('CHECKER') ||
  statusDesc.includes('PAYMENT CREATED');

// 4. Labeling
let buttonLabel = 'Edit';
if (isCheckerStage) {
  buttonLabel = 'Review';
}

// 5. Segregation of Duties Checks
// Rule A: The user who created the payment (Maker) can NEVER review it
const isUserTheMaker = Boolean(activeUser && makerId && activeUser === makerId);

// Rule B: None of the Checkers (CHECKER 1, 2, or 3) can be the same user
const hasUserAlreadyChecked = Boolean(
  activeUser && (
    activeUser === checker1Id || 
    activeUser === checker2Id || 
    activeUser === checker3Id
  )
);

// 6. Compute Disabled State & Tooltip
let isDisabled = false;
let tooltipMessage = '';

if (statusDesc.includes('NOT CREATED')) {
  buttonLabel = 'Edit';
  isDisabled = false;
} else if (statusCode === 'COMPLETED' || statusDesc === 'COMPLETED') {
  isDisabled = true;
  tooltipMessage = 'Payment instruction has already been fully processed and completed';
} else if (isUserTheMaker) {
  isDisabled = true;
  tooltipMessage = 'Maker cannot act as Checker (Segregation of Duties)';
} else if (hasUserAlreadyChecked) {
  isDisabled = true;
  tooltipMessage = 'You have already approved/acted on this record at a previous checker step';
}


//Update accessibleRows to Match
// Make sure the same helper is used for modal navigation so that 
// when a user clicks Next Payment, it only navigates between rows where isDisabled === false:


const accessibleRows = useMemo(() => {
    const allRows: any[] =
      (Array.isArray(instructionAccounts) && instructionAccounts.length > 0)
        ? instructionAccounts
        : (instruction as any)?.instructionAccounts ||
          (instruction as any)?.accounts ||
          [];

    const activeUser = String(typeof getUserId === 'function' ? getUserId() : '').trim().toUpperCase();

    return allRows.filter((row: any) => {
      const makerId = String(row?.maker || row?.paymentTransactionWorkflow?.makerId || '').trim().toUpperCase();
      const c1 = String(row?.checker1 || row?.paymentTransactionWorkflow?.checker1Id || '').trim().toUpperCase();
      const c2 = String(row?.checker2 || row?.paymentTransactionWorkflow?.checker2Id || '').trim().toUpperCase();
      const c3 = String(row?.checker3 || row?.paymentTransactionWorkflow?.checker3Id || '').trim().toUpperCase();

      // Rule 1: Segregation of Duties
      if (activeUser && makerId && activeUser === makerId) return false;
      if (activeUser && (activeUser === c1 || activeUser === c2 || activeUser === c3)) return false;

      // Rule 2: Status check
      const status = String(row?.statusCode || row?.statusDescription || row?.status || '').toUpperCase();
      if (status.includes('NOT CREATED') || status.includes('COMPLETED') || status.includes('REJECTED')) {
        return false;
      }

      return true;
    });
  }, [instructionAccounts, instruction]);