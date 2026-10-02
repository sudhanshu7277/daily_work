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




  //1. In PaymentParentProps (around lines 160–168)
//Add onCheckerDecision to the interface



export interface PaymentParentProps {
    instructionId: string;
    initialData?: any;
    activeTab?: 'maker' | 'checker' | 'repair';
    isNonUsPayment?: boolean;
    onClose?: () => void;
    onCheckerDecision?: (decision: 'Approved' | 'Rejected', payload: any) => Promise<void> | void;
    onSubmitPayment?: (paymentPayload: any) => Promise<void> | void;
    onAccountsUpdate?: (accounts: any[]) => void;
    isSubmitting?: boolean;
  }



  //2. In Component Destructuring (Line 169)
//Look at line 169 in


export const PaymentParent: FC<PaymentParentProps> = ({

    //Ensure onCheckerDecision is destructured there:

    export const PaymentParent: FC<PaymentParentProps> = ({
        instructionId,
        initialData,
        activeTab,
        isNonUsPayment,
        onClose,
        onCheckerDecision,
        onSubmitPayment,
        onAccountsUpdate,
        // ... any other existing destructured props
      }) => {


//The Fix:Rename the incoming prop in line 184 to 
// activeTabProp (or initialActiveTab), and seed useState with it:   Line 184: Change


activeTab: activeTabProp,

//Lines 196–204: Update the state and useEffect so they use activeTabProp instead of the undefined mode:

const [activeTab, setActiveTab] = useState<'maker' | 'checker' | 'repair' | 'super-checker'>(
    activeTabProp ?? 'maker'
  );
  const [instruction_id, setInstruction_id] = useState<any>('');
  const [currentUserId, setCurrentUserId] = useState<any>('');

  useEffect(() => {
    if (activeTabProp) {
      setActiveTab(activeTabProp);
    }
    setInstruction_id(instructionId);
    setCurrentUserId(getUserId());
  }, [activeTabProp, instructionId]);


  ///2. Fix Duplicate identifier 'isNonUsPayment'Look at line 185: 
  //   Line 185 destructures isNonUsPayment from props. 
  //   But down in lines 442–448, isNonUsPayment is already 
  // declared as an internal calculation:


  const isNonUsPayment = useMemo(() => {
    return hasLatamBicCountry(currentDebtorAgentBIC);
  }, [currentDebtorAgentBIC]);


  Because `isNonUsPayment` is calculated dynamically inside `PaymentParent` based on the BIC, it should **not** be destructured as a prop.

#### The Fix:
Simply **delete line 185**:
```typescript
  isNonUsPayment, // <-- DELETE THIS LINE from the props destructuring (lines 181-190)