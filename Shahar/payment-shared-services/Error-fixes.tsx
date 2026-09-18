// 1. API Service Function
// Add this function to your payment service file (or create 
// it alongside createMakerPayment):

export interface PaymentDetailsForActionPayload {
  application: string;
  module: string;
  action: string;
  checker: string;
  dualBlindlyModel: any | null;
}

export const submitPaymentDetailsForAction = async (
  payload?: Partial<PaymentDetailsForActionPayload>
) => {
  const requestBody: PaymentDetailsForActionPayload = {
    application: 'GAB',
    module: 'GAB-LATAM',
    action: payload?.action || 'APPROVED',
    checker: payload?.checker || '',
    dualBlindlyModel: payload?.dualBlindlyModel ?? null,
  };

  const response = await fetch(
    '/shared-services/api/payment/api/payments/payment/details-for-action',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(
      `details-for-action failed with status ${response.status}`
    );
  }

  return response.json();
};


// 2. Integration in PaymentParent.tsx
// Trigger the new API call immediately after createMakerPayment succeeds:


const handleMakerSubmit = async (isDraft: boolean = false) => {
  try {
    setIsSubmitting(true);

    // 1. Submit primary maker payment
    const response = await createMakerPayment(currentFormPayloadRef.current);

    // 2. Call details-for-action
    try {
      await submitPaymentDetailsForAction({
        application: 'GAB',
        module: 'GAB-LATAM',
        action: 'APPROVED',
        checker: '',
        dualBlindlyModel: null,
      });
    } catch (actionErr) {
      console.warn('details-for-action call failed:', actionErr);
    }

    // 3. Resolve Reference ID & trigger success modal
    const refId =
      response?.data?.referenceId ||
      response?.data?.paymentReferenceId ||
      response?.data?.id ||
      'N/A';

    onPaymentSuccess?.(refId, currentFormPayloadRef.current);
  } catch (err: any) {
    console.error('Payment submission failed:', err);
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Payment submission failed';
    onPaymentError?.(msg);
  } finally {
    setIsSubmitting(false);
  }
};


