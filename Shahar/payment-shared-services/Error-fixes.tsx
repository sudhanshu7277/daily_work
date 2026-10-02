//Step 1: Re-fetching details-all-stage on Maker Submit, Checker Approve, and Checker Reject
// Let's start with Issue 1.

// In InstructionDetailPage.tsx, define refreshStageDetails 
// and pass it down as an onSuccess callback to the modal.


// 1. Centralized Refresh Function
const refreshStageDetails = useCallback(async () => {
    const currentId =
      instructionId ||
      (instruction as any)?.instructionId ||
      (instruction as any)?.id;
  
    if (!currentId) return;
  
    const endpoint = '/nextgengab/api/api/v1/gab/payments/payment/details-all-stage';
  
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          SOEID: loggedInUser || '',
        },
        body: JSON.stringify({
          instructionId: String(currentId),
          applicationName: 'GAB',
          moduleName: 'GAB-LATAM',
        }),
      });
  
      if (!res.ok) {
        console.warn(`details-all-stage refresh failed with status: ${res.status}`);
        return;
      }
  
      const json = await res.json();
      const details = Array.isArray(json) ? json : [json];
      setAllStagesData(details);
    } catch (err) {
      console.error('Error refreshing details-all-stage:', err);
    }
  }, [instructionId, instruction, loggedInUser]);
  
  // 2. Handler triggered when Maker submits or Checker completes an action
  const handlePaymentActionSuccess = async () => {
    // Close the modal
    setIsModalOpen(false);
  
    // Immediately re-fetch stage status so AG Grid reflects updated status
    await refreshStageDetails();
  };


  //Pass this to the Modal in JSX:

  <SplitPaymentMakerModal
  isOpen={isModalOpen}
  instructionId={currentId}
  selectedRecord={selectedRecord}
  onClose={() => setIsModalOpen(false)}
  onSuccess={handlePaymentActionSuccess} // <-- Triggers on Submit, Approve, or Reject
/>


