const handleMakerSubmit = async (overrideDuplicate = false) => {
    if (!makerPayload || !makerFormValid) return;
    setIsMakerSubmitting(true);

    const endpoint = '/shared-services/api/payment/api/payments';
    const payload = {
      ...makerPayload,
      loginUser: soeId,
      overrideDuplicateFlag: overrideDuplicate ? 'Y' : 'N'
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'SOEID': soeId
        },
        body: JSON.stringify(payload)
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      // -------------------------------------------------------------
      // 1. FAILURE RESPONSE HANDLING (HTTP 4xx / 5xx)
      // -------------------------------------------------------------
      if (!res.ok) {
        // Optional duplicate override prompt
        if (res.status === 400 && data?.errorCode === 'DUPLICATE_PAYMENT') {
          if (window.confirm(`Warning: Similar payment exists with ID ${data.referenceId || 'N/A'}. Do you want to override and submit anyway?`)) {
            await handleMakerSubmit(true);
            return;
          }
        }

        const errorMessage = data?.error || data?.message || `Payment creation failed (${res.status})`;
        
        setModalResponse({
          title: 'MAKER RECORD NOT CREATED',
          referenceId: data?.referenceId || data?.transactionId || 'N/A',
          amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
          status: 'FAILED',
          message: errorMessage,
          color: '#dc2626'
        });
        return;
      }

      // -------------------------------------------------------------
      // 2. SUCCESS RESPONSE HANDLING (HTTP 200 / 201)
      // -------------------------------------------------------------
      setModalResponse({
        title: 'MAKER RECORD SAVED',
        referenceId: data.referenceId || data.transactionId || data.id || 'N/A',
        amount: `${makerPayload.instructedAmountCurrencyCode || 'USD'} ${makerPayload.instructedAmount}`,
        status: data.status || 'SUBMITTED',
        message: 'Payment record saved successfully !',
        color: '#059669'
      });

    } catch (err: any) {
      // -------------------------------------------------------------
      // 3. NETWORK / UNCAUGHT CLIENT ERROR HANDLING
      // -------------------------------------------------------------
      console.error('Maker submission network/client error:', err);
      setModalResponse({
        title: 'MAKER RECORD NOT CREATED',
        referenceId: 'N/A',
        amount: `${makerPayload?.instructedAmountCurrencyCode || 'USD'} ${makerPayload?.instructedAmount || 0}`,
        status: 'FAILED',
        message: err?.message || 'Network error: Unable to connect to payment services.',
        color: '#dc2626'
      });
    } finally {
      setIsMakerSubmitting(false);
    }
  };