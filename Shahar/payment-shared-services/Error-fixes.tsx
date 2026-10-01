//Step 1: Move fetchDetailsForAction to InstructionDetailPage.tsx
// In InstructionDetailPage.tsx, right where you fetch the instruction 
// data or in an effect on page load:


// Inside InstructionDetailPage.tsx:
useEffect(() => {
    if (!instructionId) return;
  
    const loadPaymentGridStatus = async () => {
      try {
        const endpoint = '/nextgengab/api/api/v1/gab/payments/payment/details-all-stage';
        const res = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            SOEID: currentUserId,
          },
          body: JSON.stringify({
            instructionId: String(instructionId),
            applicationName: 'GAB',
            moduleName: 'GAB-LATAM',
          }),
        });
  
        if (res.ok) {
          const details = await res.json();
          const detailsList = Array.isArray(details) ? details : [details];
          
          // Merge directly into the rows displayed in NamPaymentInfoCard
          setPaymentRows((prevRows) => mergeAccountsWithActionDetails(prevRows, detailsList));
        }
      } catch (err) {
        console.error('Failed to load details-all-stage at page level:', err);
      }
    };
  
    loadPaymentGridStatus();
  }, [instructionId]);


  