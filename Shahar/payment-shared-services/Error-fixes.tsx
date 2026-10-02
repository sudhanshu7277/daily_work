
  //1. Disable the "Review" Button in the Grid (ADDITIONAL_INFO_COLUMNS in InstructionDetailPage.tsx)
// In lines 573–614 of InstructionDetailPage.tsx 
// (shown in image_31.png and image_35.png):
// If the row status is in checker stage 
// (e.g. statusCode === 'MAKER' or status === 'Payment Created')
//  and the current logged-in user is the maker, the user must not be allowed to check the payment.


cellRenderer: (p: any) => {
    const currentUserId = (typeof getUserId === 'function' ? getUserId() : '')?.trim().toUpperCase();
  
    // Extract maker and previous checkers from the row data or matched action
    const recordMaker = (
      p.data?.maker ||
      p.data?.stageDetails?.maker ||
      p.data?.makerId ||
      p.data?.paymentTransactionWorkflow?.maker
    )?.trim().toUpperCase();
  
    const recordChecker1 = (p.data?.checker1 || p.data?.stageDetails?.checker1)?.trim().toUpperCase();
    const recordChecker2 = (p.data?.checker2 || p.data?.stageDetails?.checker2)?.trim().toUpperCase();
  
    // 1. Maker check: If current user made the payment, they CANNOT check it
    const isUserTheMaker = Boolean(currentUserId && recordMaker && currentUserId === recordMaker);
  
    // 2. Checker check: If user already checked at Checker 1, they cannot check at Checker 2
    const hasUserAlreadyChecked = Boolean(
      currentUserId && (currentUserId === recordChecker1 || currentUserId === recordChecker2)
    );
  
    const isCheckerStage =
      p.data?.statusCode === 'MAKER' ||
      p.data?.statusCode === 'CHECKER1' ||
      p.data?.statusCode === 'CHECKER2' ||
      p.data?.status === 'Payment Created' ||
      p.data?.status === 'Checker1 Approved';
  
    // Determine button label
    let buttonLabel = 'Edit';
    if (isCheckerStage) {
      buttonLabel = 'Review';
    }
  
    // Four-Eyes Segregation of Duties:
    // If in a checker stage and the user is the maker (or already checked), disable action!
    let isDisabled = false;
    let tooltipMessage = '';
  
    if (isCheckerStage && isUserTheMaker) {
      isDisabled = true;
      tooltipMessage = 'Maker cannot be Checker (Segregation of Duties)';
    } else if (isCheckerStage && hasUserAlreadyChecked) {
      isDisabled = true;
      tooltipMessage = 'User has already acted on this payment';
    } else if (p.data?.statusCode === 'COMPLETED' || p.data?.status === 'Completed') {
      isDisabled = true;
    }
  
    return (
      <Button
        color="primary"
        size="sm"
        disabled={isDisabled}
        title={tooltipMessage}
        onClick={() => {
          if (!isDisabled && p.data && p.context?.onEditRow) {
            p.context.onEditRow(p.data);
          }
        }}
      >
        {buttonLabel}
      </Button>
    );
  };


  //2. Guard Inside handleEditRow (InstructionDetailPage.tsx)
// Prevent opening the modal in Checker mode if the current user is the Maker:

const handleEditRow = async (rowData: any) => {
    if (!rowData) return;
  
    // 1. Determine if this record is currently in Checker mode
    const isChecker =
      rowData?.actionText === 'Review' ||
      rowData?.status === 'PAYMENT_CHECKER' ||
      rowData?.status === 'Payment Created' ||
      rowData?.status === 'Checker1 Approved' ||
      rowData?.statusCode === 'MAKER' ||
      rowData?.statusCode === 'CHECKER1' ||
      rowData?.statusCode === 'CHECKER2' ||
      rowData?.statusCode === 'CHECKER3' ||
      Boolean(rowData?.stageDetails && rowData?.stageDetails?.statusCode !== 'NEW');
  
    // 2. Enforce Four-Eyes Principle: Maker cannot be Checker
    const currentUserId = (typeof getUserId === 'function' ? getUserId() : '')?.trim().toUpperCase();
    const recordMaker = (
      rowData?.maker ||
      rowData?.stageDetails?.maker ||
      rowData?.paymentTransactionWorkflow?.maker ||
      rowData?.matchedAction?.maker
    )?.trim().toUpperCase();
  
    if (isChecker && currentUserId && recordMaker && currentUserId === recordMaker) {
      alert('Access Denied: The maker of this payment cannot act as the checker (Segregation of Duties).');
      return;
    }
  
    // 3. Fetch Maker submission details if in Checker mode
    if (isChecker) {
      try {
        // Resolve IDs: Never prioritize accountId over actual paymentId
        const resolvedPaymentId =
          rowData?.paymentId ||
          rowData?.stageDetails?.paymentId ||
          rowData?.paymentTransactionId ||
          rowData?.matchedAction?.paymentId ||
          rowData?.accountId ||
          '';
  
        const resolvedTxnId =
          rowData?.matchedAction?.paymentTransactionId ||
          rowData?.transactionId ||
          rowData?.stageDetails?.transactionId ||
          '';
  
        const resolvedInstructionId =
          rowData?.instructionId ||
          (instruction as any)?.instructionId ||
          (instruction as any)?.id ||
          rowData?.txnid ||
          '';
  
        const payload = {
          moduleName: 'GAB-LATAM',
          applicationName: 'GAB',
          maker: rowData?.maker || '',
          paymentId: String(resolvedPaymentId),
          transactionId: String(resolvedTxnId),
          txnid: String(resolvedInstructionId),
        };
  
        console.log('Fetching maker payment for checker review with payload:', payload);
  
        const res = await getMakerPaymentPerRecord(payload);
        const record = Array.isArray(res) ? res[0] : res;
        const pdr = record?.paymentDetailsRequest || {};
  
        // Secondary check: verify maker identity returned directly from the backend
        const backendMaker = (record?.maker || record?.paymentTransactionWorkflow?.maker)?.trim().toUpperCase();
        if (currentUserId && backendMaker && currentUserId === backendMaker) {
          alert('Access Denied: The maker of this payment cannot act as the checker (Segregation of Duties).');
          return;
        }
  
        // Merge rowData, root record, and nested paymentDetailsRequest
        setSelectedRowData({
          ...rowData,
          ...record,
          ...pdr,
          paymentDetailsRequest: pdr,
          paymentTransactionWorkflow: record?.paymentTransactionWorkflow ?? rowData?.paymentTransactionWorkflow ?? null,
          accountId: rowData?.accountId || record?.accountId,
          paymentId: record?.paymentId || rowData?.paymentId || resolvedPaymentId,
          maker: backendMaker || recordMaker || rowData?.maker,
        });
      } catch (err) {
        console.error('Failed to fetch maker payment per record:', err);
        // Fallback: preserve base rowData so modal has context
        setSelectedRowData(rowData);
      }
    } else {
      // Maker mode: load existing rowData directly
      setSelectedRowData(rowData);
    }
  
    // 4. Open modal in the resolved mode
    setModalMode(isChecker ? 'checker' : 'maker');
    setShowSplitMakerModal(true);
  };

//3. Disable the "Approve Payment" Button Inside 
// the Checker Modal (PaymentParent.tsx / VerifyPaymentDetailModal.tsx)
// In the Checker modal footer (where Approve Payment and Reject are 
// rendered, as seen in image_24.png):   Ensure the Approve Payment 
// button is disabled if loggedInUser === maker:


const isMakerTheChecker = Boolean(
    loggedInUser &&
    makerPaymentData?.maker &&
    loggedInUser.trim().toUpperCase() === makerPaymentData.maker.trim().toUpperCase()
  );
  
  <Button
    color="primary"
    disabled={
      isSubmitting ||
      !isDualBlindValid ||
      isMakerTheChecker // 🚫 Block approval if Maker is Checker
    }
    title={isMakerTheChecker ? "Maker cannot approve their own payment" : undefined}
    onClick={handleCheckerApprove}
  >
    Approve Payment
  </Button>