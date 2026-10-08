//1. InstructionDetailPage.tsx — Update fetchDetailsForAction to set allStagesData
//In fetchDetailsForAction (around line 2235), update 
// the response handling so it updates setAllStagesData:


const res = await fetch(resolveApiUrl(endpoint), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      SOEID: loggedInUser && loggedInUser,
    },
    body: JSON.stringify({
      instructionId: currentId,
      applicationName: 'GAB',
      moduleName: 'GAB-LATAM',
    }),
  });

  if (!res.ok) {
    console.warn('fetchDetailsForAction failed with status:', res.status);
    return [];
  }

  const resData = await res.json();
  const updatedStages = Array.isArray(resData) ? resData : resData?.data || [];

  // Update state so rowsWithDynamicStatus recomputes automatically
  setAllStagesData(updatedStages);

  return updatedStages;


  //2. InstructionDetailPage.tsx — Trigger fetchDetailsForAction on Success Modal "OK"
//Around line 5955, update the onClick handler of the OK button:

<Modal
  visible={Boolean(paymentSuccessInfo)}
  title="Payment Instruction Created"
  closable
  wrapClassName="top-priority-modal"
  style={{ zIndex: 9999 }}
  onClose={() => setPaymentSuccessInfo(null)}
  onCancel={() => setPaymentSuccessInfo(null)}
  footer={
    <El className="lmn-d-flex lmn-justify-content-end">
      <Button
        color="primary"
        onClick={async () => {
          setPaymentSuccessInfo(null);
          await fetchDetailsForAction();
        }}
      >
        OK
      </Button>
    </El>
  }
></Modal>



//3. PaymentInfoCard (inside InstructionDetailPage.tsx) — Keep the Existing Dynamic Merging
//Keep lines 850–858 intact as you already have it:

return {
    ...account,
    status: resolvedStatus,
    statusDescription: stageMatch.statusDescription || resolvedStatus,
    statusCode: stageMatch.statusCode,
    stageDetails: stageMatch, // Store stage data inside the row object
  };


  



