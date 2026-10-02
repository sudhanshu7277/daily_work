//Here is the exact code to remove from PaymentParent.tsx, broken down section by section.

// 1. Remove the Stage-Loading State Variables
// Near the top of the component (around lines 215–225), locate and delete:


const [isLoadingActionDetails, setIsLoadingActionDetails] = useState<boolean>(false);
const [actionDetailsList, setActionDetailsList] = useState<any[]>([]);


//(You can also remove isSubmitting if you plan to pass it in as a prop from InstructionDetailPage, or keep it as local state if purely managing the button spinner).

//2. Remove the Entire Mounting useEffect
// Locate the useEffect around lines 319–355 that auto-fires on mount and delete it completely:

// DELETE THIS ENTIRE BLOCK:
useEffect(() => {
    const currentId = instructionId || (instruction as any)?.instructionId || (instruction as any)?.id;
    if (!currentId) return;
  
    let isMounted = true;
    const loadInitialDetailsForAction = async () => {
      try {
        setIsLoadingActionDetails(true);
        const details = await fetchDetailsForAction();
        if (isMounted) {
          setActionDetailsList(details);
          const rawAccounts = instruction?.accounts || [];
          const updatedAccounts = mergeAccountsWithActionDetails(rawAccounts, details);
          onAccountsUpdate?.(updatedAccounts);
        }
      } catch (err) {
        console.error('Error fetching details-all-stage:', err);
      } finally {
        if (isMounted) setIsLoadingActionDetails(false);
      }
    };
  
    loadInitialDetailsForAction();
    return () => {
      isMounted = false;
    };
  }, [instructionId]);


  //3. Remove fetchDetailsForAction Function
// Locate the function around lines 712–748 that calls details-all-stage 
// and delete the entire definition:


// DELETE THIS ENTIRE FUNCTION:
const fetchDetailsForAction = async () => {
    const currentId = instructionId || (instruction as any)?.instructionId || (instruction as any)?.id;
    const payload = {
      instructionId: Number(currentId),
      applicationName: 'GAB',
      moduleName: 'GAB-LATAM',
    };
  
    const response = await fetch('/nextgengab/api/api/v1/gab/payments/payment/details-all-stage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch stage details: ${response.statusText}`);
    }
  
    return await response.json();
  };


  //4. Strip the Direct fetch inside handleCheckerDecision
//Locate handleCheckerDecision around lines 850–885.

// Remove the fetch('/nextgengab/api/api/v1/gab/payments/payment/checker-decision', ...) call and the follow-up fetchDetailsForAction() call. Replace its body with a delegation to the onCheckerDecision prop:

// Old Code to Replace:


const handleCheckerDecision = async (decision: 'Approved' | 'Rejected') => {
    try {
      setIsSubmitting(true);
      // DELETE direct fetch to checker-decision
      const res = await fetch('/nextgengab/api/api/v1/gab/payments/payment/checker-decision', { ... });
      // DELETE the follow-up fetchDetailsForAction()
      const details = await fetchDetailsForAction();
      // ...
    } ...
  };


  //Replace with:

  const handleCheckerDecision = async (decision: 'Approved' | 'Rejected') => {
    if (onCheckerDecision) {
      const payload = {
        applicationName: 'GAB',
        moduleName: 'GAB-LATAM',
        action: decision,
        paymentId: String(initialData?.paymentId || ''),
        transactionId: String(initialData?.transactionId || ''),
        instructionId: String(instructionId || ''),
      };
      await onCheckerDecision(decision, payload);
    }
  };



  //5. Strip Direct Save/Submit fetch in handlePaymentOutput (Maker/Repair Submissions)
//At the bottom of handlePaymentOutput (around lines 680–710), where it previously called fetch to create or update the payment:

// Old Code to Remove:


// DELETE direct API calls to save/submit payments:
const response = await fetch('/nextgengab/api/api/v1/gab/payments/payment/save' ...);


//Replace with:

// Delegate payload directly to parent:
if (activeTab === 'maker' || activeTab === 'repair') {
    if (onSubmitPayment) {
      onSubmitPayment(pData);
    }
  }


  